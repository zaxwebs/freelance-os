import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getCurrentUser, getWorkspaceData } from '$lib/server/workspace';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const user = await getCurrentUser(supabase);
	if (!user) return { clients: [], projects: [], tasks: [] };
	return getWorkspaceData(supabase);
};

export const actions: Actions = {
	createProject: async ({ request, locals: { supabase } }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in before creating a project.' });
		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const clientId = String(formData.get('client_id') ?? '').trim() || null;
		const description = String(formData.get('description') ?? '').trim() || null;
		if (!name) return fail(400, { message: 'Project name is required.' });
		const { data, error } = await supabase.from('projects').insert({ user_id: user.id, name, client_id: clientId, description }).select('id').single();
		if (error) return fail(400, { message: error.message });
		redirect(303, `/projects/${data.id}`);
	}
};
