import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { getCurrentUser, getWorkspaceData } from '$lib/server/workspace';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const user = await getCurrentUser(supabase);
	if (!user) return { clients: [], projects: [], tasks: [] };
	return getWorkspaceData(supabase);
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

		const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId);
		if (error) return fail(400, { message: error.message });
		return { success: true };
	}
};
