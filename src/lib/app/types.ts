import type { Tables } from '$lib/types/database';

export type Client = Tables<'clients'>;
export type Project = Tables<'projects'>;
export type Task = Tables<'tasks'>;

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
