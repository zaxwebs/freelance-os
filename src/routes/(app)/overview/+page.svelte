<script lang="ts">
	import { onMount } from 'svelte';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import Circle from '@lucide/svelte/icons/circle';
	import Clock3 from '@lucide/svelte/icons/clock-3';
	import FolderKanban from '@lucide/svelte/icons/folder-kanban';
	import Inbox from '@lucide/svelte/icons/inbox';
	import ListChecks from '@lucide/svelte/icons/list-checks';
	import Plus from '@lucide/svelte/icons/plus';
	import Users from '@lucide/svelte/icons/users';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import MetricCard from '$lib/components/metric-card.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import QuickCreateDialog from '$lib/components/quick-create-dialog.svelte';
	import { formatDate, isOverdue, priorityClass, priorityLabel, statusLabel } from '$lib/app/format';
	import { SvelteDate } from 'svelte/reactivity';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let currentHour = $state(new Date().getHours());
	let greeting = $derived.by(() => {
		const salutation = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
		const firstName = data.user.displayName.trim().split(/\s+/)[0];
		return firstName ? `${salutation}, ${firstName}.` : `${salutation}.`;
	});
	let openTasks = $derived(data.tasks.filter((task) => task.status !== 'done'));
	let dueSoon = $derived(
		openTasks.filter((task) => {
			if (!task.due_date) return false;
			const today = new SvelteDate();
			today.setHours(0, 0, 0, 0);
			const due = new SvelteDate(`${task.due_date.slice(0, 10)}T00:00:00`);
			const week = new SvelteDate(today);
			week.setDate(week.getDate() + 7);
			return due <= week;
		})
	);

	function projectName(id: string | null) {
		return data.projects.find((project) => project.id === id)?.name ?? 'Unassigned';
	}

	function projectTaskCount(id: string) {
		return data.tasks.filter((task) => task.project_id === id).length;
	}

	function projectDoneCount(id: string) {
		return data.tasks.filter((task) => task.project_id === id && task.status === 'done').length;
	}

	onMount(() => {
		const updateGreeting = () => {
			currentHour = new Date().getHours();
		};
		const timer = setInterval(updateGreeting, 60_000);
		return () => clearInterval(timer);
	});

</script>

<svelte:head>
	<title>Overview - Freelance OS</title>
	<meta name="description" content="A focused view of your freelance work." />
</svelte:head>

