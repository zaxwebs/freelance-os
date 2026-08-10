import type { EmailOtpType } from '@supabase/supabase-js';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const tokenHash = url.searchParams.get('token_hash');
	const code = url.searchParams.get('code');
	const type = url.searchParams.get('type') as EmailOtpType | null;
	const requestedNext = url.searchParams.get('next') ?? '/overview';
	const next = requestedNext.startsWith('/') ? requestedNext : '/';

	let error = false;

	if (tokenHash && type) {
		const result = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
		error = Boolean(result.error);
	} else if (code) {
		const result = await supabase.auth.exchangeCodeForSession(code);
		error = Boolean(result.error);
	} else {
		error = true;
	}

	redirect(303, error ? '/?auth_error=1' : next);
};
