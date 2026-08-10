import { fail, redirect } from '@sveltejs/kit';
import { getAvatarUrl, getDisplayName } from '$lib/server/workspace';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	return {
		email: user?.email ?? '',
		displayName: getDisplayName(user),
		createdAt: user?.created_at ?? null,
		avatarUrl: getAvatarUrl(supabase, user)
	};
};

export const actions: Actions = {
	signOut: async ({ locals: { supabase } }) => {
		const { error } = await supabase.auth.signOut();
		if (error) return { success: false, message: error.message };
		throw redirect(303, '/');
	},
	updateProfile: async ({ request, locals: { supabase } }) => {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) throw redirect(303, '/');

		const formData = await request.formData();
		const displayName = String(formData.get('displayName') ?? '').trim();

		if (displayName.length > 80) {
			return fail(400, { success: false, message: 'Names must be 80 characters or fewer.' });
		}

		const { error } = await supabase.auth.updateUser({
			data: { display_name: displayName || null }
		});

		if (error) return fail(400, { success: false, message: error.message });

		return { success: true, message: displayName ? 'Name saved.' : 'Name cleared.' };
	},
	uploadAvatar: async ({ request, locals: { supabase } }) => {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) throw redirect(303, '/');

		const formData = await request.formData();
		const file = formData.get('avatar');
		const allowedTypes = new Map([
			['image/jpeg', 'jpg'],
			['image/png', 'png'],
			['image/webp', 'webp'],
			['image/gif', 'gif']
		]);

		if (!(file instanceof File) || file.size === 0) {
			return fail(400, { success: false, message: 'Choose an image to upload.' });
		}

		if (!allowedTypes.has(file.type)) {
			return fail(400, { success: false, message: 'Use a JPG, PNG, GIF, or WebP image.' });
		}

		if (file.size > 2 * 1024 * 1024) {
			return fail(400, { success: false, message: 'Profile photos must be 2 MB or smaller.' });
		}

		const path = `${user.id}/avatar.${allowedTypes.get(file.type)}`;
		const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, {
			cacheControl: '3600',
			contentType: file.type,
			upsert: true
		});

		if (uploadError) return fail(400, { success: false, message: uploadError.message });

		const { error: profileError } = await supabase.auth.updateUser({
			data: { avatar_path: path, avatar_updated_at: new Date().toISOString() }
		});

		if (profileError) return fail(400, { success: false, message: profileError.message });

		return { success: true, message: 'Profile photo updated.' };
	}
};
