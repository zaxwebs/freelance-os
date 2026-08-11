import { fail, redirect } from '@sveltejs/kit';
import { supportedCurrencies } from '$lib/app/currency';
import { getDisplayCurrency, isSupportedCurrency } from '$lib/server/finance';
import { getAvatarUrl, getCurrentUser, getDisplayName } from '$lib/server/workspace';
import type { Actions, PageServerLoad } from './$types';

const emptyInvoiceSettings = {
	business_name: '',
	legal_name: '',
	business_email: '',
	business_phone: '',
	business_website: '',
	business_address: '',
	tax_id_label: '',
	tax_id: '',
	logo_path: null,
	default_payment_terms_days: 14,
	default_payment_instructions: '',
	footer_note: ''
};

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const user = await getCurrentUser(supabase);
	if (!user) throw redirect(303, '/');

	const invoiceSettingsResult = await supabase.from('workspace_invoice_settings').select('*').maybeSingle();
	if (invoiceSettingsResult.error) throw invoiceSettingsResult.error;

	return {
		email: user?.email ?? '',
		displayName: getDisplayName(user),
		createdAt: user?.created_at ?? null,
		avatarUrl: getAvatarUrl(supabase, user),
		displayCurrency: await getDisplayCurrency(supabase, user.id),
		currencies: supportedCurrencies,
		invoiceSettings: invoiceSettingsResult.data ?? emptyInvoiceSettings,
	};
};

export const actions: Actions = {
	saveSettings: async ({ request, locals: { supabase } }) => {
		const user = await getCurrentUser(supabase);
		if (!user) throw redirect(303, '/');

		const formData = await request.formData();
		const currencyCode = String(formData.get('display_currency_code') ?? '').trim().toUpperCase();
		if (!isSupportedCurrency(currencyCode)) return fail(400, { success: false, message: 'Choose a supported display currency.' });

		const { error } = await supabase.from('finance_settings').upsert({ user_id: user.id, display_currency_code: currencyCode }, { onConflict: 'user_id' });
		if (error) return fail(400, { success: false, message: error.message });
		return { success: true, message: 'Display currency saved.' };
	},
	saveInvoiceSettings: async ({ request, locals: { supabase } }) => {
		const user = await getCurrentUser(supabase);
		if (!user) throw redirect(303, '/');

		const formData = await request.formData();
		const businessName = String(formData.get('business_name') ?? '').trim() || null;
		const legalName = String(formData.get('legal_name') ?? '').trim() || null;
		const businessEmail = String(formData.get('business_email') ?? '').trim() || null;
		const businessPhone = String(formData.get('business_phone') ?? '').trim() || null;
		const businessWebsite = String(formData.get('business_website') ?? '').trim() || null;
		const businessAddress = String(formData.get('business_address') ?? '').trim() || null;
		const taxIdLabel = String(formData.get('tax_id_label') ?? '').trim() || null;
		const taxId = String(formData.get('tax_id') ?? '').trim() || null;
		const defaultPaymentInstructions = String(formData.get('default_payment_instructions') ?? '').trim() || null;
		const footerNote = String(formData.get('footer_note') ?? '').trim() || null;
		const defaultPaymentTermsDays = Number(String(formData.get('default_payment_terms_days') ?? '14').trim());

		if (!Number.isInteger(defaultPaymentTermsDays) || defaultPaymentTermsDays < 0 || defaultPaymentTermsDays > 365) {
			return fail(400, { success: false, message: 'Payment terms must be a whole number between 0 and 365 days.' });
		}
		if (businessEmail && !/^\S+@\S+\.\S+$/.test(businessEmail)) {
			return fail(400, { success: false, message: 'Enter a valid business email address.' });
		}

		const { error } = await supabase.from('workspace_invoice_settings').upsert(
			{
				user_id: user.id,
				business_name: businessName,
				legal_name: legalName,
				business_email: businessEmail,
				business_phone: businessPhone,
				business_website: businessWebsite,
				business_address: businessAddress,
				tax_id_label: taxIdLabel,
				tax_id: taxId,
				default_payment_terms_days: defaultPaymentTermsDays,
				default_payment_instructions: defaultPaymentInstructions,
				footer_note: footerNote
			},
			{ onConflict: 'user_id' }
		);
		if (error) return fail(400, { success: false, message: error.message });
		return { success: true, message: 'Invoice profile saved.' };
	},

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
