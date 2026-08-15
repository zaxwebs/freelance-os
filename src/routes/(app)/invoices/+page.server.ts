import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { invoiceStoredStatuses } from '$lib/app/statuses';
import { getCurrentUser } from '$lib/server/workspace';
import { convertBaseAmount, defaultFinanceCurrency, getDisplayCurrency, getDisplayInvoiceStatus, getExchangeRate } from '$lib/server/finance';
import { getPagination, PAGE_SIZE, parsePage } from '$lib/server/pagination';

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	const user = await getCurrentUser(supabase);
	if (!user) throw redirect(303, '/');

	const requestedStatus = url.searchParams.get('status') ?? 'all';
	const requestedPage = parsePage(url.searchParams.get('page'));
	const today = new Date().toISOString().slice(0, 10);
	const pageCountQuery = supabase.from('invoices').select('id', { count: 'exact', head: true });
	if (invoiceStoredStatuses.includes(requestedStatus as (typeof invoiceStoredStatuses)[number])) pageCountQuery.eq('status', requestedStatus);
	if (requestedStatus === 'overdue') pageCountQuery.in('status', ['sent', 'partially_paid']).lt('due_date', today);
	const pageCountResult = await pageCountQuery;
	if (pageCountResult.error) throw pageCountResult.error;
	const pagination = getPagination(requestedPage, pageCountResult.count ?? 0, PAGE_SIZE);
	const pageQuery = supabase.from('invoices').select('*').order('issue_date', { ascending: false }).order('created_at', { ascending: false });
	if (invoiceStoredStatuses.includes(requestedStatus as (typeof invoiceStoredStatuses)[number])) pageQuery.eq('status', requestedStatus);
	if (requestedStatus === 'overdue') pageQuery.in('status', ['sent', 'partially_paid']).lt('due_date', today);
	const pageResult = await pageQuery.range((pagination.page - 1) * PAGE_SIZE, pagination.page * PAGE_SIZE - 1);
	if (pageResult.error) throw pageResult.error;
	const [clientsResult, projectsResult, displayCurrency] = await Promise.all([
		supabase.from('clients').select('id,name').order('name'),
		supabase.from('projects').select('id,name').order('name'),
		getDisplayCurrency(supabase, user.id)
	]);

	if (clientsResult.error) throw clientsResult.error;
	if (projectsResult.error) throw projectsResult.error;
	const displayRate = await getExchangeRate(supabase, user.id, defaultFinanceCurrency, displayCurrency);

	const clientNames = new Map((clientsResult.data ?? []).map((client) => [client.id, client.name]));
	const projectNames = new Map((projectsResult.data ?? []).map((project) => [project.id, project.name]));
	const invoices = (pageResult.data ?? []).map((invoice) => ({
		...invoice,
		displayStatus: getDisplayInvoiceStatus(invoice.status, invoice.due_date, Number(invoice.amount_paid), Number(invoice.total)),
		displayTotal: convertBaseAmount(invoice.base_total, displayRate.rate, displayCurrency),
		displayAmountPaid: convertBaseAmount(invoice.base_amount_paid, displayRate.rate, displayCurrency),
		clientName: clientNames.get(invoice.client_id) ?? 'Unknown client',
		projectName: invoice.project_id ? projectNames.get(invoice.project_id) ?? 'Unassigned project' : null
	}));
	const filteredInvoices = requestedStatus === 'all' ? invoices : invoices.filter((invoice) => invoice.displayStatus === requestedStatus);
	const allInvoicesResult = await supabase.from('invoices').select('*');
	if (allInvoicesResult.error) throw allInvoicesResult.error;
	const allInvoices = (allInvoicesResult.data ?? []).map((invoice) => ({
		...invoice,
		displayStatus: getDisplayInvoiceStatus(invoice.status, invoice.due_date, Number(invoice.amount_paid), Number(invoice.total)),
		displayTotal: convertBaseAmount(invoice.base_total, displayRate.rate, displayCurrency),
		displayAmountPaid: convertBaseAmount(invoice.base_amount_paid, displayRate.rate, displayCurrency)
	}));

	return {
		invoices: filteredInvoices,
		displayCurrency,
		status: requestedStatus,
		pagination,
		metrics: {
			outstanding: allInvoices.filter((invoice) => invoice.displayStatus !== 'void' && invoice.displayStatus !== 'paid').reduce((sum, invoice) => sum + invoice.displayTotal - invoice.displayAmountPaid, 0),
			overdue: allInvoices.filter((invoice) => invoice.displayStatus === 'overdue').reduce((sum, invoice) => sum + invoice.displayTotal - invoice.displayAmountPaid, 0),
			paid: allInvoices.filter((invoice) => invoice.displayStatus === 'paid').reduce((sum, invoice) => sum + invoice.displayAmountPaid, 0)
		}
	};
};
