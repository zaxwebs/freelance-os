export const contractPlaceholderDefinitions = [
	{ value: 'client_name', label: 'Client name' },
	{ value: 'project_name', label: 'Project name' },
	{ value: 'freelancer_name', label: 'Freelancer name' }
] as const;

export type ContractPlaceholder = (typeof contractPlaceholderDefinitions)[number]['value'];
export type ContractPlaceholderValues = Partial<Record<ContractPlaceholder, string | null | undefined>>;

export interface ContractPlaceholderSummary {
	keys: string[];
	smart: ContractPlaceholder[];
	manual: string[];
	missingSmart: ContractPlaceholder[];
}

const knownPlaceholderLabels = new Map<string, string>(contractPlaceholderDefinitions.map((placeholder) => [placeholder.value, placeholder.label]));

export function getContractPlaceholderLabel(value: string) {
	return knownPlaceholderLabels.get(value) ?? value.replace(/[_-]+/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

export function isKnownContractPlaceholder(value: string): value is ContractPlaceholder {
	return knownPlaceholderLabels.has(value);
}

export function extractContractPlaceholderKeys(content: string) {
	const keys = [...content.matchAll(/\{\{\s*([a-z0-9_-]+)\s*\}\}/gi)].map((match) => match[1].toLowerCase());
	return [...new Set(keys)];
}

export function analyzeContractPlaceholders(content: string, values?: ContractPlaceholderValues): ContractPlaceholderSummary {
	const keys = extractContractPlaceholderKeys(content);
	const smart = keys.filter(isKnownContractPlaceholder);
	const manual = keys.filter((key) => !isKnownContractPlaceholder(key));
	const missingSmart = values
		? smart.filter((key) => !values[key]?.trim())
		: [];

	return { keys, smart, manual, missingSmart };
}
