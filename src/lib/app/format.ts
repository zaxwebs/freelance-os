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
	const labels: Record<string, string> = {
		todo: 'To do',
		in_progress: 'In progress',
		done: 'Done',
		active: 'Active',
		on_hold: 'On hold',
		completed: 'Completed',
		archived: 'Archived',
		draft: 'Draft',
		ended: 'Ended',
		sent: 'Sent',
		viewed: 'Viewed',
		partially_paid: 'Partially paid',
		paid: 'Paid',
		overdue: 'Overdue',
		void: 'Void',
		accepted: 'Accepted',
		declined: 'Declined',
		expired: 'Expired'
	};
	return labels[status] ?? status;
}

export function priorityLabel(priority: string) {
	return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function statusClass(status: TaskStatus | string) {
	return status === 'done' || status === 'completed'
		? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
		: status === 'in_progress' || status === 'active'
			? 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
			: status === 'on_hold'
				? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
				: 'bg-muted text-muted-foreground';
}

export function priorityClass(priority: TaskPriority | string) {
	return priority === 'urgent'
		? 'border-transparent bg-destructive text-white'
		: priority === 'high'
			? 'border-transparent bg-violet-600 text-white'
			: priority === 'medium'
				? 'border-transparent bg-blue-600 text-white'
				: 'border-transparent bg-emerald-600 text-white';
}

export function invoiceStatusClass(status: string) {
	return status === 'paid'
		? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/25 dark:text-emerald-300'
		: status === 'overdue'
			? 'border-destructive/20 bg-destructive/10 text-destructive dark:border-destructive/30'
			: status === 'partially_paid'
				? 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:border-amber-400/25 dark:text-amber-300'
				: status === 'void'
					? 'border-border bg-muted text-muted-foreground'
					: 'border-blue-500/20 bg-blue-500/10 text-blue-700 dark:border-blue-400/25 dark:text-blue-300';
}

export function proposalStatusClass(status: string) {
	return status === 'accepted'
		? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
		: status === 'declined'
			? 'bg-destructive/10 text-destructive'
			: status === 'expired'
				? 'bg-muted text-muted-foreground'
				: status === 'sent' || status === 'viewed'
					? 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
					: 'bg-amber-500/10 text-amber-700 dark:text-amber-300';
}

export function isOverdue(value: string | null | undefined, status: string) {
	if (!value || status === 'done') return false;
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return new Date(`${value.slice(0, 10)}T00:00:00`) < today;
}

export function overdueDateClass(overdue: boolean) {
	return overdue ? 'font-medium text-pink-700 dark:text-pink-300' : 'text-muted-foreground';
}
