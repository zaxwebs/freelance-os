<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import Check from '@lucide/svelte/icons/check';
	import Circle from '@lucide/svelte/icons/circle';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import GripVertical from '@lucide/svelte/icons/grip-vertical';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import type { DndEvent } from 'svelte-dnd-action';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Popover from '$lib/components/ui/popover';
	import PageHeader from '$lib/components/page-header.svelte';
	import QuickCreateDialog from '$lib/components/quick-create-dialog.svelte';
	import TaskSectionNav from '$lib/components/task-section-nav.svelte';
	import { formatDate, isOverdue, overdueDateClass, priorityClass, priorityLabel } from '$lib/app/format';
	import { taskStatuses } from '$lib/app/types';
	import type { Task, TaskStatus } from '$lib/app/types';
	import type { PageData } from './$types';

	type Board = Record<TaskStatus, Task[]>;

	let { data }: { data: PageData } = $props();

	function createBoard(tasks: Task[]): Board {
		return {
			todo: tasks.filter((task) => task.status === 'todo').map((task) => ({ ...task })),
			in_progress: tasks.filter((task) => task.status === 'in_progress').map((task) => ({ ...task })),
			done: tasks.filter((task) => task.status === 'done').map((task) => ({ ...task }))
		};
	}

	function createInitialBoard() {
		return createBoard(data.tasks);
	}

	function createInitialTaskCounts() {
		return { ...data.taskCounts };
	}

	function loadedCount(status: TaskStatus) {
		return data.tasks.filter((task) => task.status === status).length;
	}

	function createInitialOffsets() {
		return { todo: loadedCount('todo'), in_progress: loadedCount('in_progress'), done: loadedCount('done') };
	}

	function createInitialHasMore() {
		return {
			todo: loadedCount('todo') < data.taskCounts.todo,
			in_progress: loadedCount('in_progress') < data.taskCounts.in_progress,
			done: loadedCount('done') < data.taskCounts.done
		};
	}

	let board = $state<Board>(createInitialBoard());
	let taskCounts = $state<Record<TaskStatus, number>>(createInitialTaskCounts());
	let nextOffsets = $state<Record<TaskStatus, number>>(createInitialOffsets());
	let hasMore = $state<Record<TaskStatus, boolean>>(createInitialHasMore());
	let loading = $state<Record<TaskStatus, boolean>>({ todo: false, in_progress: false, done: false });
	let saveError = $state('');
	let loadedProjectId: string | null = null;
	let projectFilterOpen = $state(false);
	let projectQuery = $state('');
	const flipDurationMs = 150;
	let filteredProjects = $derived(
		data.projects.filter((project) => project.name.toLowerCase().includes(projectQuery.trim().toLowerCase()))
	);

	function resetBoard() {
		board = createInitialBoard();
		taskCounts = createInitialTaskCounts();
		nextOffsets = createInitialOffsets();
		hasMore = createInitialHasMore();
		loading = { todo: false, in_progress: false, done: false };
		saveError = '';
	}

	async function refreshBoard() {
		await invalidateAll();
		resetBoard();
	}

	$effect(() => {
		if (loadedProjectId === data.projectId) return;

		loadedProjectId = data.projectId;
		resetBoard();
	});

	function projectName(id: string | null) {
		return data.projects.find((project) => project.id === id)?.name ?? 'Unassigned';
	}

	function projectHref(id: string) {
		return id === 'all' ? '/tasks/kanban' : `/tasks/kanban?project=${encodeURIComponent(id)}`;
	}

	function handleConsider(status: TaskStatus, event: CustomEvent<DndEvent<Task>>) {
		board[status] = event.detail.items;
	}

	async function handleFinalize(status: TaskStatus, event: CustomEvent<DndEvent<Task>>) {
		board[status] = event.detail.items;
		const taskId = event.detail.info.id;
		const movedTask = board[status].find((task) => task.id === taskId);

		if (!movedTask || movedTask.status === status) return;
		const previousStatus = movedTask.status as TaskStatus;

		const formData = new FormData();
		formData.set('task_id', taskId);
		formData.set('status', status);

		const response = await fetch('?/updateTaskStatus', { method: 'POST', body: formData });
		if (!response.ok) {
			board[status] = board[status].filter((task) => task.id !== taskId);
			board[previousStatus] = [...board[previousStatus], { ...movedTask, status: previousStatus }];
			saveError = 'The task could not be moved. Please try again.';
			return;
		}

		board[status] = board[status].map((task) => (task.id === taskId ? { ...task, status } : task));
		if (previousStatus !== status) {
			taskCounts[previousStatus] = Math.max(0, taskCounts[previousStatus] - 1);
			taskCounts[status] += 1;
		}
		saveError = '';
		await invalidateAll();
	}

	async function loadMore(status: TaskStatus) {
		if (!hasMore[status] || loading[status]) return;

		loading[status] = true;
		try {
			const params = new URLSearchParams({ status, offset: String(nextOffsets[status]) });
			if (data.projectId !== 'all') params.set('project', data.projectId);
			const response = await fetch(`/api/tasks/kanban?${params}`);
			if (!response.ok) throw new Error('Unable to load more tasks.');

			const result: { tasks: Task[]; total: number; hasMore: boolean } = await response.json();
			const existingIds = new Set(board[status].map((task) => task.id));
			const newTasks = result.tasks.filter((task) => !existingIds.has(task.id)).map((task) => ({ ...task }));
			board[status] = [...board[status], ...newTasks];
			nextOffsets[status] += result.tasks.length;
			taskCounts[status] = result.total;
			hasMore[status] = result.hasMore && result.tasks.length > 0;
		} catch {
			saveError = 'More tasks could not be loaded. Please try again.';
		} finally {
			loading[status] = false;
		}
	}
