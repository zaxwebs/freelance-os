import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { supportedCurrencies, getMinorUnits } from '$lib/app/currency';
import { getEffectiveBillingCurrency, defaultFinanceCurrency, getExchangeRate, isSupportedCurrency, isValidDate } from '$lib/server/finance';
import { parseProposalLineItems, proposalTotals } from '$lib/server/proposals';
import { getAccountIdentity, getCurrentUser } from '$lib/server/workspace';

async function getProposalContext(supabase: Parameters<typeof getCurrentUser>[0], proposalId: string, user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) {
	const proposalResult = await supabase.from('proposals').select('*').eq('id', proposalId).single();
	if (proposalResult.error || !proposalResult.data) error(404, 'Proposal not found');
	const proposal = proposalResult.data;
	const [clientResult, lineItemsResult, settingsResult] = await Promise.all([
		supabase.from('clients').select('id,name,company,email,billing_address,tax_id_label,tax_id,default_currency_code').eq('id', proposal.client_id).single(),
		supabase.from('proposal_line_items').select('*').eq('proposal_id', proposal.id).order('position'),
		supabase.from('workspace_invoice_settings').select('business_name,legal_name,business_email,business_phone,business_website,business_address,tax_id_label,tax_id,footer_note,default_payment_terms_days,default_payment_instructions').maybeSingle()
	]);
	if (clientResult.error) throw clientResult.error;
	if (lineItemsResult.error) throw lineItemsResult.error;
	if (settingsResult.error) throw settingsResult.error;
	const clientsResult = await supabase.from('clients').select('id,name,company,default_currency_code').order('name');
	if (clientsResult.error) throw clientsResult.error;
	const accountIdentity = getAccountIdentity(user);
	return {
		proposal,
		client: clientResult.data,
		lineItems: lineItemsResult.data ?? [],
		clients: clientsResult.data ?? [],
		issuer: {
			name: settingsResult.data?.business_name ?? settingsResult.data?.legal_name ?? accountIdentity.name,
			legalName: settingsResult.data?.legal_name ?? null,
			email: settingsResult.data?.business_email ?? accountIdentity.email,
			phone: settingsResult.data?.business_phone ?? null,
			website: settingsResult.data?.business_website ?? null,
			address: settingsResult.data?.business_address ?? null,
			taxIdLabel: settingsResult.data?.tax_id_label ?? null,
			taxId: settingsResult.data?.tax_id ?? null,
			footerNote: settingsResult.data?.footer_note ?? null
		},
		settings: settingsResult.data
	};
}

function proposalFields(formData: FormData) {
	const issueDate = String(formData.get('issue_date') ?? '').trim();
	const validUntil = String(formData.get('valid_until') ?? '').trim() || null;
	const lineItemsResult = parseProposalLineItems(String(formData.get('line_items') ?? ''));
	return {
		clientId: String(formData.get('client_id') ?? '').trim(),
		title: String(formData.get('title') ?? '').trim(),
		overview: String(formData.get('overview') ?? '').trim() || null,
		issueDate,
		validUntil,
		submittedCurrencyCode: String(formData.get('currency_code') ?? '').trim().toUpperCase(),
		lineItemsResult,
		scope: String(formData.get('scope') ?? '').trim() || null,
		timeline: String(formData.get('timeline') ?? '').trim() || null,
		paymentTerms: String(formData.get('payment_terms') ?? '').trim() || null,
		notes: String(formData.get('notes') ?? '').trim() || null,
		terms: String(formData.get('terms') ?? '').trim() || null
	};
}

function validateProposalFields(fields: ReturnType<typeof proposalFields>) {
	if (!fields.clientId) return 'Choose a client.';
	if (!fields.title) return 'Add a proposal title.';
	if (!isValidDate(fields.issueDate) || (fields.validUntil && !isValidDate(fields.validUntil)) || (fields.validUntil && fields.validUntil < fields.issueDate)) return 'Choose valid dates, with the valid-until date on or after the issue date.';
	if ('error' in fields.lineItemsResult) return fields.lineItemsResult.error;
	return null;
}

export const load: PageServerLoad = async ({ locals: { supabase }, params, url }) => {
	const user = await getCurrentUser(supabase);
	if (!user) throw redirect(303, '/');
	const context = await getProposalContext(supabase, params.id, user);
	return { ...context, currencies: supportedCurrencies, editing: url.searchParams.get('edit') === '1' };
};

