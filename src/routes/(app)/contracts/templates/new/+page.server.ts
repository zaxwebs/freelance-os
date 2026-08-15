import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { hasContractTemplateContent, sanitizeContractTemplateContent } from '$lib/server/contract-templates';
import { getCurrentUser } from '$lib/server/workspace';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const user = await getCurrentUser(supabase);
	if (!user) throw redirect(303, '/');
	return {};
};

export const actions: Actions = {
	createTemplate: async ({ request, locals: { supabase } }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in before creating a template.' });

		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const content = sanitizeContractTemplateContent(String(formData.get('content') ?? ''));

		if (!name) return fail(400, { message: 'Add a template name.' });
		if (!hasContractTemplateContent(content)) return fail(400, { message: 'Add some contract content before saving.' });

		const { data: template, error } = await supabase
			.from('contract_templates')
			.insert({ user_id: user.id, name, content })
			.select('id')
			.single();
		if (error || !template) return fail(400, { message: error?.message ?? 'Could not create the template.' });

		redirect(303, `/contracts/templates/${template.id}/edit`);
	}
};
