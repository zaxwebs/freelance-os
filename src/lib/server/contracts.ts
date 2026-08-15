export const contractStatuses = ['draft', 'active', 'ended'] as const;

export type ContractStatus = (typeof contractStatuses)[number];

export function contractNameForProject(projectName: string) {
	return `${projectName.trim()} - Contract`;
}
