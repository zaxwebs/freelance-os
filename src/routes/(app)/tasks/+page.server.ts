import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getCurrentUser } from '$lib/server/workspace';

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	const user = await getCurrentUser(supabase);
	if (!user) return { tasks: [], projects: [], query: '', status: 'all', projectId: 'all' };

	const queryText = url.searchParams.get('q')?.trim() ?? '';
	const status = url.searchParams.get('status') ?? 'all';
	const projectId = url.searchParams.get('project') ?? 'all';
	let tasksQuery = supabase.from('tasks').select('*').order('due_date', { ascending: true, nullsFirst: false });

	if (queryText) tasksQuery = tasksQuery.ilike('title', `%${queryText}%`);
	if (status !== 'all' && ['todo', 'in_progress', 'done'].includes(status)) tasksQuery = tasksQuery.eq('status', status);
	if (projectId !== 'all') tasksQuery = tasksQuery.eq('project_id', projectId);

	const [tasksResult, projectsResult] = await Promise.all([
		tasksQuery,
		supabase.from('projects').select('*').order('name')
	]);
	if (tasksResult.error) throw tasksResult.error;
	if (projectsResult.error) throw projectsResult.error;

	return { tasks: tasksResult.data ?? [], projects: projectsResult.data ?? [], query: queryText, status, projectId };
};

export const actions: Actions = {
	createTask: async ({ request, locals: { supabase } }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in before creating a task.' });
		const formData = await request.formData();
		const title = String(formData.get('title') ?? '').trim();
		const projectId = String(formData.get('project_id') ?? '').trim() || null;
		const dueDate = String(formData.get('due_date') ?? '').trim() || null;
		const priority = String(formData.get('priority') ?? 'medium');
		if (!title) return fail(400, { message: 'Task title is required.' });
		if (!['low', 'medium', 'high', 'urgent'].includes(priority)) return fail(400, { message: 'Choose a valid priority.' });
		const { error } = await supabase.from('tasks').insert({ user_id: user.id, title, project_id: projectId, due_date: dueDate, priority });
		if (error) return fail(400, { message: error.message });
		return { success: true };
	},
	updateTaskStatus: async ({ request, locals: { supabase } }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in to update tasks.' });
		const formData = await request.formData();
		const taskId = String(formData.get('task_id') ?? '');
		const status = String(formData.get('status') ?? '');
		if (!taskId || !['todo', 'in_progress', 'done'].includes(status)) return fail(400, { message: 'Invalid task update.' });
		const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId);
		if (error) return fail(400, { message: error.message });
		return { success: true };
	}
};
