export const contractStatuses = ['draft', 'active', 'ended'] as const;
export type ContractStatus = (typeof contractStatuses)[number];

export const proposalStatuses = ['draft', 'sent', 'viewed', 'accepted', 'declined', 'expired'] as const;
export type ProposalStatus = (typeof proposalStatuses)[number];

export const invoiceStatuses = [
	{ value: 'draft', label: 'Draft' },
	{ value: 'sent', label: 'Sent' },
	{ value: 'viewed', label: 'Viewed' },
	{ value: 'partially_paid', label: 'Partially paid' },
	{ value: 'paid', label: 'Paid' },
	{ value: 'overdue', label: 'Overdue' },
	{ value: 'void', label: 'Void' }
] as const;

export type InvoiceStatus = (typeof invoiceStatuses)[number]['value'];
export const invoiceStoredStatuses = ['draft', 'sent', 'viewed', 'partially_paid', 'paid', 'void'] as const;

export const paymentMethods = [
	{ value: 'bank_transfer', label: 'Bank transfer' },
	{ value: 'card', label: 'Card' },
	{ value: 'cash', label: 'Cash' },
	{ value: 'check', label: 'Check' },
	{ value: 'other', label: 'Other' }
] as const;

export type PaymentMethod = (typeof paymentMethods)[number]['value'];

const proposalTransitions: Record<ProposalStatus, readonly ProposalStatus[]> = {
	draft: ['sent'],
	sent: ['viewed', 'accepted', 'declined', 'expired'],
	viewed: ['accepted', 'declined', 'expired'],
	accepted: [],
	declined: [],
	expired: []
};

const invoiceTransitions: Record<string, readonly string[]> = {
	draft: ['sent', 'void'],
	sent: ['viewed', 'partially_paid', 'paid', 'void'],
	viewed: ['partially_paid', 'paid', 'void'],
	partially_paid: ['paid', 'void'],
	paid: [],
	overdue: ['partially_paid', 'paid', 'void'],
	void: []
};

const contractTransitions: Record<ContractStatus, readonly ContractStatus[]> = {
	draft: ['active', 'ended'],
	active: ['ended'],
	ended: []
};

export function canTransitionProposal(from: string, to: string) {
	return proposalTransitions[from as ProposalStatus]?.includes(to as ProposalStatus) ?? false;
}

export function canTransitionInvoice(from: string, to: string) {
	return invoiceTransitions[from]?.includes(to) ?? false;
}

export function canTransitionContract(from: string, to: string) {
	return contractTransitions[from as ContractStatus]?.includes(to as ContractStatus) ?? false;
}

export function isContractStatus(value: string): value is ContractStatus {
	return contractStatuses.includes(value as ContractStatus);
}

export function isProposalStatus(value: string): value is ProposalStatus {
	return proposalStatuses.includes(value as ProposalStatus);
}

export function isPaymentMethod(value: string): value is PaymentMethod {
	return paymentMethods.some((method) => method.value === value);
}
