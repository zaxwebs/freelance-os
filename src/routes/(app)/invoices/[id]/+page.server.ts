import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getCurrentUser } from '$lib/server/workspace';
import { convertBaseAmount, defaultFinanceCurrency, getDisplayCurrency, getDisplayInvoiceStatus, getExchangeRate, isValidDate } from '$lib/server/finance';
import { getMinorUnits } from '$lib/app/currency';

type SnapshotRecord = Record<string, unknown>;

function asSnapshotRecord(value: unknown): SnapshotRecord {
	return value && typeof value === 'object' && !Array.isArray(value) ? (value as SnapshotRecord) : {};
}

function snapshotText(snapshot: SnapshotRecord, key: string, fallback: string | null) {
	if (!Object.prototype.hasOwnProperty.call(snapshot, key)) return fallback;
	return typeof snapshot[key] === 'string' ? snapshot[key] : null;
}

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
	const user = await getCurrentUser(supabase);
	if (!user) throw redirect(303, '/');

	const invoiceResult = await supabase.from('invoices').select('*').eq('id', params.id).single();
	if (invoiceResult.error || !invoiceResult.data) error(404, 'Invoice not found');
	const invoice = invoiceResult.data;
	const [clientResult, projectResult, lineItemsResult, paymentsResult, displayCurrency, invoiceSettingsResult] = await Promise.all([
		supabase.from('clients').select('id,name,company,email,billing_address,tax_id_label,tax_id').eq('id', invoice.client_id).single(),
		invoice.project_id ? supabase.from('projects').select('id,name').eq('id', invoice.project_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
		supabase.from('invoice_line_items').select('*').eq('invoice_id', invoice.id).order('position'),
		supabase.from('invoice_payments').select('*').eq('invoice_id', invoice.id).order('payment_date', { ascending: false }).order('created_at', { ascending: false }),
		getDisplayCurrency(supabase, user.id),
		supabase.from('workspace_invoice_settings').select('business_name,legal_name,business_email,business_phone,business_website,business_address,tax_id_label,tax_id,footer_note').maybeSingle()
	]);
	if (clientResult.error) throw clientResult.error;
	if (projectResult.error) throw projectResult.error;
	if (lineItemsResult.error) throw lineItemsResult.error;
	if (paymentsResult.error) throw paymentsResult.error;
	if (invoiceSettingsResult.error) throw invoiceSettingsResult.error;
	const issuerSnapshot = asSnapshotRecord(invoice.issuer_snapshot);
	const clientSnapshot = asSnapshotRecord(invoice.client_snapshot);
	const issuer = {
		name: snapshotText(issuerSnapshot, 'name', invoiceSettingsResult.data?.business_name ?? invoiceSettingsResult.data?.legal_name ?? null),
		legalName: snapshotText(issuerSnapshot, 'legal_name', invoiceSettingsResult.data?.legal_name ?? null),
		email: snapshotText(issuerSnapshot, 'email', invoiceSettingsResult.data?.business_email ?? null),
		phone: snapshotText(issuerSnapshot, 'phone', invoiceSettingsResult.data?.business_phone ?? null),
		website: snapshotText(issuerSnapshot, 'website', invoiceSettingsResult.data?.business_website ?? null),
		address: snapshotText(issuerSnapshot, 'address', invoiceSettingsResult.data?.business_address ?? null),
		taxIdLabel: snapshotText(issuerSnapshot, 'tax_id_label', invoiceSettingsResult.data?.tax_id_label ?? null),
		taxId: snapshotText(issuerSnapshot, 'tax_id', invoiceSettingsResult.data?.tax_id ?? null),
		footerNote: snapshotText(issuerSnapshot, 'footer_note', invoiceSettingsResult.data?.footer_note ?? null)
	};
	const billTo = {
		name: snapshotText(clientSnapshot, 'name', clientResult.data?.name ?? null),
		company: snapshotText(clientSnapshot, 'company', clientResult.data?.company ?? null),
		email: snapshotText(clientSnapshot, 'email', clientResult.data?.email ?? null),
		address: snapshotText(clientSnapshot, 'address', clientResult.data?.billing_address ?? null),
		taxIdLabel: snapshotText(clientSnapshot, 'tax_id_label', clientResult.data?.tax_id_label ?? null),
		taxId: snapshotText(clientSnapshot, 'tax_id', clientResult.data?.tax_id ?? null)
	};
	const displayRate = await getExchangeRate(supabase, user.id, defaultFinanceCurrency, displayCurrency);
	const displayTotal = convertBaseAmount(invoice.base_total, displayRate.rate, displayCurrency);
	const displayAmountPaid = convertBaseAmount(invoice.base_amount_paid, displayRate.rate, displayCurrency);

	return {
		invoice: {
			...invoice,
			displayStatus: getDisplayInvoiceStatus(invoice.status, invoice.due_date, Number(invoice.amount_paid), Number(invoice.total)),
			displayTotal,
			displayAmountPaid,
			displayBalance: displayTotal - displayAmountPaid
		},
		displayCurrency,
		client: clientResult.data,
		issuer,
		billTo,
		project: projectResult.data,
		lineItems: lineItemsResult.data ?? [],
		payments: (paymentsResult.data ?? []).map((payment) => ({ ...payment, displayAmount: convertBaseAmount(payment.base_amount, displayRate.rate, displayCurrency) }))
	};
};

