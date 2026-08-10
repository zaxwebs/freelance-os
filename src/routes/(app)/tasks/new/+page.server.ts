import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getCurrentUser } from '$lib/server/workspace';

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	const user = await getCurrentUser(supabase);
	if (!user) return { projects: [], defaultProjectId: url.searchParams.get('project') ?? '' };
	const { data: projects, error } = await supabase.from('projects').select('*').order('name');
	if (error) throw error;
	return { projects: projects ?? [], defaultProjectId: url.searchParams.get('project') ?? '' };
};

export const actions: Actions = {
	createTask: async ({ request, locals: { supabase } }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in before creating a task.' });
		const formData = await request.formData();
		const title = String(formData.get('title') ?? '').trim();
		const projectId = String(formData.get('project_id') ?? '').trim() || null;
		const dueDate = String(formData.get('due_date') ?? '').trim() || null;
		const description = String(formData.get('description') ?? '').trim() || null;
		const priority = String(formData.get('priority') ?? 'medium');
		if (!title) return fail(400, { message: 'Task title is required.' });
		if (!['low', 'medium', 'high', 'urgent'].includes(priority)) return fail(400, { message: 'Choose a valid priority.' });
		const { error } = await supabase.from('tasks').insert({ user_id: user.id, title, project_id: projectId, due_date: dueDate, description, priority });
		if (error) return fail(400, { message: error.message });
		redirect(303, '/tasks');
	}
};
