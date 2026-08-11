export type SubmittedProposalLineItem = {
	description?: unknown;
	quantity?: unknown;
	unitPrice?: unknown;
	taxRate?: unknown;
};

export type ParsedProposalLineItem = {
	description: string;
	quantity: number;
	unitPrice: number;
	taxRate: number;
	amount: number;
	lineSubtotal: number;
	lineTax: number;
};

export function parseProposalLineItems(value: string) {
	let parsed: unknown;
	try {
		parsed = JSON.parse(value);
	} catch {
		return { error: 'Add at least one valid pricing line.' } as const;
	}
	if (!Array.isArray(parsed) || parsed.length === 0) return { error: 'Add at least one pricing line.' } as const;

	const items = parsed.map((rawItem: SubmittedProposalLineItem, index) => {
		const description = String(rawItem.description ?? '').trim();
		const quantity = Number(rawItem.quantity ?? 0);
		const unitPrice = Number(rawItem.unitPrice ?? 0);
		const taxRate = Number(rawItem.taxRate ?? 0);
		if (!description || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0 || !Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
			return { error: `Line ${index + 1} needs a description, valid quantity, rate, and tax.` };
		}
		const lineSubtotal = Number((quantity * unitPrice).toFixed(4));
		const lineTax = Number((lineSubtotal * (taxRate / 100)).toFixed(4));
		return { description, quantity, unitPrice, taxRate, amount: Number((lineSubtotal + lineTax).toFixed(4)), lineSubtotal, lineTax };
	});
	const invalid = items.find((item) => 'error' in item);
	if (invalid && 'error' in invalid) return { error: invalid.error } as const;
	return { items: items as ParsedProposalLineItem[] } as const;
}

export function proposalTotals(items: ParsedProposalLineItem[]) {
	const subtotal = Number(items.reduce((sum, item) => sum + item.lineSubtotal, 0).toFixed(4));
	const taxTotal = Number(items.reduce((sum, item) => sum + item.lineTax, 0).toFixed(4));
	return { subtotal, taxTotal, total: Number((subtotal + taxTotal).toFixed(4)) };
}