export const actions: Actions = {
	updateProposal: async ({ request, locals: { supabase }, params }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in before updating a proposal.' });
		const fields = proposalFields(await request.formData());
		const validationMessage = validateProposalFields(fields);
		if (validationMessage) return fail(400, { message: validationMessage });
		if ('error' in fields.lineItemsResult) return fail(400, { message: fields.lineItemsResult.error });
		const { data: existingProposal, error: existingError } = await supabase.from('proposals').select('status').eq('id', params.id).single();
		if (existingError || !existingProposal) return fail(404, { message: 'Proposal not found.' });
		if (existingProposal.status !== 'draft') return fail(400, { message: 'Only draft proposals can be edited.' });

		const clientResult = await supabase.from('clients').select('id,default_currency_code').eq('id', fields.clientId).single();
		if (clientResult.error || !clientResult.data) return fail(400, { message: 'Choose a valid client.' });
		const currencyCode = getEffectiveBillingCurrency(clientResult.data.default_currency_code, undefined, fields.submittedCurrencyCode || undefined);
		if (!isSupportedCurrency(currencyCode)) return fail(400, { message: 'Choose a supported currency.' });
		const totals = proposalTotals(fields.lineItemsResult.items);
		const { error: updateError } = await supabase.from('proposals').update({ client_id: fields.clientId, title: fields.title, overview: fields.overview, issue_date: fields.issueDate, valid_until: fields.validUntil, currency_code: currencyCode, subtotal: totals.subtotal, tax_total: totals.taxTotal, total: totals.total, scope: fields.scope, timeline: fields.timeline, payment_terms: fields.paymentTerms, notes: fields.notes, terms: fields.terms }).eq('id', params.id);
		if (updateError) return fail(400, { message: updateError.message });
		const { error: deleteError } = await supabase.from('proposal_line_items').delete().eq('proposal_id', params.id);
		if (deleteError) return fail(400, { message: deleteError.message });
		const { error: lineItemError } = await supabase.from('proposal_line_items').insert(fields.lineItemsResult.items.map((item, index) => ({ user_id: user.id, proposal_id: params.id, position: index, description: item.description, quantity: item.quantity, unit_price: item.unitPrice, tax_rate: item.taxRate, amount: item.amount })));
		if (lineItemError) return fail(400, { message: lineItemError.message });
		redirect(303, `/proposals/${params.id}`);
	},
	markSent: async ({ locals: { supabase }, params }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in before updating a proposal.' });
		const { data: proposal, error: proposalError } = await supabase.from('proposals').select('status').eq('id', params.id).single();
		if (proposalError || !proposal) return fail(404, { message: 'Proposal not found.' });
		if (proposal.status !== 'draft') return fail(400, { message: 'Only draft proposals can be marked as sent.' });
		const { error: updateError } = await supabase.from('proposals').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', params.id);
		if (updateError) return fail(400, { message: updateError.message });
		return { success: true, message: 'Proposal marked as sent.' };
	},
	accept: async ({ locals: { supabase }, params }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in before updating a proposal.' });
		const { data: proposal, error: proposalError } = await supabase.from('proposals').select('status,valid_until').eq('id', params.id).single();
		if (proposalError || !proposal) return fail(404, { message: 'Proposal not found.' });
		if (!['sent', 'viewed'].includes(proposal.status)) return fail(400, { message: 'Only sent proposals can be accepted.' });
		if (proposal.valid_until && proposal.valid_until < new Date().toISOString().slice(0, 10)) {
			await supabase.from('proposals').update({ status: 'expired' }).eq('id', params.id);
			return fail(400, { message: 'This proposal has expired. Extend its validity before accepting it.' });
		}
		const { error: updateError } = await supabase.from('proposals').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', params.id);
		if (updateError) return fail(400, { message: updateError.message });
		return { success: true, message: 'Proposal accepted.' };
	},
	decline: async ({ locals: { supabase }, params }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in before updating a proposal.' });
		const { data: proposal, error: proposalError } = await supabase.from('proposals').select('status').eq('id', params.id).single();
		if (proposalError || !proposal) return fail(404, { message: 'Proposal not found.' });
		if (!['sent', 'viewed'].includes(proposal.status)) return fail(400, { message: 'Only sent proposals can be declined.' });
		const { error: updateError } = await supabase.from('proposals').update({ status: 'declined', declined_at: new Date().toISOString() }).eq('id', params.id);
		if (updateError) return fail(400, { message: updateError.message });
		return { success: true, message: 'Proposal declined.' };
	},
	convert: async ({ request, locals: { supabase }, params }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in before converting a proposal.' });
		const formData = await request.formData();
		const projectName = String(formData.get('project_name') ?? '').trim();
		const createInvoice = formData.get('create_invoice') === 'on';
		const depositAmount = Number(String(formData.get('deposit_amount') ?? '').replace(/,/g, '').trim());
		const context = await getProposalContext(supabase, params.id, user);
		if (context.proposal.status !== 'accepted') return fail(400, { message: 'Only accepted proposals can be converted.' });
		if (context.proposal.converted_at) return fail(400, { message: 'This proposal has already been converted.' });
		if (createInvoice && (!Number.isFinite(depositAmount) || depositAmount <= 0 || depositAmount > Number(context.proposal.total) + 0.0001)) return fail(400, { message: 'Enter a deposit amount between zero and the proposal total.' });

		if (!projectName) return fail(400, { message: 'Add a project name before converting.' });
		const { data: project, error: projectError } = await supabase.from('projects').insert({ user_id: user.id, name: projectName, client_id: context.proposal.client_id, description: context.proposal.scope, billing_currency_code: context.proposal.currency_code }).select('id').single();
		if (projectError || !project) return fail(400, { message: projectError?.message ?? 'Could not create the project.' });
		const projectId = project.id;

		let invoiceId: string | null = null;
		if (createInvoice) {
			const issueDate = new Date().toISOString().slice(0, 10);
			const paymentTermsDays = Number(context.settings?.default_payment_terms_days ?? 14);
			const dueDate = new Date(Date.now() + paymentTermsDays * 86400000).toISOString().slice(0, 10);
			let exchangeRate;
			try {
				exchangeRate = await getExchangeRate(supabase, user.id, context.proposal.currency_code, defaultFinanceCurrency, issueDate);
			} catch {
				return fail(400, { message: `Could not get a ${context.proposal.currency_code} to ${defaultFinanceCurrency} exchange rate. Try again.` });
			}
			const baseAmount = Number((depositAmount * exchangeRate.rate).toFixed(getMinorUnits(defaultFinanceCurrency)));
			const snapshotAt = new Date().toISOString();
			const issuerSnapshot = { name: context.issuer.name, legal_name: context.issuer.legalName, email: context.issuer.email, phone: context.issuer.phone, website: context.issuer.website, address: context.issuer.address, tax_id_label: context.issuer.taxIdLabel, tax_id: context.issuer.taxId, footer_note: context.issuer.footerNote };
			const clientSnapshot = { name: context.client?.name ?? null, company: context.client?.company ?? null, email: context.client?.email ?? null, address: context.client?.billing_address ?? null, tax_id_label: context.client?.tax_id_label ?? null, tax_id: context.client?.tax_id ?? null };
			const invoiceNumber = `INV-${issueDate.slice(0, 4)}-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
			const { data: invoice, error: invoiceError } = await supabase.from('invoices').insert({ user_id: user.id, client_id: context.proposal.client_id, project_id: projectId, invoice_number: invoiceNumber, status: 'draft', issue_date: issueDate, due_date: dueDate, currency_code: context.proposal.currency_code, base_currency_code: defaultFinanceCurrency, exchange_rate_to_usd: exchangeRate.rate, exchange_rate_date: exchangeRate.rateDate, subtotal: depositAmount, tax_total: 0, discount_total: 0, total: depositAmount, base_subtotal: baseAmount, base_tax_total: 0, base_discount_total: 0, base_total: baseAmount, base_amount_paid: 0, notes: `Deposit for ${context.proposal.title}`, payment_instructions: context.settings?.default_payment_instructions ?? null, sent_at: null, issuer_snapshot: issuerSnapshot, client_snapshot: clientSnapshot, snapshot_at: snapshotAt }).select('id').single();
			if (invoiceError || !invoice) return fail(400, { message: invoiceError?.message ?? 'Could not create the deposit invoice.' });
			const { error: lineItemError } = await supabase.from('invoice_line_items').insert({ user_id: user.id, invoice_id: invoice.id, project_id: projectId, position: 0, description: `Deposit for ${context.proposal.title}`, quantity: 1, unit_price: depositAmount, tax_rate: 0, amount: depositAmount });
			if (lineItemError) return fail(400, { message: lineItemError.message });
			invoiceId = invoice.id;
		}

		const { error: conversionError } = await supabase.from('proposals').update({ converted_at: new Date().toISOString() }).eq('id', params.id);
		if (conversionError) return fail(400, { message: conversionError.message });
		redirect(303, invoiceId ? `/invoices/${invoiceId}` : `/projects/${projectId}`);
	}
};
