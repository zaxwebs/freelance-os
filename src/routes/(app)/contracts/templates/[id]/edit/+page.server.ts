import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { hasContractTemplateContent, sanitizeContractTemplateContent } from '$lib/server/contract-templates';
import { getCurrentUser } from '$lib/server/workspace';

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
	const user = await getCurrentUser(supabase);
	if (!user) throw redirect(303, '/');

	const { data: template, error } = await supabase
		.from('contract_templates')
		.select('id,name,content,created_at')
		.eq('id', params.id)
		.eq('user_id', user.id)
		.single();
	if (error || !template) throw redirect(303, '/contracts/templates');

	return { template };
};

export const actions: Actions = {
	updateTemplate: async ({ request, locals: { supabase }, params }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in before editing a template.' });

		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const content = sanitizeContractTemplateContent(String(formData.get('content') ?? ''));

		if (!name) return fail(400, { message: 'Add a template name.' });
		if (!hasContractTemplateContent(content)) return fail(400, { message: 'Add some contract content before saving.' });

		const { error } = await supabase
			.from('contract_templates')
			.update({ name, content })
			.eq('id', params.id)
			.eq('user_id', user.id);
		if (error) return fail(400, { message: error.message });

		redirect(303, '/contracts/templates');
	}
};
