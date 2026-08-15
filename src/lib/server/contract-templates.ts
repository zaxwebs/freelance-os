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
