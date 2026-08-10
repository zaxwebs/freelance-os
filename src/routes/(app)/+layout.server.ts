import { redirect } from '@sveltejs/kit';
import { getAvatarUrl, getDisplayName } from '$lib/server/workspace';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { supabase } }) => {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) redirect(303, '/');

	return {
		user: {
			email: user.email ?? '',
			displayName: getDisplayName(user),
			avatarUrl: getAvatarUrl(supabase, user)
		}
	};
};
