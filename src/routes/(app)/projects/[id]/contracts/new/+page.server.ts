import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { contractNameForProject, isValidContractDateRange, normalizeContractDate } from '$lib/server/contracts';
import { getCurrentUser } from '$lib/server/workspace';

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
	const user = await getCurrentUser(supabase);
	if (!user) throw redirect(303, '/');

	const [projectResult, templatesResult, existingContractResult] = await Promise.all([
		supabase.from('projects').select('id,name').eq('id', params.id).single(),
		supabase.from('contract_templates').select('id,name').order('created_at', { ascending: true }),
		supabase.from('contracts').select('id').eq('project_id', params.id).maybeSingle()
	]);
	if (projectResult.error || !projectResult.data) throw redirect(303, '/projects');
	if (templatesResult.error) throw templatesResult.error;
	if (existingContractResult.error) throw existingContractResult.error;
	if (existingContractResult.data) throw redirect(303, `/projects/${params.id}/contracts/${existingContractResult.data.id}/edit`);

	return { project: projectResult.data, templates: templatesResult.data ?? [] };
};

export const actions: Actions = {
	createContract: async ({ request, locals: { supabase }, params }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in before creating a contract.' });

		const formData = await request.formData();
		const templateId = String(formData.get('template_id') ?? '').trim() || null;
		const startDate = normalizeContractDate(String(formData.get('start_date') ?? ''));
		const endDate = normalizeContractDate(String(formData.get('end_date') ?? ''));
		if (startDate === undefined || endDate === undefined) return fail(400, { message: 'Choose valid contract dates.' });
		if (!isValidContractDateRange(startDate, endDate)) return fail(400, { message: 'The end date must be on or after the start date.' });

		const { data: project, error: projectError } = await supabase.from('projects').select('id,name').eq('id', params.id).single();
		if (projectError || !project) return fail(400, { message: projectError?.message ?? 'Could not find that project.' });

		let content = '';
		if (templateId) {
			const { data: template, error: templateError } = await supabase.from('contract_templates').select('content').eq('id', templateId).eq('user_id', user.id).single();
			if (templateError || !template) return fail(400, { message: templateError?.message ?? 'Choose a valid template.' });
			content = template.content;
		}

		const { data: contract, error: contractError } = await supabase.from('contracts').insert({
			user_id: user.id,
			project_id: project.id,
			template_id: templateId,
			name: contractNameForProject(project.name),
			content,
			start_date: startDate,
			end_date: endDate,
			status: 'draft'
		}).select('id').single();
		if (contractError || !contract) return fail(400, { message: contractError?.message ?? 'Could not create the contract.' });

		throw redirect(303, `/projects/${project.id}/contracts/${contract.id}/edit`);
	}
};
