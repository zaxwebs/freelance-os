import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { PAGE_SIZE } from '$lib/server/pagination';
import { getCurrentUser } from '$lib/server/workspace';

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	const user = await getCurrentUser(supabase);
	const projectId = url.searchParams.get('project')?.trim() || 'all';
	if (!user) return { tasks: [], projects: [], projectId, taskCounts: { todo: 0, in_progress: 0, done: 0 }, pageSize: PAGE_SIZE };

	const taskQuery = (status: string) => {
		let query = supabase.from('tasks').select('*', { count: 'exact' }).eq('user_id', user.id).eq('status', status);
		if (projectId !== 'all') query = query.eq('project_id', projectId);
		return query.order('created_at', { ascending: false }).order('id', { ascending: false }).range(0, PAGE_SIZE - 1);
	};

	const [todoResult, inProgressResult, doneResult, projectsResult] = await Promise.all([
		taskQuery('todo'),
		taskQuery('in_progress'),
		taskQuery('done'),
		supabase.from('projects').select('*').order('name')
	]);

	if (todoResult.error) throw todoResult.error;
	if (inProgressResult.error) throw inProgressResult.error;
	if (doneResult.error) throw doneResult.error;
	if (projectsResult.error) throw projectsResult.error;

	return {
		tasks: [...(todoResult.data ?? []), ...(inProgressResult.data ?? []), ...(doneResult.data ?? [])],
		projects: projectsResult.data ?? [],
		projectId,
		taskCounts: {
			todo: todoResult.count ?? 0,
			in_progress: inProgressResult.count ?? 0,
			done: doneResult.count ?? 0
		},
		pageSize: PAGE_SIZE
	};
};

export const actions: Actions = {
	updateTaskStatus: async ({ request, locals: { supabase } }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in to update tasks.' });

		const formData = await request.formData();
		const taskId = String(formData.get('task_id') ?? '');
		const status = String(formData.get('status') ?? '');
		if (!taskId || !['todo', 'in_progress', 'done'].includes(status)) {
			return fail(400, { message: 'Invalid task update.' });
		}

		const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId).eq('user_id', user.id);
		if (error) return fail(400, { message: error.message });

		return { success: true };
	}
};
