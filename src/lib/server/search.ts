import type { SearchClient, SearchProject, SearchTask, WorkspaceSearchResults } from '$lib/app/search';
import type { WorkspaceClient } from './workspace';

const MAX_QUERY_LENGTH = 80;

function mergeById<T extends { id: string }>(...lists: T[][]): T[] {
	const merged = new Map<string, T>();
	for (const list of lists) {
		for (const item of list) merged.set(item.id, item);
	}
	return [...merged.values()];
}

export function normalizeSearchQuery(value: string | null | undefined): string {
	return (value ?? '').trim().replace(/\s+/g, ' ').slice(0, MAX_QUERY_LENGTH);
}

export async function searchWorkspace(supabase: WorkspaceClient, rawQuery: string, limit = 6): Promise<WorkspaceSearchResults> {
	const query = normalizeSearchQuery(rawQuery);
	if (query.length < 2) return { tasks: [], projects: [], clients: [] };

	const pattern = `%${query}%`;
	const [taskTitleResult, taskDescriptionResult, projectNameResult, projectDescriptionResult, clientNameResult, clientCompanyResult, clientEmailResult] = await Promise.all([
		supabase.from('tasks').select('id,title,status,priority,project_id,due_date').ilike('title', pattern).order('updated_at', { ascending: false }).limit(limit),
		supabase.from('tasks').select('id,title,status,priority,project_id,due_date').ilike('description', pattern).order('updated_at', { ascending: false }).limit(limit),
		supabase.from('projects').select('id,name,status,client_id').ilike('name', pattern).order('updated_at', { ascending: false }).limit(limit),
		supabase.from('projects').select('id,name,status,client_id').ilike('description', pattern).order('updated_at', { ascending: false }).limit(limit),
		supabase.from('clients').select('id,name,company,email').ilike('name', pattern).order('name').limit(limit),
		supabase.from('clients').select('id,name,company,email').ilike('company', pattern).order('name').limit(limit),
		supabase.from('clients').select('id,name,company,email').ilike('email', pattern).order('name').limit(limit)
	]);

	const firstError = [taskTitleResult, taskDescriptionResult, projectNameResult, projectDescriptionResult, clientNameResult, clientCompanyResult, clientEmailResult].find((result) => result.error)?.error;
	if (firstError) throw firstError;

	const taskRows = mergeById(taskTitleResult.data ?? [], taskDescriptionResult.data ?? []).slice(0, limit);
	const projectRows = mergeById(projectNameResult.data ?? [], projectDescriptionResult.data ?? []).slice(0, limit);
	const clientRows = mergeById(clientNameResult.data ?? [], clientCompanyResult.data ?? [], clientEmailResult.data ?? []).slice(0, limit);

	const taskProjectIds = [...new Set(taskRows.map((task) => task.project_id).filter((id): id is string => Boolean(id)))];
	const projectClientIds = [...new Set(projectRows.map((project) => project.client_id).filter((id): id is string => Boolean(id)))];
	const [taskProjectsResult, projectClientsResult] = await Promise.all([
		taskProjectIds.length ? supabase.from('projects').select('id,name').in('id', taskProjectIds) : Promise.resolve({ data: [], error: null }),
		projectClientIds.length ? supabase.from('clients').select('id,name').in('id', projectClientIds) : Promise.resolve({ data: [], error: null })
	]);
	if (taskProjectsResult.error) throw taskProjectsResult.error;
	if (projectClientsResult.error) throw projectClientsResult.error;

	const taskProjectNames = new Map((taskProjectsResult.data ?? []).map((project) => [project.id, project.name]));
	const projectClientNames = new Map((projectClientsResult.data ?? []).map((client) => [client.id, client.name]));

	return {
		tasks: taskRows.map((task): SearchTask => ({ ...task, projectName: task.project_id ? (taskProjectNames.get(task.project_id) ?? null) : null })),
		projects: projectRows.map((project): SearchProject => ({ ...project, clientName: project.client_id ? (projectClientNames.get(project.client_id) ?? null) : null })),
		clients: clientRows as SearchClient[]
	};
}
