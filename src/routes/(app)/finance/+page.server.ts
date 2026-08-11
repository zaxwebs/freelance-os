import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getMinorUnits, parseMoney, supportedCurrencies } from '$lib/app/currency';
import { convertBaseAmount, defaultFinanceCurrency, getDisplayCurrency, getDisplayInvoiceStatus, getExchangeRate, isSupportedCurrency, isValidDate } from '$lib/server/finance';
import { getCurrentUser } from '$lib/server/workspace';
import { getPagination, PAGE_SIZE, parsePage } from '$lib/server/pagination';

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	const user = await getCurrentUser(supabase);
	if (!user) throw redirect(303, '/');

	const requestedPage = parsePage(url.searchParams.get('page'));
	const transactionCountResult = await supabase.from('finance_transactions').select('id', { count: 'exact', head: true });
	if (transactionCountResult.error) throw transactionCountResult.error;
	const pagination = getPagination(requestedPage, transactionCountResult.count ?? 0, PAGE_SIZE);
	const [displayCurrency, transactionsResult, allTransactionsResult, clientsResult, projectsResult, invoicesResult, allInvoicesResult, expensesResult, allExpensesResult] = await Promise.all([
		getDisplayCurrency(supabase, user.id),
		supabase.from('finance_transactions').select('*').order('transaction_date', { ascending: false }).order('created_at', { ascending: false }).range((pagination.page - 1) * PAGE_SIZE, pagination.page * PAGE_SIZE - 1),
		supabase.from('finance_transactions').select('*'),
		supabase.from('clients').select('id,name').order('name'),
		supabase.from('projects').select('id,name').order('name'),
		supabase.from('invoices').select('*').order('issue_date', { ascending: false }).limit(4),
		supabase.from('invoices').select('*'),
		supabase.from('finance_expenses').select('*').order('expense_date', { ascending: false }).limit(4),
		supabase.from('finance_expenses').select('*')
	]);

	if (transactionsResult.error) throw transactionsResult.error;
	if (allTransactionsResult.error) throw allTransactionsResult.error;
	if (clientsResult.error) throw clientsResult.error;
	if (projectsResult.error) throw projectsResult.error;
	if (invoicesResult.error) throw invoicesResult.error;
	if (allInvoicesResult.error) throw allInvoicesResult.error;
	if (expensesResult.error) throw expensesResult.error;
	if (allExpensesResult.error) throw allExpensesResult.error;
	const displayRate = await getExchangeRate(supabase, user.id, defaultFinanceCurrency, displayCurrency);

	const clientNames = new Map((clientsResult.data ?? []).map((client) => [client.id, client.name]));
	const projectNames = new Map((projectsResult.data ?? []).map((project) => [project.id, project.name]));
	const mapTransaction = (transaction: NonNullable<typeof transactionsResult.data>[number]) => ({
		...transaction,
		displayAmount: convertBaseAmount(transaction.base_amount, displayRate.rate, displayCurrency),
		clientName: transaction.client_id ? clientNames.get(transaction.client_id) ?? null : null,
		projectName: transaction.project_id ? projectNames.get(transaction.project_id) ?? null : null
	});
	const transactions = (transactionsResult.data ?? []).map(mapTransaction);
	const allTransactions = (allTransactionsResult.data ?? []).map(mapTransaction);
	const mapInvoice = (invoice: NonNullable<typeof invoicesResult.data>[number]) => ({
		...invoice,
		displayStatus: getDisplayInvoiceStatus(invoice.status, invoice.due_date, Number(invoice.amount_paid), Number(invoice.total)),
		displayTotal: convertBaseAmount(invoice.base_total, displayRate.rate, displayCurrency),
		displayAmountPaid: convertBaseAmount(invoice.base_amount_paid, displayRate.rate, displayCurrency)
	});
	const invoices = (invoicesResult.data ?? []).map(mapInvoice);
	const allInvoices = (allInvoicesResult.data ?? []).map(mapInvoice);
	const mapExpense = (expense: NonNullable<typeof expensesResult.data>[number]) => ({ ...expense, displayAmount: convertBaseAmount(expense.base_amount, displayRate.rate, displayCurrency) });
	const expenses = (expensesResult.data ?? []).map(mapExpense);
	const allExpenses = (allExpensesResult.data ?? []).map(mapExpense);
	const invoiceSummary = {
		invoiced: allInvoices.filter((invoice) => invoice.displayStatus !== 'void').reduce((sum, invoice) => sum + invoice.displayTotal, 0),
		collected: allInvoices.reduce((sum, invoice) => sum + invoice.displayAmountPaid, 0),
		outstanding: allInvoices.filter((invoice) => invoice.displayStatus !== 'void' && invoice.displayStatus !== 'paid').reduce((sum, invoice) => sum + invoice.displayTotal - invoice.displayAmountPaid, 0),
		overdue: allInvoices.filter((invoice) => invoice.displayStatus === 'overdue').reduce((sum, invoice) => sum + invoice.displayTotal - invoice.displayAmountPaid, 0)
	};
	const expenseTotal = allExpenses.reduce((sum, expense) => sum + expense.displayAmount, 0);

	const monthKey = new Date().toISOString().slice(0, 7);
	const summary = allTransactions.reduce(
		(acc, transaction) => {
			const amount = convertBaseAmount(transaction.base_amount, displayRate.rate, displayCurrency);
			if (transaction.type === 'income') acc.income += amount;
			if (transaction.type === 'expense') acc.expenses += amount;
			if (transaction.transaction_date.slice(0, 7) === monthKey) {
				if (transaction.type === 'income') acc.monthIncome += amount;
				if (transaction.type === 'expense') acc.monthExpenses += amount;
			}
			return acc;
		},
		{ income: 0, expenses: 0, monthIncome: 0, monthExpenses: 0 }
	);

	return {
		baseCurrency: defaultFinanceCurrency,
		displayCurrency,
		currencies: supportedCurrencies,
		clients: clientsResult.data ?? [],
		projects: projectsResult.data ?? [],
		transactions,
		invoices,
		expenses,
		pagination,
		invoiceSummary,
		expenseTotal: expenseTotal + summary.expenses,
		summary: { ...summary, net: summary.income - summary.expenses }
	};
};

