import { env } from '$env/dynamic/public';

export function getSupabaseConfig() {
	const url = env.PUBLIC_SUPABASE_URL;
	const publishableKey = env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;

	if (!url || !publishableKey) {
		throw new Error(
			'Supabase is not configured. Copy .env.example to .env and add PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_PUBLISHABLE_KEY.'
		);
	}

	return { url, publishableKey };
}
