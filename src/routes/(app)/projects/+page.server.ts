import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getPagination, PAGE_SIZE, parsePage } from '$lib/server/pagination';
import { getCurrentUser } from '$lib/server/workspace';
import { isSupportedCurrency } from '$lib/server/finance';

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	const user = await getCurrentUser(supabase);
	if (!user) return { clients: [], projects: [], tasks: [], pagination: getPagination(1, 0), metrics: { activeProjects: 0, completedTasks: 0 } };

	const requestedPage = parsePage(url.searchParams.get('page'));
	const [projectCountResult, activeProjectsResult, completedTasksResult, clientsResult] = await Promise.all([
		supabase.from('projects').select('*', { count: 'exact', head: true }),
		supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
		supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'done'),
		supabase.from('clients').select('*').order('name')
	]);
	if (projectCountResult.error) throw projectCountResult.error;
	if (activeProjectsResult.error) throw activeProjectsResult.error;
	if (completedTasksResult.error) throw completedTasksResult.error;
	if (clientsResult.error) throw clientsResult.error;

	const pagination = getPagination(requestedPage, projectCountResult.count ?? 0, PAGE_SIZE);
	const projectsResult = await supabase.from('projects').select('*').order('created_at', { ascending: false }).range((pagination.page - 1) * PAGE_SIZE, pagination.page * PAGE_SIZE - 1);
	if (projectsResult.error) throw projectsResult.error;

	const projectIds = (projectsResult.data ?? []).map((project) => project.id);
	const tasksResult = projectIds.length
		? await supabase.from('tasks').select('project_id,status').in('project_id', projectIds)
		: { data: [], error: null };
	if (tasksResult.error) throw tasksResult.error;

	return {
		clients: clientsResult.data ?? [],
		projects: projectsResult.data ?? [],
		tasks: tasksResult.data ?? [],
		pagination,
		metrics: { activeProjects: activeProjectsResult.count ?? 0, completedTasks: completedTasksResult.count ?? 0 }
	};
};

export const actions: Actions = {
	createProject: async ({ request, locals: { supabase } }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in before creating a project.' });
		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const clientId = String(formData.get('client_id') ?? '').trim() || null;
		const description = String(formData.get('description') ?? '').trim() || null;
		const billingCurrencyCode = String(formData.get('billing_currency_code') ?? '').trim().toUpperCase() || null;
		if (!name) return fail(400, { message: 'Project name is required.' });
		if (billingCurrencyCode && !isSupportedCurrency(billingCurrencyCode)) return fail(400, { message: 'Choose a supported project currency.' });
		const { data, error } = await supabase.from('projects').insert({ user_id: user.id, name, client_id: clientId, description, billing_currency_code: billingCurrencyCode }).select('id').single();
		if (error) return fail(400, { message: error.message });
		redirect(303, `/projects/${data.id}`);
	}
};
