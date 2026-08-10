import { normalizeSearchQuery, searchWorkspace } from '$lib/server/search';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	const query = normalizeSearchQuery(url.searchParams.get('q'));
	return { query, results: await searchWorkspace(supabase, query, 20) };
};
