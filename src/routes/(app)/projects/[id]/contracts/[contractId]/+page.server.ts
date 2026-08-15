import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { analyzeContractPlaceholders } from '$lib/app/contract-placeholders';
import { renderContractPlaceholders, sanitizeContractTemplateContent } from '$lib/server/contract-templates';
import { getAccountIdentity, getCurrentUser } from '$lib/server/workspace';

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => {
	const user = await getCurrentUser(supabase);
	if (!user) throw redirect(303, '/');

	const [projectResult, contractResult] = await Promise.all([
		supabase.from('projects').select('id,name,client_id').eq('id', params.id).single(),
		supabase.from('contracts').select('id,project_id,name,content,status,created_at,updated_at').eq('id', params.contractId).eq('project_id', params.id).single()
	]);
	if (projectResult.error || !projectResult.data || contractResult.error || !contractResult.data) throw redirect(303, `/projects/${params.id}`);

	let clientName: string | null = null;
	if (projectResult.data.client_id) {
		const { data: client, error: clientError } = await supabase.from('clients').select('name').eq('id', projectResult.data.client_id).maybeSingle();
		if (clientError) throw clientError;
		clientName = client?.name ?? null;
	}

	const identity = getAccountIdentity(user);
	const contract = contractResult.data;
	const placeholderValues = {
		client_name: clientName,
		project_name: projectResult.data.name,
		freelancer_name: identity.name
	};
	const sanitizedContent = sanitizeContractTemplateContent(contract.content);

	return {
		project: projectResult.data,
		placeholderSummary: analyzeContractPlaceholders(sanitizedContent, placeholderValues),
		contract: {
			...contract,
			content: renderContractPlaceholders(sanitizedContent, placeholderValues)
		}
	};
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
