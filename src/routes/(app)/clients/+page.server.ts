import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getCurrentUser, getWorkspaceData } from '$lib/server/workspace';

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	const user = await getCurrentUser(supabase);
	if (!user) return { clients: [], projects: [], tasks: [], query: '' };
	const workspace = await getWorkspaceData(supabase);
	const query = url.searchParams.get('q')?.trim() ?? '';
	return { ...workspace, query };
};

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
