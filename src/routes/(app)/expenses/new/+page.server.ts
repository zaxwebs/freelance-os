import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { defaultFinanceCurrency, getExchangeRate, isSupportedCurrency, isValidDate } from '$lib/server/finance';
import { getCurrentUser } from '$lib/server/workspace';
import { getMinorUnits, supportedCurrencies } from '$lib/app/currency';

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	const user = await getCurrentUser(supabase);
	if (!user) throw redirect(303, '/');
	const [clientsResult, projectsResult, baseCurrency] = await Promise.all([
		supabase.from('clients').select('id,name,company').order('name'),
		supabase.from('projects').select('id,name,client_id').order('name'),
		Promise.resolve(defaultFinanceCurrency)
	]);
	if (clientsResult.error) throw clientsResult.error;
	if (projectsResult.error) throw projectsResult.error;
	return { clients: clientsResult.data ?? [], projects: projectsResult.data ?? [], baseCurrency, currencies: supportedCurrencies, defaultClientId: url.searchParams.get('client') ?? '', defaultProjectId: url.searchParams.get('project') ?? '' };
};

export const actions: Actions = {
	createExpense: async ({ request, locals: { supabase } }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in before recording an expense.' });
		const formData = await request.formData();
		const description = String(formData.get('description') ?? '').trim();
		const category = String(formData.get('category') ?? 'Other').trim() || 'Other';
		const amount = Number(String(formData.get('amount') ?? '').replace(/,/g, '').trim());
		const currencyCode = String(formData.get('currency_code') ?? '').trim().toUpperCase();
		const expenseDate = String(formData.get('expense_date') ?? '').trim();
		const clientId = String(formData.get('client_id') ?? '').trim() || null;
		const projectId = String(formData.get('project_id') ?? '').trim() || null;
		const notes = String(formData.get('notes') ?? '').trim() || null;
		const billable = formData.get('billable') === 'on';
		const baseCurrency = defaultFinanceCurrency;
		const submittedRate = Number(String(formData.get('exchange_rate') ?? ''));
		let exchangeRate = currencyCode === baseCurrency ? 1 : submittedRate;

		if (!description || description.length > 160) return fail(400, { message: 'Add a description up to 160 characters.' });
		if (!isSupportedCurrency(currencyCode)) return fail(400, { message: 'Choose a supported currency.' });
		if (!Number.isFinite(amount) || amount <= 0) return fail(400, { message: 'Enter an expense amount greater than zero.' });
		if (!isValidDate(expenseDate)) return fail(400, { message: 'Choose a valid expense date.' });
		if (currencyCode !== baseCurrency && (!Number.isFinite(exchangeRate) || exchangeRate <= 0)) {
			try {
				exchangeRate = (await getExchangeRate(supabase, user.id, currencyCode, baseCurrency, expenseDate)).rate;
			} catch {
				return fail(400, { message: `Could not get a ${currencyCode} to ${baseCurrency} exchange rate. Enter one manually or try again.` });
			}
		}
		if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) return fail(400, { message: 'Enter a valid exchange rate.' });

		let resolvedClientId = clientId;
		if (projectId) {
			const { data: project } = await supabase.from('projects').select('id,client_id').eq('id', projectId).maybeSingle();
			if (!project || (clientId && project.client_id && project.client_id !== clientId)) return fail(400, { message: 'The selected project is not connected to this client.' });
			if (!resolvedClientId && project.client_id) resolvedClientId = project.client_id;
		}
		if (resolvedClientId) {
			const { data: client } = await supabase.from('clients').select('id').eq('id', resolvedClientId).maybeSingle();
			if (!client) return fail(400, { message: 'Choose a valid client.' });
		}

		const baseAmount = Number((amount * exchangeRate).toFixed(getMinorUnits(baseCurrency)));
		const { error } = await supabase.from('finance_expenses').insert({ user_id: user.id, client_id: resolvedClientId, project_id: projectId, description, category, amount: Number(amount.toFixed(getMinorUnits(currencyCode))), currency_code: currencyCode, base_amount: baseAmount, base_currency_code: baseCurrency, exchange_rate: exchangeRate, expense_date: expenseDate, billable, notes });
		if (error) return fail(400, { message: error.message });
		redirect(303, '/expenses');
	}
};
