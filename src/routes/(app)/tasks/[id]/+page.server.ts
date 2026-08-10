import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getCurrentUser } from '$lib/server/workspace';

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
	const user = await getCurrentUser(supabase);
	if (!user) return { task: null, projects: [] };
	const [taskResult, projectsResult] = await Promise.all([
		supabase.from('tasks').select('*').eq('id', params.id).single(),
		supabase.from('projects').select('*').order('name')
	]);
	if (taskResult.error) error(404, 'Task not found');
	if (projectsResult.error) throw projectsResult.error;
	return { task: taskResult.data, projects: projectsResult.data ?? [] };
};

export const actions: Actions = {
	updateTask: async ({ request, locals: { supabase }, params }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in to update tasks.' });
		const formData = await request.formData();
		const title = String(formData.get('title') ?? '').trim();
		const projectId = String(formData.get('project_id') ?? '').trim() || null;
		const dueDate = String(formData.get('due_date') ?? '').trim() || null;
		const description = String(formData.get('description') ?? '').trim() || null;
		const status = String(formData.get('status') ?? 'todo');
		const priority = String(formData.get('priority') ?? 'medium');
		if (!title) return fail(400, { message: 'Task title is required.' });
		if (!['todo', 'in_progress', 'done'].includes(status) || !['low', 'medium', 'high', 'urgent'].includes(priority)) return fail(400, { message: 'Choose valid task values.' });
		const { error: updateError } = await supabase.from('tasks').update({ title, project_id: projectId, due_date: dueDate, description, status, priority }).eq('id', params.id);
		if (updateError) return fail(400, { message: updateError.message });
		return { success: true, message: 'Task updated.' };
	},
	deleteTask: async ({ locals: { supabase }, params }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in to delete tasks.' });
		const { error: deleteError } = await supabase.from('tasks').delete().eq('id', params.id);
		if (deleteError) return fail(400, { message: deleteError.message });
		redirect(303, '/tasks');
	}
};
