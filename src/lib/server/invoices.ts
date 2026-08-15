import { canTransitionInvoice, isPaymentMethod, type PaymentMethod } from '$lib/app/statuses';
import type { TablesInsert } from '$lib/types/database';
import type { WorkspaceClient } from '$lib/server/workspace';

type SubmittedInvoiceLineItem = {
	description?: unknown;
	quantity?: unknown;
	unitPrice?: unknown;
	taxRate?: unknown;
};

export type ParsedInvoiceLineItem = {
	description: string;
	quantity: number;
	unitPrice: number;
	taxRate: number;
	amount: number;
	lineSubtotal: number;
	lineTax: number;
};

export function parseInvoiceLineItems(value: string) {
	let parsed: unknown;
	try {
		parsed = JSON.parse(value);
	} catch {
		return { error: 'Add at least one valid line item.' } as const;
	}
	if (!Array.isArray(parsed) || parsed.length === 0) return { error: 'Add at least one line item.' } as const;

	const items = parsed.map((rawItem: SubmittedInvoiceLineItem, index) => {
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
	return { items: items as ParsedInvoiceLineItem[] } as const;
}

export function invoiceTotals(items: ParsedInvoiceLineItem[]) {
	const subtotal = Number(items.reduce((sum, item) => sum + item.lineSubtotal, 0).toFixed(4));
	const taxTotal = Number(items.reduce((sum, item) => sum + item.lineTax, 0).toFixed(4));
	return { subtotal, taxTotal, total: Number((subtotal + taxTotal).toFixed(4)) };
}

export const invoiceService = {
	isValidPaymentMethod(value: string): value is PaymentMethod {
		return isPaymentMethod(value);
	},

	canMarkSent(status: string) {
		return canTransitionInvoice(status, 'sent');
	},

	canRecordPayment(status: string) {
		return status !== 'void';
	},

	canVoid(status: string, amountPaid: number) {
		return status !== 'void' && amountPaid <= 0;
	},

	async createWithLineItems(
		supabase: WorkspaceClient,
		invoice: TablesInsert<'invoices'>,
		lineItems: Array<Omit<TablesInsert<'invoice_line_items'>, 'invoice_id'>>
	) {
		const { data, error } = await supabase.from('invoices').insert(invoice).select('id').single();
		if (error || !data) throw new Error(error?.message ?? 'Could not create the invoice.');

		const { error: lineItemError } = await supabase.from('invoice_line_items').insert(lineItems.map((lineItem) => ({ ...lineItem, invoice_id: data.id })));
		if (lineItemError) {
			await supabase.from('invoices').delete().eq('id', data.id);
			throw new Error(lineItemError.message);
		}

		return data.id;
	}
};