</script>

<svelte:head>
	<title>Task board - Freelance OS</title>
	<meta name="description" content="See tasks across a simple status board." />
</svelte:head>

<div class="space-y-6">
	<PageHeader title="Kanban" description="Move work through the stages that matter.">
		{#snippet actions()}<QuickCreateDialog kind="task" action="/tasks?/createTask" projects={data.projects} defaultProjectId={data.projectId === 'all' ? undefined : data.projectId} onSuccess={refreshBoard} label="Add task" />{/snippet}
	</PageHeader>
	<TaskSectionNav active="kanban" />

	<div class="flex flex-wrap items-center gap-2 border-b border-border/70 pb-4">
		<span class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Filter</span>
		<Popover.Root bind:open={projectFilterOpen}>
			<Popover.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="outline" size="sm" class="max-w-full justify-between gap-2 sm:min-w-64">
						<span class="flex min-w-0 items-center gap-1.5">
							<span class="text-muted-foreground">Project:</span>
							<span class="truncate">{data.projectId === 'all' ? 'All projects' : projectName(data.projectId)}</span>
						</span>
						<ChevronDown class="size-3.5 shrink-0 text-muted-foreground" />
					</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content align="start" class="w-80 max-w-[calc(100vw-2rem)] gap-0 overflow-hidden p-0">
				<div class="flex items-center gap-2 border-b border-border px-3">
					<Search class="size-3.5 shrink-0 text-muted-foreground" />
					<input bind:value={projectQuery} aria-label="Search projects" placeholder="Search projects..." class="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
				</div>
				<div class="max-h-72 overflow-y-auto p-1" role="listbox" aria-label="Projects">
					<a href={projectHref('all')} role="option" aria-selected={data.projectId === 'all'} onclick={() => { projectFilterOpen = false; projectQuery = ''; }} class="flex items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none">
						<Check class={`size-3.5 shrink-0 ${data.projectId === 'all' ? 'opacity-100' : 'opacity-0'}`} />
						<span>All projects</span>
					</a>
					{#each filteredProjects as project (project.id)}
						<a href={projectHref(project.id)} role="option" aria-selected={data.projectId === project.id} onclick={() => { projectFilterOpen = false; projectQuery = ''; }} class="flex items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none">
							<Check class={`size-3.5 shrink-0 ${data.projectId === project.id ? 'opacity-100' : 'opacity-0'}`} />
							<span class="truncate">{project.name}</span>
						</a>
					{:else}
						<p class="px-2 py-6 text-center text-xs text-muted-foreground">No projects match your search.</p>
					{/each}
				</div>
			</Popover.Content>
		</Popover.Root>
	</div>

	{#if saveError}
		<div role="alert" class="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{saveError}</div>
	{/if}

	<div class="grid gap-4 lg:grid-cols-3">
		{#each taskStatuses as column (column.value)}
			<Card.Root class="h-full gap-0 bg-card py-0">
				<Card.Header class="border-b border-border/70 px-4 py-3">
					<div class="flex items-center justify-between gap-3">
						<div class="flex min-w-0 items-center gap-2"><span class={`size-2 rounded-full ${column.value === 'done' ? 'bg-emerald-500' : column.value === 'in_progress' ? 'bg-blue-500' : 'bg-muted-foreground/50'}`}></span><Card.Title class="text-sm">{column.label}</Card.Title></div>
						<span class="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{taskCounts[column.value]}</span>
					</div>
					<Card.Description class="mt-1 text-xs">{column.value === 'done' ? 'Completed work' : column.value === 'in_progress' ? 'Currently moving' : 'Ready to start'}</Card.Description>
				</Card.Header>
				<Card.Content class="relative flex min-h-0 flex-1 flex-col p-3">
					<div
						aria-label={`${column.label} tasks`}
						class="flex min-h-32 flex-1 flex-col space-y-3 rounded-md"
						use:dndzone={{ items: board[column.value], type: 'task-status', flipDurationMs, delayTouchStart: 150 }}
						onconsider={(event) => handleConsider(column.value, event)}
						onfinalize={(event) => handleFinalize(column.value, event)}
					>
						{#each board[column.value] as task (task.id)}
							<article aria-label={task.title} class="rounded-md border border-border bg-background p-3 shadow-xs transition-colors hover:border-primary/40" animate:flip={{ duration: flipDurationMs }}>
								<div class="flex items-start gap-2"><GripVertical class="mt-0.5 size-4 shrink-0 cursor-grab text-muted-foreground/60" aria-hidden="true" /><a href={`/tasks/${task.id}`} class="group block min-w-0 flex-1"><p class={`text-sm font-medium leading-5 group-hover:text-primary ${task.status === 'done' ? 'text-muted-foreground line-through' : ''}`}>{task.title}</p><p class="mt-1 truncate text-xs text-muted-foreground">{projectName(task.project_id)}</p></a></div>
								<div class="mt-3 flex flex-wrap items-center gap-1.5"><Badge class={priorityClass(task.priority)}>{priorityLabel(task.priority)}</Badge><span class={`flex items-center gap-1 text-[11px] ${overdueDateClass(isOverdue(task.due_date, task.status))}`}><CalendarDays class="size-3" /> {formatDate(task.due_date, { month: 'short', day: 'numeric' })}</span></div>
							</article>
						{/each}
					</div>
					{#if hasMore[column.value]}
						<div class="mt-3" aria-live="polite">
							<Button type="button" variant="outline" size="sm" class="w-full gap-1.5" onclick={() => loadMore(column.value)} disabled={loading[column.value]}>
								{#if loading[column.value]}<LoaderCircle class="size-3.5 animate-spin" aria-hidden="true" /> Loading...{:else}Load more tasks{/if}
							</Button>
						</div>
					{/if}
					{#if board[column.value].length === 0}
						<div class="pointer-events-none absolute inset-3 flex min-h-32 flex-col items-center justify-center rounded-md border border-dashed border-border px-4 py-8 text-center"><Circle class="size-5 text-muted-foreground/50" /><p class="mt-2 text-xs text-muted-foreground">Drop tasks here.</p></div>
					{/if}
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	{#if data.tasks.length === 0}
		<div class="flex flex-col items-center rounded-md border border-dashed border-border px-6 py-10 text-center"><p class="text-sm font-medium">{data.projectId === 'all' ? 'No tasks yet' : 'No tasks in this project'}</p><p class="mt-1 text-xs text-muted-foreground">{data.projectId === 'all' ? 'Create your first task to start using the board.' : 'Choose another project or return to the full board.'}</p>{#if data.projectId === 'all'}<Button class="mt-4" size="sm" href="/tasks/new"><Plus class="size-3.5" /> Add task</Button>{:else}<Button class="mt-4" size="sm" variant="outline" href="/tasks/kanban">Show all projects</Button>{/if}</div>
	{:else}
		<a href="/tasks" class="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">Open task list <ArrowUpRight class="size-3.5" /></a>
	{/if}
</div>
