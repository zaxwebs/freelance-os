import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getPagination, PAGE_SIZE, parsePage } from '$lib/server/pagination';
import { getCurrentUser } from '$lib/server/workspace';
import { isSupportedCurrency } from '$lib/server/finance';

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	const user = await getCurrentUser(supabase);
	if (!user) return { clients: [], projects: [], tasks: [], query: '', pagination: getPagination(1, 0), metrics: { totalProjects: 0, totalTasks: 0 } };

	const query = url.searchParams.get('q')?.trim() ?? '';
	const requestedPage = parsePage(url.searchParams.get('page'));
	let clientCountQuery = supabase.from('clients').select('*', { count: 'exact', head: true });
	if (query) clientCountQuery = clientCountQuery.or(`name.ilike.%${query}%,company.ilike.%${query}%,email.ilike.%${query}%`);
	const clientCountResult = await clientCountQuery;
	if (clientCountResult.error) throw clientCountResult.error;

	const pagination = getPagination(requestedPage, clientCountResult.count ?? 0, PAGE_SIZE);
	let clientsQuery = supabase.from('clients').select('*').order('created_at', { ascending: false }).range((pagination.page - 1) * PAGE_SIZE, pagination.page * PAGE_SIZE - 1);
	if (query) clientsQuery = clientsQuery.or(`name.ilike.%${query}%,company.ilike.%${query}%,email.ilike.%${query}%`);

	const [clientsResult, projectCountResult, taskCountResult] = await Promise.all([
		clientsQuery,
		supabase.from('projects').select('*', { count: 'exact', head: true }),
		supabase.from('tasks').select('*', { count: 'exact', head: true })
	]);
	if (clientsResult.error) throw clientsResult.error;
	if (projectCountResult.error) throw projectCountResult.error;
	if (taskCountResult.error) throw taskCountResult.error;

	const clientIds = (clientsResult.data ?? []).map((client) => client.id);
	const projectsResult = clientIds.length
		? await supabase.from('projects').select('id,client_id').in('client_id', clientIds)
		: { data: [], error: null };
	if (projectsResult.error) throw projectsResult.error;
	const projectIds = (projectsResult.data ?? []).map((project) => project.id);
	const tasksResult = projectIds.length
		? await supabase.from('tasks').select('project_id').in('project_id', projectIds)
		: { data: [], error: null };
	if (tasksResult.error) throw tasksResult.error;

	return {
		clients: clientsResult.data ?? [],
		projects: projectsResult.data ?? [],
		tasks: tasksResult.data ?? [],
		query,
		pagination,
		metrics: { totalProjects: projectCountResult.count ?? 0, totalTasks: taskCountResult.count ?? 0 }
	};
};

export const actions: Actions = {
	createClient: async ({ request, locals: { supabase } }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in before creating a client.' });
		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const company = String(formData.get('company') ?? '').trim() || null;
		const email = String(formData.get('email') ?? '').trim() || null;
		const billingAddress = String(formData.get('billing_address') ?? '').trim() || null;
		const taxIdLabel = String(formData.get('tax_id_label') ?? '').trim() || null;
		const taxId = String(formData.get('tax_id') ?? '').trim() || null;
		const defaultCurrencyCode = String(formData.get('default_currency_code') ?? 'USD').trim().toUpperCase();
		if (!name) return fail(400, { message: 'Client name is required.' });
		if (!isSupportedCurrency(defaultCurrencyCode)) return fail(400, { message: 'Choose a supported billing currency.' });
		const { data, error } = await supabase.from('clients').insert({ user_id: user.id, name, company, email, billing_address: billingAddress, tax_id_label: taxIdLabel, tax_id: taxId, default_currency_code: defaultCurrencyCode }).select('id').single();
		if (error) return fail(400, { message: error.message });
		redirect(303, `/clients/${data.id}`);
	}
};
