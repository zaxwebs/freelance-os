import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getAccountIdentity, getCurrentUser } from '$lib/server/workspace';
import { defaultFinanceCurrency, getEffectiveBillingCurrency, getExchangeRate, isSupportedCurrency, isValidDateRange } from '$lib/server/finance';
import { getMinorUnits, supportedCurrencies } from '$lib/app/currency';

type SubmittedLineItem = {
	description?: unknown;
	quantity?: unknown;
	unitPrice?: unknown;
	taxRate?: unknown;
};

function parseLineItems(value: string) {
	let parsed: unknown;
	try {
		parsed = JSON.parse(value);
	} catch {
		return { error: 'Add at least one valid line item.' } as const;
	}
	if (!Array.isArray(parsed) || parsed.length === 0) return { error: 'Add at least one line item.' } as const;

	const items = parsed.map((rawItem: SubmittedLineItem, index) => {
		const description = String(rawItem.description ?? '').trim();
		const quantity = Number(rawItem.quantity ?? 0);
		const unitPrice = Number(rawItem.unitPrice ?? 0);
		const taxRate = Number(rawItem.taxRate ?? 0);
		if (!description || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0 || !Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
			return { error: `Line ${index + 1} needs a description, valid quantity, rate, and tax.` };
		}
		const lineSubtotal = Number((quantity * unitPrice).toFixed(4));
		const lineTax = Number((lineSubtotal * (taxRate / 100)).toFixed(4));
		return { description, quantity, unitPrice, taxRate, amount: Number((lineSubtotal + lineTax).toFixed(4)), lineSubtotal, lineTax };
	});
	const invalid = items.find((item) => 'error' in item);
	if (invalid && 'error' in invalid) return { error: invalid.error } as const;
	return { items: items as Array<{ description: string; quantity: number; unitPrice: number; taxRate: number; amount: number; lineSubtotal: number; lineTax: number }> } as const;
}

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	const user = await getCurrentUser(supabase);
	if (!user) throw redirect(303, '/');
	const [clientsResult, projectsResult, invoiceSettingsResult] = await Promise.all([
		supabase.from('clients').select('id,name,company,email,billing_address,tax_id_label,tax_id,default_currency_code').order('name'),
		supabase.from('projects').select('id,name,client_id,billing_currency_code').order('name'),
		supabase.from('workspace_invoice_settings').select('default_payment_terms_days,default_payment_instructions').maybeSingle()
	]);
	if (clientsResult.error) throw clientsResult.error;
	if (projectsResult.error) throw projectsResult.error;
	if (invoiceSettingsResult.error) throw invoiceSettingsResult.error;
	return {
		clients: clientsResult.data ?? [],
		projects: projectsResult.data ?? [],
		currencies: supportedCurrencies,
		defaultClientId: url.searchParams.get('client') ?? '',
		defaultProjectId: url.searchParams.get('project') ?? '',
		defaultPaymentTermsDays: invoiceSettingsResult.data?.default_payment_terms_days ?? 14,
		defaultPaymentInstructions: invoiceSettingsResult.data?.default_payment_instructions ?? ''
	};
};

