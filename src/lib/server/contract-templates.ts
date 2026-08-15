import { getContractPlaceholderLabel, isKnownContractPlaceholder, type ContractPlaceholder, type ContractPlaceholderValues } from '$lib/app/contract-placeholders';

const textOnlyContent = (content: string) =>
	content
		.replace(/<[^>]*>/g, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/\s+/g, ' ')
		.trim();

export function sanitizeContractTemplateContent(content: string) {
	return content
		.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
		.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
		.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
		.replace(/\s(?:href|src)\s*=\s*("|')\s*javascript:[^"']*\1/gi, '')
		.trim();
}

export function hasContractTemplateContent(content: string) {
	return textOnlyContent(content).length > 0;
}

function escapeHtml(value: string) {
	return value.replace(/[&<>"']/g, (character) => {
		const entities: Record<string, string> = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;'
		};
		return entities[character];
	});
}

export function resolveContractPlaceholders(content: string, values: ContractPlaceholderValues) {
	return content.replace(/\{\{\s*([a-z0-9_-]+)\s*\}\}/gi, (token, rawKey: string) => {
		const key = rawKey.toLowerCase() as ContractPlaceholder;
		if (!isKnownContractPlaceholder(key)) return token;
		const label = getContractPlaceholderLabel(key);

		const value = values[key]?.trim();
		return escapeHtml(value || `[${label} not set]`);
	});
}

function placeholderChip(token: string, rawKey: string, values: ContractPlaceholderValues) {
	const key = rawKey.toLowerCase() as ContractPlaceholder;
	if (!isKnownContractPlaceholder(key)) {
		return `<span data-contract-placeholder="manual" class="bg-violet-500/10 px-1 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" title="Manual placeholder needs replacement">${escapeHtml(token)}</span>`;
	}

	const label = getContractPlaceholderLabel(key);
	const value = values[key]?.trim();
	if (!value) {
		return `<span data-contract-placeholder="missing" class="bg-primary/10 px-1 text-primary" title="${escapeHtml(`${label} is not set`)}">${escapeHtml(`[${label} not set]`)}</span>`;
	}

	return `<span data-contract-placeholder="smart" class="bg-primary/10 px-1 text-primary" title="Smart field filled from project details">${escapeHtml(value)}</span>`;
}

export function renderContractPlaceholders(content: string, values: ContractPlaceholderValues) {
	return content
		.split(/(<[^>]*>)/g)
		.map((part) => part.startsWith('<') ? part : part.replace(/\{\{\s*([a-z0-9_-]+)\s*\}\}/gi, (token, rawKey: string) => placeholderChip(token, rawKey, values)))
		.join('');
}
