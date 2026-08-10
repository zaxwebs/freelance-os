import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getCurrentUser } from '$lib/server/workspace';

export const actions: Actions = {
	createClient: async ({ request, locals: { supabase } }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in before creating a client.' });
		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const company = String(formData.get('company') ?? '').trim() || null;
		const email = String(formData.get('email') ?? '').trim() || null;
		if (!name) return fail(400, { message: 'Client name is required.' });
		const { data, error } = await supabase.from('clients').insert({ user_id: user.id, name, company, email }).select('id').single();
		if (error) return fail(400, { message: error.message });
		redirect(303, `/clients/${data.id}`);
	}
};
