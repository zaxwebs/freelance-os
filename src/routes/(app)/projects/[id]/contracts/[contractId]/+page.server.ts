import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { sanitizeContractTemplateContent } from '$lib/server/contract-templates';
import { getCurrentUser } from '$lib/server/workspace';

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
	const user = await getCurrentUser(supabase);
	if (!user) throw redirect(303, '/');

	const [projectResult, contractResult] = await Promise.all([
		supabase.from('projects').select('id,name').eq('id', params.id).single(),
		supabase.from('contracts').select('id,project_id,name,content,start_date,end_date,status,created_at,updated_at').eq('id', params.contractId).eq('project_id', params.id).single()
	]);
	if (projectResult.error || !projectResult.data || contractResult.error || !contractResult.data) throw redirect(303, `/projects/${params.id}`);

	return { project: projectResult.data, contract: { ...contractResult.data, content: sanitizeContractTemplateContent(contractResult.data.content) } };
};

export const actions: Actions = {
	deleteContract: async ({ locals: { supabase }, params }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in before deleting a contract.' });

		const { error } = await supabase
			.from('contracts')
			.delete()
			.eq('id', params.contractId)
			.eq('project_id', params.id)
			.eq('user_id', user.id);
		if (error) return fail(400, { message: error.message });

		throw redirect(303, `/projects/${params.id}`);
	}
};
