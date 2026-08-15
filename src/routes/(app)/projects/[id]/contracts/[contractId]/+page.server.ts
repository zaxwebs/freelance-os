import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
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