<div class="space-y-5">
	<PageHeader title={greeting} description="Here is the work that deserves your attention today.">
		{#snippet actions()}
			<QuickCreateDialog kind="project" action="/projects?/createProject" clients={data.clients} variant="outline" />
			<QuickCreateDialog kind="task" action="/tasks?/createTask" projects={data.projects} />
		{/snippet}
	</PageHeader>

	<section class="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
		<MetricCard label="Open tasks" value={openTasks.length} detail="View all" href="/tasks" icon={ListChecks} tone="primary" />
		<MetricCard label="Due this week" value={dueSoon.length} detail="Next 7 days" icon={CalendarDays} tone="amber" />
		<MetricCard label="Active projects" value={data.projects.filter((project) => project.status === 'active').length} detail="Manage" href="/projects" icon={FolderKanban} tone="violet" />
		<MetricCard label="Clients" value={data.clients.length} detail="View all" href="/clients" icon={Users} tone="emerald" />
	</section>

	<section class="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(290px,0.75fr)]">
		<Card.Root class="gap-0 bg-card py-0">
		<Card.Header class="border-b border-border px-4 py-3 sm:flex sm:flex-row sm:items-center sm:justify-between">
				<div><Card.Title class="text-base">Focus list</Card.Title><Card.Description class="mt-1 text-xs">The next pieces of work worth moving forward.</Card.Description></div>
				<a href="/tasks" class="text-xs font-medium text-muted-foreground hover:text-foreground">Open task list <ArrowUpRight class="ml-1 inline size-3.5" /></a>
			</Card.Header>
			<Card.Content class="p-0">
				{#if openTasks.length === 0}
					<div class="flex flex-col items-center px-6 py-10 text-center"><div class="flex size-10 items-center justify-center rounded-full bg-muted"><Inbox class="size-5 text-muted-foreground" /></div><h2 class="mt-3 text-sm font-semibold">You are all caught up.</h2><p class="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">Add a task when the next piece of work arrives.</p><Button class="mt-4" size="sm" href="/tasks/new"><Plus class="size-3.5" /> Add a task</Button></div>
				{:else}
					<div class="divide-y divide-border/70">
						{#each openTasks.slice(0, 7) as task (task.id)}
							<div class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40">
								<form method="POST" action="?/updateTaskStatus"><input type="hidden" name="task_id" value={task.id} /><input type="hidden" name="status" value="done" /><Button variant="ghost" size="icon-sm" type="submit" aria-label="Mark task done" class="rounded-full"><Circle class="size-4 text-muted-foreground" /></Button></form>
								<a href={`/tasks/${task.id}`} class="min-w-0 flex-1"><p class="truncate text-sm font-medium hover:text-primary">{task.title}</p><p class="mt-1 truncate text-xs text-muted-foreground">{projectName(task.project_id)}</p></a>
								<div class="hidden items-center gap-3 sm:flex"><Badge variant="outline" class={priorityClass(task.priority)}>{priorityLabel(task.priority)}</Badge><span class={`flex items-center gap-1.5 text-xs ${isOverdue(task.due_date, task.status) ? 'font-medium text-destructive' : 'text-muted-foreground'}`}><Clock3 class="size-3.5" /> {formatDate(task.due_date, { month: 'short', day: 'numeric' })}</span></div>
							</div>
						{/each}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root class="gap-0 bg-card py-0">
			<Card.Header class="border-b border-border px-4 py-3 sm:flex sm:flex-row sm:items-center sm:justify-between"><div><Card.Title class="text-base">Project pulse</Card.Title><Card.Description class="mt-1 text-xs">Progress across active work.</Card.Description></div><FolderKanban class="size-4 text-muted-foreground" /></Card.Header>
			<Card.Content class="px-4 py-4">
				{#if data.projects.filter((project) => project.status === 'active').length === 0}
					<div class="rounded-md border border-dashed border-border bg-muted/40 p-4"><p class="text-sm text-muted-foreground">Projects give your task list context. Start with one.</p><Button size="sm" class="mt-4" href="/projects/new"><Plus class="size-3.5" /> Add project</Button></div>
				{:else}
					<div class="space-y-4">
						{#each data.projects.filter((project) => project.status === 'active').slice(0, 5) as project (project.id)}
							{@const total = projectTaskCount(project.id)}
							{@const done = projectDoneCount(project.id)}
							{@const progress = total ? Math.round((done / total) * 100) : 0}
							<a href={`/projects/${project.id}`} class="block rounded-md p-1 transition-colors hover:bg-muted/60"><div class="flex items-center justify-between gap-4"><span class="truncate text-sm font-medium">{project.name}</span><span class="text-xs text-muted-foreground">{progress}%</span></div><div class="mt-2 h-1 overflow-hidden rounded-full bg-muted"><div class="h-1 rounded-full bg-primary transition-all" style={`width: ${progress}%`}></div></div><p class="mt-1.5 text-xs text-muted-foreground">{total} {total === 1 ? 'task' : 'tasks'} · {done} done</p></a>
						{/each}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</section>

	<section>
		<div class="mb-3 flex items-end justify-between"><h2 class="text-base font-semibold tracking-tight">Latest tasks</h2><a href="/tasks" class="text-xs font-medium text-muted-foreground hover:text-foreground">View all <ArrowUpRight class="ml-1 inline size-3" /></a></div>
		<div class="overflow-hidden rounded-md border border-border bg-card">
			{#each data.tasks.slice(0, 3) as task (task.id)}
				<a href={`/tasks/${task.id}`} class="group flex items-center gap-4 border-b border-border px-4 py-3 last:border-0 transition-colors hover:bg-muted/40"><div class="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted"><CheckCircle2 class="size-4 text-muted-foreground" /></div><div class="min-w-0 flex-1"><h3 class="truncate text-sm font-medium group-hover:text-primary">{task.title}</h3><p class="mt-1 truncate text-xs text-muted-foreground">{projectName(task.project_id)} · {formatDate(task.created_at, { month: 'short', day: 'numeric' })}</p></div><div class="hidden items-center gap-3 sm:flex"><Badge variant="outline">{statusLabel(task.status)}</Badge><span class={`text-xs font-medium ${priorityClass(task.priority)}`}>{priorityLabel(task.priority)}</span></div></a>
			{:else}
				<div class="flex flex-col items-center px-6 py-10 text-center"><CheckCircle2 class="size-6 text-muted-foreground" /><p class="mt-3 text-sm text-muted-foreground">No tasks yet. Your first one can start here.</p></div>
			{/each}
		</div>
	</section>
</div>


