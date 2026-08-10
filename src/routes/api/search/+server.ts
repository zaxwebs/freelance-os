import { json } from '@sveltejs/kit';
import { searchWorkspace } from '$lib/server/search';
import { getCurrentUser } from '$lib/server/workspace';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals: { supabase }, url }) => {
	const user = await getCurrentUser(supabase);
	if (!user) return json({ message: 'Sign in to search your workspace.' }, { status: 401 });

	return json(await searchWorkspace(supabase, url.searchParams.get('q') ?? '', 6));
};
