import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getCurrentUser } from '$lib/server/workspace';
import { isSupportedCurrency } from '$lib/server/finance';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const user = await getCurrentUser(supabase);
	if (!user) return { clients: [] };
	const { data: clients, error } = await supabase.from('clients').select('*').order('name');
	if (error) throw error;
	return { clients: clients ?? [] };
};

export const actions: Actions = {
	createProject: async ({ request, locals: { supabase } }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in before creating a project.' });
		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const clientId = String(formData.get('client_id') ?? '').trim() || null;
		const description = String(formData.get('description') ?? '').trim() || null;
		const billingCurrencyCode = String(formData.get('billing_currency_code') ?? '').trim().toUpperCase() || null;
		if (!name) return fail(400, { message: 'Project name is required.' });
		if (billingCurrencyCode && !isSupportedCurrency(billingCurrencyCode)) return fail(400, { message: 'Choose a supported project currency.' });
		const { data, error } = await supabase.from('projects').insert({ user_id: user.id, name, client_id: clientId, description, billing_currency_code: billingCurrencyCode }).select('id').single();
		if (error) return fail(400, { message: error.message });
		redirect(303, `/projects/${data.id}`);
	}
};
