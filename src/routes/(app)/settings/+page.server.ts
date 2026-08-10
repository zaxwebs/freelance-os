import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	return {
		email: user?.email ?? '',
		createdAt: user?.created_at ?? null
	};
};

export const actions: Actions = {
	signOut: async ({ locals: { supabase } }) => {
		const { error } = await supabase.auth.signOut();
		if (error) return { success: false, message: error.message };
		throw redirect(303, '/');
	}
};
