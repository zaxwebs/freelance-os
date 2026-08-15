import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getCurrentUser, getProjectData } from '$lib/server/workspace';
import { convertBaseAmount, defaultFinanceCurrency, getDisplayCurrency, getDisplayInvoiceStatus, getExchangeRate, isSupportedCurrency } from '$lib/server/finance';

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
	const user = await getCurrentUser(supabase);
	if (!user) return { project: null, tasks: [], clients: [], invoices: [], expenses: [], contract: null, contractTemplates: [], displayCurrency: 'USD', financeMetrics: { invoiced: 0, paid: 0, outstanding: 0, expenses: 0, profit: 0 } };
	const [{ project, tasks }, clientsResult, invoicesResult, expensesResult, contractResult, contractTemplatesResult, displayCurrency] = await Promise.all([
		getProjectData(supabase, params.id),
		supabase.from('clients').select('*').order('name'),
		supabase.from('invoices').select('*').eq('project_id', params.id).order('issue_date', { ascending: false }),
		supabase.from('finance_expenses').select('*').eq('project_id', params.id).order('expense_date', { ascending: false }),
		supabase.from('contracts').select('id,project_id,name,start_date,end_date,status,content,template_id,created_at,updated_at').eq('project_id', params.id).maybeSingle(),
		supabase.from('contract_templates').select('id,name').order('created_at', { ascending: true }),
		getDisplayCurrency(supabase, user.id)
	]);
	if (clientsResult.error) throw clientsResult.error;
	if (invoicesResult.error) throw invoicesResult.error;
	if (expensesResult.error) throw expensesResult.error;
	if (contractResult.error) throw contractResult.error;
	if (contractTemplatesResult.error) throw contractTemplatesResult.error;
	if (!project) error(404, 'Project not found');
	const displayRate = await getExchangeRate(supabase, user.id, defaultFinanceCurrency, displayCurrency);
	const invoices = (invoicesResult.data ?? []).map((invoice) => ({ ...invoice, displayStatus: getDisplayInvoiceStatus(invoice.status, invoice.due_date, Number(invoice.amount_paid), Number(invoice.total)), displayTotal: convertBaseAmount(invoice.base_total, displayRate.rate, displayCurrency), displayAmountPaid: convertBaseAmount(invoice.base_amount_paid, displayRate.rate, displayCurrency) }));
	const expenses = (expensesResult.data ?? []).map((expense) => ({ ...expense, displayAmount: convertBaseAmount(expense.base_amount, displayRate.rate, displayCurrency) }));
	const invoiced = invoices.filter((invoice) => invoice.displayStatus !== 'void').reduce((sum, invoice) => sum + invoice.displayTotal, 0);
	const paid = invoices.reduce((sum, invoice) => sum + invoice.displayAmountPaid, 0);
	const expenseTotal = expenses.reduce((sum, expense) => sum + expense.displayAmount, 0);
	return { project, tasks, clients: clientsResult.data ?? [], invoices, expenses, contract: contractResult.data ?? null, contractTemplates: contractTemplatesResult.data ?? [], displayCurrency, financeMetrics: { invoiced, paid, outstanding: invoiced - paid, expenses: expenseTotal, profit: paid - expenseTotal } };
};

export const actions: Actions = {
	updateProject: async ({ request, locals: { supabase }, params }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in to update projects.' });
		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const clientId = String(formData.get('client_id') ?? '').trim() || null;
		const description = String(formData.get('description') ?? '').trim() || null;
		const status = String(formData.get('status') ?? 'active');
		const billingCurrencyCode = String(formData.get('billing_currency_code') ?? '').trim().toUpperCase() || null;
		if (!name) return fail(400, { message: 'Project name is required.' });
		if (!['active', 'on_hold', 'completed', 'archived'].includes(status)) return fail(400, { message: 'Choose a valid project status.' });
		if (billingCurrencyCode && !isSupportedCurrency(billingCurrencyCode)) return fail(400, { message: 'Choose a supported project currency.' });
		const { data: existingProject } = await supabase.from('projects').select('client_id').eq('id', params.id).single();
		if (existingProject?.client_id !== clientId) {
			const { count, error: invoiceCountError } = await supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('project_id', params.id);
			if (invoiceCountError) return fail(400, { message: invoiceCountError.message });
			if (count) return fail(400, { message: 'This project has invoices. Keep its client relationship stable while billing is attached.' });
		}
		const { error: updateError } = await supabase.from('projects').update({ name, client_id: clientId, description, status, billing_currency_code: billingCurrencyCode }).eq('id', params.id);
		if (updateError) return fail(400, { message: updateError.message });
		return { success: true, message: 'Project updated.' };
	},
	archiveProject: async ({ locals: { supabase }, params }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in to archive projects.' });
		const { error: archiveError } = await supabase.from('projects').update({ status: 'archived' }).eq('id', params.id);
		if (archiveError) return fail(400, { message: archiveError.message });
		redirect(303, `/projects/${params.id}`);
	},
	restoreProject: async ({ locals: { supabase }, params }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in to restore projects.' });
		const { error: restoreError } = await supabase.from('projects').update({ status: 'active' }).eq('id', params.id);
		if (restoreError) return fail(400, { message: restoreError.message });
		redirect(303, `/projects/${params.id}`);
	}
};
