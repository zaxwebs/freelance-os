import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import type { LayoutLoad } from './$types';
import { getSupabaseConfig } from '$lib/supabase/env';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
	depends('supabase:auth');
	const { url, publishableKey } = getSupabaseConfig();

	const supabase = isBrowser()
		? createBrowserClient(url, publishableKey, {
				global: { fetch }
			})
		: createServerClient(url, publishableKey, {
				global: { fetch },
				cookies: {
					getAll: () => data.cookies
				}
			});

	const { data: claimsData, error } = await supabase.auth.getClaims();

	return {
		supabase,
		claims: error ? null : claimsData?.claims ?? null
	};
};
