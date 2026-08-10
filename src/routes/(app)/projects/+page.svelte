<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import FolderKanban from '@lucide/svelte/icons/folder-kanban';
	import Plus from '@lucide/svelte/icons/plus';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import { statusLabel } from '$lib/app/format';
	import PageHeader from '$lib/components/page-header.svelte';
	import MetricCard from '$lib/components/metric-card.svelte';
	import QuickCreateDialog from '$lib/components/quick-create-dialog.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function clientName(id: string | null) {
		return data.clients.find((client) => client.id === id)?.name ?? 'No client attached';
	}

	function taskCount(id: string) {
		return data.tasks.filter((task) => task.project_id === id).length;
	}

	function doneCount(id: string) {
		return data.tasks.filter((task) => task.project_id === id && task.status === 'done').length;
	}

	let activeProjects = $derived(data.projects.filter((project) => project.status === 'active').length);
	let completedTasks = $derived(data.tasks.filter((task) => task.status === 'done').length);
</script>

<svelte:head>
	<title>Projects - Freelance OS</title>
	<meta name="description" content="Keep each freelance engagement organized and moving." />
</svelte:head>

<div class="space-y-6">
	<PageHeader title="Projects" description="Give every engagement a clear home.">
		{#snippet actions()}<QuickCreateDialog kind="project" action="?/createProject" clients={data.clients} />{/snippet}
	</PageHeader>

	<section class="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3"><MetricCard label="All projects" value={data.projects.length} detail="Workspace total" /><MetricCard label="Active now" value={activeProjects} detail="In motion" tone="primary" /><MetricCard label="Tasks completed" value={completedTasks} detail="Across projects" tone="emerald" /></section>

	{#if data.projects.length === 0}
		<Card.Root class="bg-card"><Card.Content class="flex flex-col items-center px-6 py-12 text-center"><div class="flex size-12 items-center justify-center rounded-full bg-muted"><FolderKanban class="size-5 text-muted-foreground" /></div><h2 class="mt-5 text-base font-semibold tracking-tight">No projects yet</h2><p class="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Projects make it easier to see what belongs together. Start with the next engagement on your mind.</p><Button class="mt-6" size="sm" href="/projects/new"><Plus class="size-3.5" /> Create a project</Button></Card.Content></Card.Root>
	{:else}
		<div class="overflow-hidden rounded-md border border-border bg-card">
			<div class="hidden grid-cols-[minmax(0,1.4fr)_150px_minmax(180px,0.8fr)_80px] items-center gap-4 border-b border-border bg-muted/40 px-4 py-2.5 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase sm:grid"><span>Project</span><span>Status</span><span>Progress</span><span>Tasks</span></div>
			{#each data.projects as project (project.id)}
				{@const total = taskCount(project.id)}
				{@const done = doneCount(project.id)}
				{@const progress = total ? Math.round((done / total) * 100) : 0}
				<a href={`/projects/${project.id}`} class="group grid gap-3 border-b border-border px-4 py-3.5 last:border-0 transition-colors hover:bg-muted/40 sm:grid-cols-[minmax(0,1.4fr)_150px_minmax(180px,0.8fr)_80px] sm:items-center sm:gap-4"><div class="flex min-w-0 items-center gap-3"><div class="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><FolderKanban class="size-4" /></div><div class="min-w-0"><p class="truncate text-sm font-medium group-hover:text-primary">{project.name}</p><p class="mt-0.5 truncate text-xs text-muted-foreground">{clientName(project.client_id)}</p></div></div><div><span class="text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase sm:hidden">Status · </span><Badge variant="outline">{statusLabel(project.status)}</Badge></div><div><div class="flex items-center justify-between text-xs text-muted-foreground"><span>{done} of {total} done</span><span class="font-medium text-foreground">{progress}%</span></div><div class="mt-1.5 h-1 overflow-hidden rounded-full bg-muted"><div class="h-1 rounded-full bg-primary transition-all" style={`width: ${progress}%`}></div></div></div><div class="flex items-center justify-between text-xs text-muted-foreground"><span>{total} {total === 1 ? 'task' : 'tasks'}</span><ArrowUpRight class="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div></a>
			{/each}
		</div>
	{/if}
</div>



