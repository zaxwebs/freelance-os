import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';
import type { Client, Project, Task } from '$lib/app/types';

export type WorkspaceClient = SupabaseClient<Database>;

export async function getCurrentUser(supabase: WorkspaceClient): Promise<User | null> {
	const {
		data: { user }
	} = await supabase.auth.getUser();
	return user;
}

export async function getWorkspaceData(supabase: WorkspaceClient) {
	const [clientsResult, projectsResult, tasksResult] = await Promise.all([
		supabase.from('clients').select('*').order('name'),
		supabase.from('projects').select('*').order('created_at', { ascending: false }),
		supabase.from('tasks').select('*').order('due_date', { ascending: true, nullsFirst: false })
	]);

	const error = clientsResult.error ?? projectsResult.error ?? tasksResult.error;
	if (error) throw error;

	return {
		clients: (clientsResult.data ?? []) as Client[],
		projects: (projectsResult.data ?? []) as Project[],
		tasks: (tasksResult.data ?? []) as Task[]
	};
}

export async function getProjectData(supabase: WorkspaceClient, projectId: string) {
	const [projectResult, tasksResult] = await Promise.all([
		supabase.from('projects').select('*').eq('id', projectId).single(),
		supabase.from('tasks').select('*').eq('project_id', projectId).order('due_date', { ascending: true, nullsFirst: false })
	]);

	if (projectResult.error) throw projectResult.error;
	if (tasksResult.error) throw tasksResult.error;

	return { project: projectResult.data as Project, tasks: (tasksResult.data ?? []) as Task[] };
}
