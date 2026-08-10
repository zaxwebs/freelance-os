import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getCurrentUser } from '$lib/server/workspace';

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
	const user = await getCurrentUser(supabase);
	if (!user) return { client: null, projects: [], tasks: [] };
	const clientResult = await supabase.from('clients').select('*').eq('id', params.id).single();
	if (clientResult.error) error(404, 'Client not found');
	const projectsResult = await supabase.from('projects').select('*').eq('client_id', params.id).order('created_at', { ascending: false });
	if (projectsResult.error) throw projectsResult.error;
	const projectIds = (projectsResult.data ?? []).map((project) => project.id);
	const tasksResult = projectIds.length ? await supabase.from('tasks').select('*').in('project_id', projectIds).order('due_date', { ascending: true, nullsFirst: false }) : { data: [], error: null };
	if (tasksResult.error) throw tasksResult.error;
	return { client: clientResult.data, projects: projectsResult.data ?? [], tasks: tasksResult.data ?? [] };
};

export const actions: Actions = {
	updateClient: async ({ request, locals: { supabase }, params }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in to update clients.' });
		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const company = String(formData.get('company') ?? '').trim() || null;
		const email = String(formData.get('email') ?? '').trim() || null;
		if (!name) return fail(400, { message: 'Client name is required.' });
		const { error: updateError } = await supabase.from('clients').update({ name, company, email }).eq('id', params.id);
		if (updateError) return fail(400, { message: updateError.message });
		return { success: true, message: 'Client updated.' };
	},
	deleteClient: async ({ locals: { supabase }, params }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in to delete clients.' });
		const { error: deleteError } = await supabase.from('clients').delete().eq('id', params.id);
		if (deleteError) return fail(400, { message: deleteError.message });
		redirect(303, '/clients');
	}
};