export const actions: Actions = {
	markSent: async ({ locals: { supabase }, params }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in before updating an invoice.' });
		const { data: invoice, error: invoiceError } = await supabase.from('invoices').select('status').eq('id', params.id).single();
		if (invoiceError || !invoice) return fail(404, { message: 'Invoice not found.' });
		if (invoice.status !== 'draft') return fail(400, { message: 'Only draft invoices can be marked as sent.' });
		const { error: updateError } = await supabase.from('invoices').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', params.id);
		if (updateError) return fail(400, { message: updateError.message });
		return { success: true, message: 'Invoice marked as sent.' };
	},
	recordPayment: async ({ request, locals: { supabase }, params }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in before recording a payment.' });
		const formData = await request.formData();
		const amount = Number(String(formData.get('amount') ?? '').replace(/,/g, '').trim());
		const paymentDate = String(formData.get('payment_date') ?? '').trim();
		const method = String(formData.get('method') ?? 'bank_transfer').trim();
		const reference = String(formData.get('reference') ?? '').trim() || null;
		const notes = String(formData.get('notes') ?? '').trim() || null;
		const { data: invoice, error: invoiceError } = await supabase.from('invoices').select('total,amount_paid,status,currency_code').eq('id', params.id).single();
		if (invoiceError || !invoice) return fail(404, { message: 'Invoice not found.' });
		const outstanding = Number(invoice.total) - Number(invoice.amount_paid);
		if (invoice.status === 'void') return fail(400, { message: 'Void invoices cannot receive payments.' });
		if (!Number.isFinite(amount) || amount <= 0) return fail(400, { message: 'Enter a payment amount greater than zero.' });
		if (amount > outstanding + 0.0001) return fail(400, { message: 'Payment cannot be greater than the outstanding balance.' });
		if (!isValidDate(paymentDate)) return fail(400, { message: 'Choose a valid payment date.' });
		if (!['bank_transfer', 'card', 'cash', 'check', 'other'].includes(method)) return fail(400, { message: 'Choose a valid payment method.' });
		let exchangeRate;
		try {
			exchangeRate = await getExchangeRate(supabase, user.id, invoice.currency_code, defaultFinanceCurrency, paymentDate);
		} catch {
			return fail(400, { message: `Could not get a ${invoice.currency_code} to ${defaultFinanceCurrency} exchange rate. Try again.` });
		}
		const baseAmount = Number((amount * exchangeRate.rate).toFixed(getMinorUnits(defaultFinanceCurrency)));
		const { error: paymentError } = await supabase.from('invoice_payments').insert({ user_id: user.id, invoice_id: params.id, amount: Number(amount.toFixed(4)), base_amount: baseAmount, base_currency_code: defaultFinanceCurrency, exchange_rate_to_usd: exchangeRate.rate, exchange_rate_date: exchangeRate.rateDate, payment_date: paymentDate, method, reference, notes });
		if (paymentError) return fail(400, { message: paymentError.message });
		return { success: true, message: 'Payment recorded.' };
	},
	voidInvoice: async ({ locals: { supabase }, params }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in before voiding an invoice.' });
		const { data: invoice, error: invoiceError } = await supabase.from('invoices').select('amount_paid,status').eq('id', params.id).single();
		if (invoiceError || !invoice) return fail(404, { message: 'Invoice not found.' });
		if (Number(invoice.amount_paid) > 0) return fail(400, { message: 'Paid invoices cannot be voided. Add a credit note workflow before changing this invoice.' });
		if (invoice.status === 'void') return { success: true, message: 'Invoice is already void.' };
		const { error: updateError } = await supabase.from('invoices').update({ status: 'void' }).eq('id', params.id);
		if (updateError) return fail(400, { message: updateError.message });
		return { success: true, message: 'Invoice voided.' };
	}
};
