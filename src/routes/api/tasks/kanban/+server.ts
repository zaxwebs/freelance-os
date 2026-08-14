import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PAGE_SIZE } from '$lib/server/pagination';
import { getCurrentUser } from '$lib/server/workspace';
const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;

export const GET: RequestHandler = async ({ locals: { supabase }, url }) => {
	const user = await getCurrentUser(supabase);
	if (!user) return json({ message: 'Sign in to load more tasks.' }, { status: 401 });

	const status = url.searchParams.get('status') ?? '';
	const requestedOffset = Number.parseInt(url.searchParams.get('offset') ?? '0', 10);
	const offset = Number.isFinite(requestedOffset) && requestedOffset >= 0 ? requestedOffset : 0;

	if (!TASK_STATUSES.includes(status as (typeof TASK_STATUSES)[number])) {
		return json({ message: 'Invalid task status.' }, { status: 400 });
	}

	const { data, count, error } = await supabase
		.from('tasks')
		.select('*', { count: 'exact' })
	.eq('user_id', user.id)
	.eq('status', status)
	.order('created_at', { ascending: false })
	.order('id', { ascending: false })
	.range(offset, offset + PAGE_SIZE - 1);

	if (error) return json({ message: error.message }, { status: 500 });

	const tasks = data ?? [];
	return json({ tasks, total: count ?? 0, hasMore: offset + tasks.length < (count ?? 0) });
};
