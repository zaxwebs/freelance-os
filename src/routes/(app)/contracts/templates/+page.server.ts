import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getCurrentUser } from '$lib/server/workspace';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const user = await getCurrentUser(supabase);
	if (!user) throw redirect(303, '/');

	const { data: templates, error } = await supabase
		.from('contract_templates')
		.select('id,name')
		.order('created_at', { ascending: true });
	if (error) throw error;

	return { templates: templates ?? [] };
};

export const actions: Actions = {
	duplicateTemplate: async ({ request, locals: { supabase } }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return { message: 'Sign in before duplicating a template.' };

		const formData = await request.formData();
		const templateId = String(formData.get('template_id') ?? '').trim();
		if (!templateId) return { message: 'Choose a template to duplicate.' };

		const { data: template, error: templateError } = await supabase
			.from('contract_templates')
			.select('name,content')
			.eq('id', templateId)
			.eq('user_id', user.id)
			.single();
		if (templateError || !template) return { message: templateError?.message ?? 'Could not find that template.' };

		const { error } = await supabase.from('contract_templates').insert({
			user_id: user.id,
			name: `${template.name} copy`,
			content: template.content
		});
		if (error) return { message: error.message };
	},
	deleteTemplate: async ({ request, locals: { supabase } }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return { message: 'Sign in before deleting a template.' };

		const formData = await request.formData();
		const templateId = String(formData.get('template_id') ?? '').trim();
		if (!templateId) return { message: 'Choose a template to delete.' };

		const { error } = await supabase.from('contract_templates').delete().eq('id', templateId).eq('user_id', user.id);
		if (error) return { message: error.message };
	}
};