export const actions: Actions = {
	createTransaction: async ({ request, locals: { supabase } }) => {
		const user = await getCurrentUser(supabase);
		if (!user) throw redirect(303, '/');

		const formData = await request.formData();
		const type = String(formData.get('type') ?? '').trim();
		const description = String(formData.get('description') ?? '').trim();
		const currencyCode = String(formData.get('currency_code') ?? '').trim().toUpperCase();
		const amount = parseMoney(String(formData.get('amount') ?? ''), currencyCode);
		const transactionDate = String(formData.get('transaction_date') ?? '').trim();
		const clientId = String(formData.get('client_id') ?? '').trim() || null;
		const projectId = String(formData.get('project_id') ?? '').trim() || null;
		const notes = String(formData.get('notes') ?? '').trim() || null;
		const baseCurrency = defaultFinanceCurrency;
		const submittedRate = Number(String(formData.get('exchange_rate') ?? ''));
		let exchangeRate = currencyCode === baseCurrency ? 1 : submittedRate;
		let exchangeRateSource = 'manual';

		if (!['income', 'expense'].includes(type)) return fail(400, { success: false, message: 'Choose income or expense.' });
		if (!description || description.length > 160) return fail(400, { success: false, message: 'Add a description up to 160 characters.' });
		if (!isSupportedCurrency(currencyCode)) return fail(400, { success: false, message: 'Choose a supported currency.' });
		if (!amount) return fail(400, { success: false, message: 'Enter a valid amount greater than zero.' });
		if (!isValidDate(transactionDate)) return fail(400, { success: false, message: 'Choose a valid transaction date.' });
		if (currencyCode !== baseCurrency && (!Number.isFinite(exchangeRate) || exchangeRate <= 0)) {
			try {
				const snapshot = await getExchangeRate(supabase, user.id, currencyCode, baseCurrency, transactionDate);
				exchangeRate = snapshot.rate;
				exchangeRateSource = snapshot.source;
			} catch {
				return fail(400, { success: false, message: `Could not get a ${currencyCode} to ${baseCurrency} exchange rate. Enter one manually or try again.` });
			}
		}
		if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) return fail(400, { success: false, message: 'Enter a valid exchange rate.' });

		const baseAmount = Number((amount * exchangeRate).toFixed(getMinorUnits(baseCurrency)));
		const { error } = await supabase.from('finance_transactions').insert({
			user_id: user.id,
			type,
			description,
			amount,
			currency_code: currencyCode,
			base_amount: baseAmount,
			base_currency_code: baseCurrency,
			exchange_rate: exchangeRate,
			exchange_rate_date: transactionDate,
			exchange_rate_source: exchangeRateSource,
			transaction_date: transactionDate,
			client_id: clientId,
			project_id: projectId,
			notes
		});
		if (error) return fail(400, { success: false, message: error.message });
		return { success: true, message: 'Finance entry added.' };
	}
};
