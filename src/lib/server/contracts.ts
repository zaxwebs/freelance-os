import type { TablesInsert, TablesUpdate } from '$lib/types/database';
import { canTransitionContract, contractStatuses, isContractStatus, type ContractStatus } from '$lib/app/statuses';
import type { WorkspaceClient } from '$lib/server/workspace';

export { contractStatuses, type ContractStatus } from '$lib/app/statuses';

export function contractNameForProject(projectName: string) {
	return `${projectName.trim()} - Contract`;
}

export const contractService = {
	isValidStatus: isContractStatus,
	canTransition: canTransitionContract,

	async create(
		supabase: WorkspaceClient,
		input: Pick<TablesInsert<'contracts'>, 'user_id' | 'project_id' | 'template_id' | 'content'> & { projectName: string; status?: ContractStatus }
	) {
		return supabase
			.from('contracts')
			.insert({
				user_id: input.user_id,
				project_id: input.project_id,
				template_id: input.template_id ?? null,
				name: contractNameForProject(input.projectName),
				content: input.content,
				status: input.status ?? 'draft'
			})
			.select('id')
			.single();
	},

	async update(
		supabase: WorkspaceClient,
		input: Pick<TablesUpdate<'contracts'>, 'content'> & { userId: string; projectId: string; contractId: string; projectName: string; status: ContractStatus }
	) {
		return supabase
			.from('contracts')
			.update({
				name: contractNameForProject(input.projectName),
				content: input.content,
				status: input.status
			})
			.eq('id', input.contractId)
			.eq('project_id', input.projectId)
			.eq('user_id', input.userId);
	}
};
