import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { PAGE_SIZE } from '$lib/server/pagination';
import { getCurrentUser } from '$lib/server/workspace';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const user = await getCurrentUser(supabase);
	if (!user) return { tasks: [], projects: [], taskCounts: { todo: 0, in_progress: 0, done: 0 }, pageSize: PAGE_SIZE };

	const [todoResult, inProgressResult, doneResult, projectsResult] = await Promise.all([
		supabase.from('tasks').select('*', { count: 'exact' }).eq('user_id', user.id).eq('status', 'todo').order('created_at', { ascending: false }).order('id', { ascending: false }).range(0, PAGE_SIZE - 1),
		supabase.from('tasks').select('*', { count: 'exact' }).eq('user_id', user.id).eq('status', 'in_progress').order('created_at', { ascending: false }).order('id', { ascending: false }).range(0, PAGE_SIZE - 1),
		supabase.from('tasks').select('*', { count: 'exact' }).eq('user_id', user.id).eq('status', 'done').order('created_at', { ascending: false }).order('id', { ascending: false }).range(0, PAGE_SIZE - 1),
		supabase.from('projects').select('*').order('name')
	]);

	if (todoResult.error) throw todoResult.error;
	if (inProgressResult.error) throw inProgressResult.error;
	if (doneResult.error) throw doneResult.error;
	if (projectsResult.error) throw projectsResult.error;

	return {
		tasks: [...(todoResult.data ?? []), ...(inProgressResult.data ?? []), ...(doneResult.data ?? [])],
		projects: projectsResult.data ?? [],
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
