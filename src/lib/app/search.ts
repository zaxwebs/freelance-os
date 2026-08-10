import type { Client, Project, Task } from './types';
import { priorityLabel, statusLabel } from './format';

export type SearchTask = Pick<Task, 'id' | 'title' | 'status' | 'priority' | 'project_id' | 'due_date'> & {
	projectName: string | null;
};

export type SearchProject = Pick<Project, 'id' | 'name' | 'status' | 'client_id'> & {
	clientName: string | null;
};

export type SearchClient = Pick<Client, 'id' | 'name' | 'company' | 'email'>;

export interface WorkspaceSearchResults {
	tasks: SearchTask[];
	projects: SearchProject[];
	clients: SearchClient[];
}

export type SearchResultKind = 'task' | 'project' | 'client';

export interface SearchResultItem {
	kind: SearchResultKind;
	id: string;
	title: string;
	subtitle: string;
	meta: string;
	href: string;
	index: number;
}

export interface SearchResultGroup {
	kind: SearchResultKind;
	label: string;
	items: SearchResultItem[];
}

export function emptyWorkspaceSearch(): WorkspaceSearchResults {
	return { tasks: [], projects: [], clients: [] };
}

export function getSearchGroups(results: WorkspaceSearchResults): SearchResultGroup[] {
	let index = 0;
	const groups: SearchResultGroup[] = [
		{
			kind: 'task',
			label: 'Tasks',
			items: results.tasks.map((task) => ({
				kind: 'task',
				id: task.id,
				title: task.title,
				subtitle: task.projectName ?? 'Unassigned task',
				meta: `${statusLabel(task.status)} · ${priorityLabel(task.priority)}`,
				href: `/tasks/${task.id}`,
				index: index++
			}))
		},
		{
			kind: 'project',
			label: 'Projects',
			items: results.projects.map((project) => ({
				kind: 'project',
				id: project.id,
				title: project.name,
				subtitle: project.clientName ?? 'No client attached',
				meta: statusLabel(project.status),
				href: `/projects/${project.id}`,
				index: index++
			}))
		},
		{
			kind: 'client',
			label: 'Clients',
			items: results.clients.map((client) => ({
				kind: 'client',
				id: client.id,
				title: client.name,
				subtitle: client.company ?? 'Independent client',
				meta: client.email ?? '',
				href: `/clients/${client.id}`,
				index: index++
			}))
		}
	];

	return groups.filter((group) => group.items.length > 0);
}
