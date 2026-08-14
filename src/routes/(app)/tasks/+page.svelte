<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import Circle from '@lucide/svelte/icons/circle';
	import ListFilter from '@lucide/svelte/icons/list-filter';
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';
	import X from '@lucide/svelte/icons/x';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import Input from '$lib/components/ui/input/input.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import PaginationControls from '$lib/components/pagination-controls.svelte';
	import ProjectFilter from '$lib/components/project-filter.svelte';
	import QuickCreateDialog from '$lib/components/quick-create-dialog.svelte';
	import TaskSectionNav from '$lib/components/task-section-nav.svelte';
	import { formatDate, isOverdue, overdueDateClass, priorityClass, priorityLabel, statusClass, statusLabel } from '$lib/app/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function projectName(id: string | null) {
		return data.projects.find((project) => project.id === id)?.name ?? 'Unassigned';
	}

	function clearSearchHref() {
		const params = new URLSearchParams();
		if (data.status !== 'all') params.set('status', data.status);
		if (data.projectId !== 'all') params.set('project', data.projectId);
		const search = params.toString();
		return `/tasks${search ? `?${search}` : ''}`;
	}

	const filters = [
		['all', 'All'],
		['todo', 'To do'],
		['in_progress', 'In progress'],
		['done', 'Done']
	];
</script>

<svelte:head>
	<title>Tasks - Freelance OS</title>
	<meta name="description" content="Track every next action across your freelance work." />
</svelte:head>

<div class="space-y-6">
	<PageHeader title="Tasks" description="A focused list of what moves the work forward.">
		{#snippet actions()}<QuickCreateDialog kind="task" action="?/createTask" projects={data.projects} defaultProjectId={data.projectId === 'all' ? undefined : data.projectId} />{/snippet}
	</PageHeader>

	<TaskSectionNav active="tasks" />

	<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
		<form method="GET" class="min-w-0 flex-1">
			<input type="hidden" name="status" value={data.status} />
			<input type="hidden" name="project" value={data.projectId} />
			<div class="relative">
				<Search class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input name="q" value={data.query} autocomplete="off" placeholder="Search tasks..." aria-label="Search tasks" class="pr-9 pl-9" />
				{#if data.query}
					<a href={clearSearchHref()} aria-label="Clear search" class="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"><X class="size-3.5" /></a>
				{/if}
			</div>
		</form>
		<ProjectFilter projects={data.projects} projectId={data.projectId} basePath="/tasks" query={data.query} status={data.status} />
	</div>

	<div class="space-y-2">
	<Card.Root class="overflow-hidden gap-0 bg-card py-0">
		<Card.Header class="border-b border-border/70 px-5 py-4 sm:flex sm:flex-row sm:items-center sm:justify-between"><div><Card.Title class="text-base">Task List</Card.Title><Card.Description class="mt-1 text-xs">Keep the next action visible and easy to finish.</Card.Description></div><nav aria-label="Task status" class="flex items-center gap-1 rounded-md bg-muted/70 p-1 sm:ml-auto">{#each filters as item (item[0])}<a href={`/tasks?status=${item[0]}${data.query ? `&q=${encodeURIComponent(data.query)}` : ''}${data.projectId !== 'all' ? `&project=${data.projectId}` : ''}`} class={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${data.status === item[0] ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:bg-background/60 hover:text-foreground'}`}>{item[1]}</a>{/each}</nav></Card.Header>
		<Card.Content class="p-0">
			{#if data.tasks.length === 0}
				<div class="flex flex-col items-center px-6 py-12 text-center"><div class="flex size-11 items-center justify-center rounded-full bg-muted"><ListFilter class="size-5 text-muted-foreground" /></div><h2 class="mt-4 text-sm font-semibold">No tasks match this view.</h2><p class="mt-1 text-xs text-muted-foreground">Try a different filter or add a new task.</p><Button class="mt-5" size="sm" href="/tasks/new"><Plus class="size-3.5" /> Add task</Button></div>
			{:else}
				<div class="hidden grid-cols-[auto_minmax(0,1fr)_140px_100px_130px] items-center gap-4 border-b border-border/70 bg-muted/30 px-5 py-2.5 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase sm:grid"><span></span><span>Task</span><span>Status</span><span>Priority</span><span>Due</span></div>
				<div class="divide-y divide-border/70">
					{#each data.tasks as task (task.id)}
						<div class="grid gap-3 px-5 py-4 transition-colors hover:bg-muted/30 sm:grid-cols-[auto_minmax(0,1fr)_140px_100px_130px] sm:items-center sm:gap-4">
							<form method="POST" action="?/updateTaskStatus"><input type="hidden" name="task_id" value={task.id} /><input type="hidden" name="status" value={task.status === 'done' ? 'todo' : 'done'} /><Button variant="ghost" size="icon-sm" type="submit" aria-label={task.status === 'done' ? 'Reopen task' : 'Mark task done'} class="rounded-full">{#if task.status === 'done'}<CheckCircle2 class="size-4 text-emerald-600" />{:else}<Circle class="size-4 text-muted-foreground" />{/if}</Button></form>
							<a href={`/tasks/${task.id}`} class="min-w-0 sm:col-auto"><p class={`truncate text-sm font-medium ${task.status === 'done' ? 'text-muted-foreground line-through' : 'hover:text-primary'}`}>{task.title}</p><p class="mt-1 truncate text-xs text-muted-foreground">{projectName(task.project_id)}</p></a>
							<div class="flex items-center gap-2 sm:block"><span class="text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase sm:hidden">Status</span><Badge class={statusClass(task.status)}>{statusLabel(task.status)}</Badge></div>
							<div class="flex items-center gap-2 sm:block"><span class="text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase sm:hidden">Priority</span><Badge variant="outline" class={priorityClass(task.priority)}>{priorityLabel(task.priority)}</Badge></div>
							<span class={`flex items-center gap-2 text-xs ${overdueDateClass(isOverdue(task.due_date, task.status))}`}><CalendarDays class="size-3.5" /> {formatDate(task.due_date, { month: 'short', day: 'numeric' })}<ArrowUpRight class="ml-auto size-3.5 sm:hidden" /></span>
						</div>
					{/each}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
	<PaginationControls basePath="/tasks" page={data.pagination.page} pageSize={data.pagination.pageSize} total={data.pagination.total} query={{ q: data.query, status: data.status, project: data.projectId }} />
	</div>
</div>




