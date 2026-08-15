import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { analyzeContractPlaceholders } from '$lib/app/contract-placeholders';
import { contractService } from '$lib/server/contracts';
import { hasContractTemplateContent, sanitizeContractTemplateContent } from '$lib/server/contract-templates';
import { getAccountIdentity, getCurrentUser } from '$lib/server/workspace';

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
	const user = await getCurrentUser(supabase);
	if (!user) throw redirect(303, '/');

	const [projectResult, contractResult] = await Promise.all([
		supabase.from('projects').select('id,name,client_id').eq('id', params.id).single(),
		supabase.from('contracts').select('id,project_id,name,content,status,template_id,created_at,updated_at').eq('id', params.contractId).eq('project_id', params.id).single()
	]);
	if (projectResult.error || !projectResult.data || contractResult.error || !contractResult.data) throw redirect(303, `/projects/${params.id}`);

	let clientName: string | null = null;
	if (projectResult.data.client_id) {
		const { data: client, error: clientError } = await supabase.from('clients').select('name').eq('id', projectResult.data.client_id).maybeSingle();
		if (clientError) throw clientError;
		clientName = client?.name ?? null;
	}

	const identity = getAccountIdentity(user);
	return {
		project: projectResult.data,
		contract: contractResult.data,
		placeholderSummary: analyzeContractPlaceholders(contractResult.data.content, {
			client_name: clientName,
			project_name: projectResult.data.name,
			freelancer_name: identity.name
		})
	};
};

export const actions: Actions = {
	updateContract: async ({ request, locals: { supabase }, params }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in before editing a contract.' });

		const formData = await request.formData();
		const content = sanitizeContractTemplateContent(String(formData.get('content') ?? ''));
		const status = String(formData.get('status') ?? 'draft').trim();

		if (!hasContractTemplateContent(content)) return fail(400, { message: 'Add some contract content before saving.' });
		if (!contractService.isValidStatus(status)) return fail(400, { message: 'Choose a valid contract status.' });

		const { data: project, error: projectError } = await supabase.from('projects').select('id,name').eq('id', params.id).single();
		if (projectError || !project) return fail(400, { message: projectError?.message ?? 'Could not find that project.' });

		const { error } = await contractService.update(supabase, {
			userId: user.id,
			projectId: params.id,
			contractId: params.contractId,
			projectName: project.name,
			content,
			status
		});
		if (error) return fail(400, { message: error.message });

		throw redirect(303, `/projects/${params.id}/contracts/${params.contractId}`);
	}
};
