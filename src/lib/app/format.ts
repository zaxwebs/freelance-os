import type { TaskPriority, TaskStatus } from './types';

export function formatDate(value: string | null | undefined, options?: Intl.DateTimeFormatOptions) {
	if (!value) return 'No due date';
	return new Intl.DateTimeFormat('en', options ?? { month: 'short', day: 'numeric', year: 'numeric' }).format(
		new Date(`${value.slice(0, 10)}T00:00:00`)
	);
}

export function formatDateTime(value: string | null | undefined) {
	if (!value) return 'Never';
	return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export function initials(value: string) {
	return value
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join('');
}

export function statusLabel(status: string) {
	return status === 'in_progress' ? 'In progress' : status === 'todo' ? 'To do' : 'Done';
}

export function priorityLabel(priority: string) {
	return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function statusClass(status: TaskStatus | string) {
	return status === 'done'
		? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
		: status === 'in_progress'
			? 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
			: 'bg-muted text-muted-foreground';
}

export function priorityClass(priority: TaskPriority | string) {
	return priority === 'urgent'
		? 'text-destructive'
		: priority === 'high'
			? 'text-amber-600 dark:text-amber-400'
			: priority === 'medium'
				? 'text-foreground'
				: 'text-muted-foreground';
}

export function isOverdue(value: string | null | undefined, status: string) {
	if (!value || status === 'done') return false;
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return new Date(`${value.slice(0, 10)}T00:00:00`) < today;
}
