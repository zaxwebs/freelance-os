import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getCurrentUser } from '$lib/server/workspace';
import { isSupportedCurrency } from '$lib/server/finance';

export const actions: Actions = {
	createClient: async ({ request, locals: { supabase } }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in before creating a client.' });
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
		const { data, error } = await supabase.from('clients').insert({ user_id: user.id, name, company, email, billing_address: billingAddress, tax_id_label: taxIdLabel, tax_id: taxId, default_currency_code: defaultCurrencyCode }).select('id').single();
		if (error) return fail(400, { message: error.message });
		redirect(303, `/clients/${data.id}`);
	}
};
