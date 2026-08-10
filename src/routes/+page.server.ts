import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (user) redirect(303, '/overview');

	return { authError: url.searchParams.get('auth_error') === '1' };
};

export const actions: Actions = {
	sendMagicLink: async ({ request, url, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '').trim();

		if (!/^\S+@\S+\.\S+$/.test(email)) {
			return fail(400, { message: 'Enter a valid email address.', email });
		}

		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: { emailRedirectTo: `${url.origin}/auth/confirm` }
		});

		if (error) return fail(400, { message: error.message, email });
		return { success: true, message: 'Check your inbox for a sign-in link.', email };
	}
};
