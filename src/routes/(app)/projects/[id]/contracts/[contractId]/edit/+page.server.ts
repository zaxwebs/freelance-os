import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { contractNameForProject, contractStatuses, isValidContractDateRange, normalizeContractDate } from '$lib/server/contracts';
import { hasContractTemplateContent, sanitizeContractTemplateContent } from '$lib/server/contract-templates';
import { getCurrentUser } from '$lib/server/workspace';

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
	const user = await getCurrentUser(supabase);
	if (!user) throw redirect(303, '/');

	const [projectResult, contractResult] = await Promise.all([
		supabase.from('projects').select('id,name').eq('id', params.id).single(),
		supabase.from('contracts').select('id,project_id,name,content,start_date,end_date,status,template_id,created_at,updated_at').eq('id', params.contractId).eq('project_id', params.id).single()
	]);
	if (projectResult.error || !projectResult.data || contractResult.error || !contractResult.data) throw redirect(303, `/projects/${params.id}`);

	return { project: projectResult.data, contract: contractResult.data };
};

export const actions: Actions = {
	updateContract: async ({ request, locals: { supabase }, params }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in before editing a contract.' });

		const formData = await request.formData();
		const content = sanitizeContractTemplateContent(String(formData.get('content') ?? ''));
		const status = String(formData.get('status') ?? 'draft').trim();
		const startDate = normalizeContractDate(String(formData.get('start_date') ?? ''));
		const endDate = normalizeContractDate(String(formData.get('end_date') ?? ''));

		if (!hasContractTemplateContent(content)) return fail(400, { message: 'Add some contract content before saving.' });
		if (!contractStatuses.includes(status as (typeof contractStatuses)[number])) return fail(400, { message: 'Choose a valid contract status.' });
		if (startDate === undefined || endDate === undefined) return fail(400, { message: 'Choose valid contract dates.' });
		if (!isValidContractDateRange(startDate, endDate)) return fail(400, { message: 'The end date must be on or after the start date.' });

		const { data: project, error: projectError } = await supabase.from('projects').select('id,name').eq('id', params.id).single();
		if (projectError || !project) return fail(400, { message: projectError?.message ?? 'Could not find that project.' });

		const { error } = await supabase.from('contracts').update({
			name: contractNameForProject(project.name),
			content,
			start_date: startDate,
			end_date: endDate,
			status
		}).eq('id', params.contractId).eq('project_id', params.id).eq('user_id', user.id);
		if (error) return fail(400, { message: error.message });

		throw redirect(303, `/projects/${params.id}/contracts/${params.contractId}`);
	}
};
