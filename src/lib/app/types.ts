import type { Tables } from '$lib/types/database';

export type Client = Tables<'clients'>;
export type Project = Tables<'projects'>;
export type Task = Tables<'tasks'>;
export type Invoice = Tables<'invoices'>;
export type InvoiceLineItem = Tables<'invoice_line_items'>;
export type InvoicePayment = Tables<'invoice_payments'>;
export type FinanceExpense = Tables<'finance_expenses'>;

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

export const expenseCategories = ['Software', 'Equipment', 'Travel', 'Contractors', 'Office', 'Taxes', 'Other'] as const;

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export const taskStatuses: Array<{ value: TaskStatus; label: string }> = [
	{ value: 'todo', label: 'To do' },
	{ value: 'in_progress', label: 'In progress' },
	{ value: 'done', label: 'Done' }
];

export const taskPriorities: Array<{ value: TaskPriority; label: string }> = [
	{ value: 'urgent', label: 'Urgent' },
	{ value: 'high', label: 'High' },
	{ value: 'medium', label: 'Medium' },
	{ value: 'low', label: 'Low' }
];
