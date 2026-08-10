import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getCurrentUser, getProjectData } from '$lib/server/workspace';

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
	const user = await getCurrentUser(supabase);
	if (!user) return { project: null, tasks: [], clients: [] };
	const [{ project, tasks }, clientsResult] = await Promise.all([
		getProjectData(supabase, params.id),
		supabase.from('clients').select('*').order('name')
	]);
	if (clientsResult.error) throw clientsResult.error;
	if (!project) error(404, 'Project not found');
	return { project, tasks, clients: clientsResult.data ?? [] };
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
		if (!name) return fail(400, { message: 'Project name is required.' });
		if (!['active', 'on_hold', 'completed', 'archived'].includes(status)) return fail(400, { message: 'Choose a valid project status.' });
		const { error: updateError } = await supabase.from('projects').update({ name, client_id: clientId, description, status }).eq('id', params.id);
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
