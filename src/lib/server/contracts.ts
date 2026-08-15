export const contractStatuses = ['draft', 'active', 'ended'] as const;

export type ContractStatus = (typeof contractStatuses)[number];

export function normalizeContractDate(value: string) {
	const trimmed = value.trim();
	if (!trimmed) return null;
	if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return undefined;
	const date = new Date(`${trimmed}T00:00:00Z`);
	if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== trimmed) return undefined;
	return trimmed;
}

export function isValidContractDateRange(startDate: string | null, endDate: string | null) {
	return !startDate || !endDate || endDate >= startDate;
}

export function contractNameForProject(projectName: string) {
	return `${projectName.trim()} - Contract`;
}
