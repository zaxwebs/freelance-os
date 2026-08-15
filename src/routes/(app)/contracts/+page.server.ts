import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getCurrentUser } from '$lib/server/workspace';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const user = await getCurrentUser(supabase);
	if (!user) throw redirect(303, '/');

	const [contractsResult, projectsResult] = await Promise.all([
		supabase.from('contracts').select('id,project_id,name,status,created_at').order('created_at', { ascending: false }),
		supabase.from('projects').select('id,name').order('created_at', { ascending: false })
	]);
	if (contractsResult.error) throw contractsResult.error;
	if (projectsResult.error) throw projectsResult.error;

	const projectNames = new Map((projectsResult.data ?? []).map((project) => [project.id, project.name]));
	return {
		contracts: (contractsResult.data ?? []).map((contract) => ({ ...contract, projectName: projectNames.get(contract.project_id) ?? 'Project' }))
	};
};
