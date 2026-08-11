import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getCurrentUser } from '$lib/server/workspace';
import { convertBaseAmount, defaultFinanceCurrency, getDisplayCurrency, getDisplayInvoiceStatus, getExchangeRate, isSupportedCurrency } from '$lib/server/finance';

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
	const user = await getCurrentUser(supabase);
	if (!user) return { client: null, projects: [], tasks: [], invoices: [], expenses: [], displayCurrency: 'USD', financeMetrics: { invoiced: 0, paid: 0, outstanding: 0, expenses: 0 } };
	const clientResult = await supabase.from('clients').select('*').eq('id', params.id).single();
	if (clientResult.error) error(404, 'Client not found');
	const projectsResult = await supabase.from('projects').select('*').eq('client_id', params.id).order('created_at', { ascending: false });
	if (projectsResult.error) throw projectsResult.error;
	const projectIds = (projectsResult.data ?? []).map((project) => project.id);
	const tasksResult = projectIds.length ? await supabase.from('tasks').select('*').in('project_id', projectIds).order('due_date', { ascending: true, nullsFirst: false }) : { data: [], error: null };
	if (tasksResult.error) throw tasksResult.error;
	const [invoicesResult, directExpensesResult, projectExpensesResult, displayCurrency] = await Promise.all([
		supabase.from('invoices').select('*').eq('client_id', params.id).order('issue_date', { ascending: false }),
		supabase.from('finance_expenses').select('*').eq('client_id', params.id).order('expense_date', { ascending: false }),
		projectIds.length ? supabase.from('finance_expenses').select('*').in('project_id', projectIds).order('expense_date', { ascending: false }) : Promise.resolve({ data: [], error: null }),
		getDisplayCurrency(supabase, user.id)
	]);
	if (invoicesResult.error) throw invoicesResult.error;
	if (directExpensesResult.error) throw directExpensesResult.error;
	if (projectExpensesResult.error) throw projectExpensesResult.error;
	const displayRate = await getExchangeRate(supabase, user.id, defaultFinanceCurrency, displayCurrency);
	const invoices = (invoicesResult.data ?? []).map((invoice) => ({ ...invoice, displayStatus: getDisplayInvoiceStatus(invoice.status, invoice.due_date, Number(invoice.amount_paid), Number(invoice.total)), displayTotal: convertBaseAmount(invoice.base_total, displayRate.rate, displayCurrency), displayAmountPaid: convertBaseAmount(invoice.base_amount_paid, displayRate.rate, displayCurrency) }));
	const invoiced = invoices.filter((invoice) => invoice.displayStatus !== 'void').reduce((sum, invoice) => sum + invoice.displayTotal, 0);
	const paid = invoices.reduce((sum, invoice) => sum + invoice.displayAmountPaid, 0);
	const expensesById = new Map([...(directExpensesResult.data ?? []), ...(projectExpensesResult.data ?? [])].map((expense) => [expense.id, expense]));
	const expenses = [...expensesById.values()].sort((a, b) => b.expense_date.localeCompare(a.expense_date)).map((expense) => ({ ...expense, displayAmount: convertBaseAmount(expense.base_amount, displayRate.rate, displayCurrency) }));
	const expenseTotal = expenses.reduce((sum, expense) => sum + expense.displayAmount, 0);
	return { client: clientResult.data, projects: projectsResult.data ?? [], tasks: tasksResult.data ?? [], invoices, expenses, displayCurrency, financeMetrics: { invoiced, paid, outstanding: invoiced - paid, expenses: expenseTotal } };
};

export const actions: Actions = {
	updateClient: async ({ request, locals: { supabase }, params }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in to update clients.' });
		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const company = String(formData.get('company') ?? '').trim() || null;
		const email = String(formData.get('email') ?? '').trim() || null;
		const billingAddress = String(formData.get('billing_address') ?? '').trim() || null;
		const taxIdLabel = String(formData.get('tax_id_label') ?? '').trim() || null;
		const taxId = String(formData.get('tax_id') ?? '').trim() || null;
		const defaultCurrencyCode = String(formData.get('default_currency_code') ?? 'USD').trim().toUpperCase();
		if (!name) return fail(400, { message: 'Client name is required.' });
		if (!isSupportedCurrency(defaultCurrencyCode)) return fail(400, { message: 'Choose a supported billing currency.' });
		const { error: updateError } = await supabase.from('clients').update({ name, company, email, billing_address: billingAddress, tax_id_label: taxIdLabel, tax_id: taxId, default_currency_code: defaultCurrencyCode }).eq('id', params.id);
		if (updateError) return fail(400, { message: updateError.message });
		return { success: true, message: 'Client updated.' };
	},
	deleteClient: async ({ locals: { supabase }, params }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in to delete clients.' });
		const { count, error: invoiceCountError } = await supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('client_id', params.id);
		if (invoiceCountError) return fail(400, { message: invoiceCountError.message });
		if (count) return fail(400, { message: 'This client has invoices. Void or archive the billing history before removing the client.' });
		const { error: deleteError } = await supabase.from('clients').delete().eq('id', params.id);
		if (deleteError) return fail(400, { message: deleteError.message });
		redirect(303, '/clients');
	}
};
