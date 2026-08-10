<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import FolderKanban from '@lucide/svelte/icons/folder-kanban';
	import ListChecks from '@lucide/svelte/icons/list-checks';
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import UserRound from '@lucide/svelte/icons/user-round';
	import Users from '@lucide/svelte/icons/users';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import Input from '$lib/components/ui/input/input.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import MetricCard from '$lib/components/metric-card.svelte';
	import PaginationControls from '$lib/components/pagination-controls.svelte';
	import QuickCreateDialog from '$lib/components/quick-create-dialog.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	function projectCount(id: string) {
		return data.projects.filter((project) => project.client_id === id).length;
	}

	function taskCount(id: string) {
		const projectIds = data.projects.filter((project) => project.client_id === id).map((project) => project.id);
		return data.tasks.filter((task) => task.project_id && projectIds.includes(task.project_id)).length;
	}
</script>

<svelte:head>
	<title>Clients - Freelance OS</title>
	<meta name="description" content="Keep the people behind your work close at hand." />
</svelte:head>

<div class="space-y-6">
	<PageHeader title="Clients" description="The people behind the work.">
		{#snippet actions()}<QuickCreateDialog kind="client" action="?/createClient" />{/snippet}
	</PageHeader>

	<Card.Root class="bg-card"><Card.Content class="p-3 sm:p-4"><form method="GET" class="relative max-w-lg"><Search class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input name="q" value={data.query} placeholder="Search by name or company..." aria-label="Search clients" class="pl-9" /></form></Card.Content></Card.Root>

	<section class="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3"><MetricCard label="Clients" value={data.pagination.total} detail="Workspace total" icon={Users} tone="primary" /><MetricCard label="Projects" value={data.metrics.totalProjects} detail="Across clients" icon={FolderKanban} /><MetricCard label="Tracked tasks" value={data.metrics.totalTasks} detail="Connected work" icon={ListChecks} tone="emerald" /></section>

	{#if data.clients.length === 0}
		<Card.Root class="bg-card"><Card.Content class="flex flex-col items-center px-6 py-12 text-center"><div class="flex size-12 items-center justify-center rounded-full bg-muted"><Users class="size-5 text-muted-foreground" /></div><h2 class="mt-5 text-base font-semibold tracking-tight">{data.query ? 'No clients found' : 'No clients yet'}</h2><p class="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{data.query ? 'Try a different search.' : 'Add a client to give every project a relationship and a little more context.'}</p>{#if !data.query}<Button class="mt-6" size="sm" href="/clients/new"><Plus class="size-3.5" /> Add a client</Button>{/if}</Card.Content></Card.Root>
	{:else}
		<div class="space-y-2">
		<div class="overflow-hidden rounded-md border border-border bg-card">
			<div class="hidden grid-cols-[minmax(0,1.4fr)_120px_120px_minmax(0,1fr)] items-center gap-4 border-b border-border bg-muted/40 px-4 py-2.5 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase sm:grid"><span>Client</span><span>Projects</span><span>Tasks</span><span>Contact</span></div>
			{#each data.clients as client (client.id)}
				<a href={`/clients/${client.id}`} class="group grid gap-3 border-b border-border px-4 py-3.5 last:border-0 transition-colors hover:bg-muted/40 sm:grid-cols-[minmax(0,1.4fr)_120px_120px_minmax(0,1fr)] sm:items-center sm:gap-4"><div class="flex min-w-0 items-center gap-3"><div class="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">{client.name.slice(0, 1).toUpperCase()}</div><div class="min-w-0"><p class="truncate text-sm font-medium group-hover:text-primary">{client.name}</p><p class="mt-0.5 truncate text-xs text-muted-foreground">{client.company ?? 'Independent client'}</p></div></div><div><span class="text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase sm:hidden">Projects · </span><span class="text-sm font-medium">{projectCount(client.id)}</span></div><div><span class="text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase sm:hidden">Tasks · </span><span class="text-sm font-medium">{taskCount(client.id)}</span></div><div class="flex min-w-0 items-center justify-between gap-3 text-xs text-muted-foreground"><span class="flex min-w-0 items-center gap-2 truncate"><UserRound class="size-3.5 shrink-0" /> {client.email ?? 'No email added'}</span><ArrowUpRight class="size-3.5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div></a>
			{/each}
		</div>
		<PaginationControls basePath="/clients" page={data.pagination.page} pageSize={data.pagination.pageSize} total={data.pagination.total} query={{ q: data.query }} />
		</div>
	{/if}
</div>



