import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { convertBaseAmount, defaultFinanceCurrency, getDisplayCurrency, getExchangeRate } from '$lib/server/finance';
import { getCurrentUser } from '$lib/server/workspace';
import { getPagination, PAGE_SIZE, parsePage } from '$lib/server/pagination';

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	const user = await getCurrentUser(supabase);
	if (!user) throw redirect(303, '/');
	const requestedPage = parsePage(url.searchParams.get('page'));
	const countResult = await supabase.from('finance_expenses').select('id', { count: 'exact', head: true });
	if (countResult.error) throw countResult.error;
	const pagination = getPagination(requestedPage, countResult.count ?? 0, PAGE_SIZE);
	const [expensesResult, allExpensesResult, clientsResult, projectsResult, displayCurrency] = await Promise.all([
		supabase.from('finance_expenses').select('*').order('expense_date', { ascending: false }).order('created_at', { ascending: false }).range((pagination.page - 1) * PAGE_SIZE, pagination.page * PAGE_SIZE - 1),
		supabase.from('finance_expenses').select('*'),
		supabase.from('clients').select('id,name').order('name'),
		supabase.from('projects').select('id,name').order('name'),
		getDisplayCurrency(supabase, user.id)
	]);
	if (expensesResult.error) throw expensesResult.error;
	if (allExpensesResult.error) throw allExpensesResult.error;
	if (clientsResult.error) throw clientsResult.error;
	if (projectsResult.error) throw projectsResult.error;
	const displayRate = await getExchangeRate(supabase, user.id, defaultFinanceCurrency, displayCurrency);
	const clientNames = new Map((clientsResult.data ?? []).map((client) => [client.id, client.name]));
	const projectNames = new Map((projectsResult.data ?? []).map((project) => [project.id, project.name]));
	const expenses = (expensesResult.data ?? []).map((expense) => ({
		...expense,
		displayAmount: convertBaseAmount(expense.base_amount, displayRate.rate, displayCurrency),
		clientName: expense.client_id ? clientNames.get(expense.client_id) ?? null : null,
		projectName: expense.project_id ? projectNames.get(expense.project_id) ?? null : null
	}));
	const allExpenses = (allExpensesResult.data ?? []).map((expense) => ({
		...expense,
		displayAmount: convertBaseAmount(expense.base_amount, displayRate.rate, displayCurrency)
	}));
	return {
		displayCurrency,
		expenses,
		pagination,
		metrics: {
			total: allExpenses.reduce((sum, expense) => sum + expense.displayAmount, 0),
			billable: allExpenses.filter((expense) => expense.billable && !expense.invoice_id).reduce((sum, expense) => sum + expense.displayAmount, 0),
			linked: allExpenses.filter((expense) => expense.project_id).reduce((sum, expense) => sum + expense.displayAmount, 0)
		}
	};
};
