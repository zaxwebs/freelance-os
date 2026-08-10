import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';
import { getSupabaseConfig } from '$lib/supabase/env';

export const handle: Handle = async ({ event, resolve }) => {
	const { url, publishableKey } = getSupabaseConfig();

	event.locals.supabase = createServerClient(
		url,
		publishableKey,
		{
			cookies: {
				getAll: () => event.cookies.getAll(),
				setAll: (cookiesToSet) => {
					cookiesToSet.forEach(({ name, value, options }) => {
						event.cookies.set(name, value, { ...options, path: '/' });
					});
				}
			}
		}
	);

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};
