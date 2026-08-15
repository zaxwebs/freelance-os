import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { proposalStatuses } from '$lib/app/statuses';
import { supportedCurrencies } from '$lib/app/currency';
import { getCurrentUser } from '$lib/server/workspace';
import { getPagination, PAGE_SIZE, parsePage } from '$lib/server/pagination';

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	const user = await getCurrentUser(supabase);
	if (!user) throw redirect(303, '/');

	const requestedStatus = url.searchParams.get('status') ?? 'all';
	const requestedPage = parsePage(url.searchParams.get('page'));
	const pageCountQuery = supabase.from('proposals').select('id', { count: 'exact', head: true });
	if (proposalStatuses.includes(requestedStatus as (typeof proposalStatuses)[number])) pageCountQuery.eq('status', requestedStatus);
	const pageCountResult = await pageCountQuery;
	if (pageCountResult.error) throw pageCountResult.error;
	const pagination = getPagination(requestedPage, pageCountResult.count ?? 0, PAGE_SIZE);
	const pageQuery = supabase.from('proposals').select('*').order('issue_date', { ascending: false }).order('created_at', { ascending: false });
	if (proposalStatuses.includes(requestedStatus as (typeof proposalStatuses)[number])) pageQuery.eq('status', requestedStatus);
	const [proposalsResult, clientsResult] = await Promise.all([
		pageQuery.range((pagination.page - 1) * PAGE_SIZE, pagination.page * PAGE_SIZE - 1),
		supabase.from('clients').select('id,name,company').order('name')
	]);
	if (proposalsResult.error) throw proposalsResult.error;
	if (clientsResult.error) throw clientsResult.error;

	const clientNames = new Map((clientsResult.data ?? []).map((client) => [client.id, client]));
	return {
		proposals: (proposalsResult.data ?? []).map((proposal) => ({ ...proposal, client: clientNames.get(proposal.client_id) ?? null })),
		status: requestedStatus,
		pagination,
		currencies: supportedCurrencies
	};
};