export const actions: Actions = {
	createInvoice: async ({ request, locals: { supabase } }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in before creating an invoice.' });

		const formData = await request.formData();
		const clientId = String(formData.get('client_id') ?? '').trim();
		const projectId = String(formData.get('project_id') ?? '').trim() || null;
		const issueDate = String(formData.get('issue_date') ?? '').trim();
		const dueDate = String(formData.get('due_date') ?? '').trim();
		const submittedCurrencyCode = String(formData.get('currency_code') ?? '').trim().toUpperCase();
		const notes = String(formData.get('notes') ?? '').trim() || null;
		const submittedPaymentInstructions = String(formData.get('payment_instructions') ?? '').trim() || null;
		const sendNow = formData.get('send_now') === 'on';
		const lineItemsResult = parseLineItems(String(formData.get('line_items') ?? ''));

		if (!clientId) return fail(400, { message: 'Choose a client.' });
		if (!isValidDateRange(issueDate, dueDate)) return fail(400, { message: 'Choose valid dates, with the due date on or after the issue date.' });
		if ('error' in lineItemsResult) return fail(400, { message: lineItemsResult.error });

		const [clientResult, projectResult, invoiceSettingsResult] = await Promise.all([
			supabase.from('clients').select('id,name,company,email,billing_address,tax_id_label,tax_id,default_currency_code').eq('id', clientId).single(),
			projectId ? supabase.from('projects').select('id,client_id,billing_currency_code').eq('id', projectId).maybeSingle() : Promise.resolve({ data: null, error: null }),
			supabase.from('workspace_invoice_settings').select('business_name,legal_name,business_email,business_phone,business_website,business_address,tax_id_label,tax_id,default_payment_instructions,footer_note').maybeSingle()
		]);
		if (clientResult.error) return fail(400, { message: clientResult.error.message });
		if (projectResult.error) return fail(400, { message: projectResult.error.message });
		if (invoiceSettingsResult.error) return fail(400, { message: invoiceSettingsResult.error.message });
		const client = clientResult.data;
		const project = projectResult.data;
		if (!client) return fail(400, { message: 'Choose a valid client.' });
		if (projectId && (!project || (project.client_id && project.client_id !== clientId))) return fail(400, { message: 'The selected project is not connected to this client.' });
		const currencyCode = getEffectiveBillingCurrency(client.default_currency_code, project?.billing_currency_code, submittedCurrencyCode || undefined);
		if (!isSupportedCurrency(currencyCode)) return fail(400, { message: 'Choose a supported currency.' });

		const items = lineItemsResult.items;
		const subtotal = Number(items.reduce((sum, item) => sum + item.lineSubtotal, 0).toFixed(4));
		const taxTotal = Number(items.reduce((sum, item) => sum + item.lineTax, 0).toFixed(4));
		const total = Number((subtotal + taxTotal).toFixed(4));
		let exchangeRate;
		try {
			exchangeRate = await getExchangeRate(supabase, user.id, currencyCode, defaultFinanceCurrency, issueDate);
		} catch {
			return fail(400, { message: `Could not get a ${currencyCode} to ${defaultFinanceCurrency} exchange rate. Try again.` });
		}
		const toBase = (value: number) => Number((value * exchangeRate.rate).toFixed(getMinorUnits(defaultFinanceCurrency)));
		const invoiceNumber = `INV-${issueDate.slice(0, 4)}-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
		const sentAt = sendNow ? new Date().toISOString() : null;
		const paymentInstructions = submittedPaymentInstructions ?? invoiceSettingsResult.data?.default_payment_instructions ?? null;
		const snapshotAt = new Date().toISOString();
		const accountIdentity = getAccountIdentity(user);
		const issuerSnapshot = {
			name: invoiceSettingsResult.data?.business_name ?? invoiceSettingsResult.data?.legal_name ?? accountIdentity.name,
			legal_name: invoiceSettingsResult.data?.legal_name ?? null,
			email: invoiceSettingsResult.data?.business_email ?? accountIdentity.email,
			phone: invoiceSettingsResult.data?.business_phone ?? null,
			website: invoiceSettingsResult.data?.business_website ?? null,
			address: invoiceSettingsResult.data?.business_address ?? null,
			tax_id_label: invoiceSettingsResult.data?.tax_id_label ?? null,
			tax_id: invoiceSettingsResult.data?.tax_id ?? null,
			footer_note: invoiceSettingsResult.data?.footer_note ?? null
		};
		const clientSnapshot = {
			name: client.name,
			company: client.company ?? null,
			email: client.email ?? null,
			address: client.billing_address ?? null,
			tax_id_label: client.tax_id_label ?? null,
			tax_id: client.tax_id ?? null
		};

		const { data: invoice, error: invoiceError } = await supabase.from('invoices').insert({
			user_id: user.id,
			client_id: clientId,
			project_id: projectId,
			invoice_number: invoiceNumber,
			status: sendNow ? 'sent' : 'draft',
			issue_date: issueDate,
			due_date: dueDate,
			currency_code: currencyCode,
			base_currency_code: defaultFinanceCurrency,
			exchange_rate_to_usd: exchangeRate.rate,
			exchange_rate_date: exchangeRate.rateDate,
			subtotal,
			tax_total: taxTotal,
			discount_total: 0,
			total,
			base_subtotal: toBase(subtotal),
			base_tax_total: toBase(taxTotal),
			base_discount_total: 0,
			base_total: toBase(total),
			base_amount_paid: 0,
			notes,
			payment_instructions: paymentInstructions,
			sent_at: sentAt,
			issuer_snapshot: issuerSnapshot,
			client_snapshot: clientSnapshot,
			snapshot_at: snapshotAt
		}).select('id').single();
		if (invoiceError || !invoice) return fail(400, { message: invoiceError?.message ?? 'Could not create the invoice.' });

		const { error: lineItemError } = await supabase.from('invoice_line_items').insert(items.map((item, index) => ({
			user_id: user.id,
			invoice_id: invoice.id,
			project_id: projectId,
			position: index,
			description: item.description,
			quantity: item.quantity,
			unit_price: item.unitPrice,
			tax_rate: item.taxRate,
			amount: item.amount
		})));
		if (lineItemError) {
			await supabase.from('invoices').delete().eq('id', invoice.id);
			return fail(400, { message: lineItemError.message });
		}

		redirect(303, `/invoices/${invoice.id}`);
	}
};
