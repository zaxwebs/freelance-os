<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import FolderKanban from '@lucide/svelte/icons/folder-kanban';
	import ListChecks from '@lucide/svelte/icons/list-checks';
	import Mail from '@lucide/svelte/icons/mail';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import MetricCard from '$lib/components/metric-card.svelte';
	import QuickCreateDialog from '$lib/components/quick-create-dialog.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form?: ActionData } = $props();
	let client = $derived(data.client);
</script>

<svelte:head><title>{client?.name ?? 'Client'} - Freelance OS</title></svelte:head>

{#if client}
	<div class="space-y-4">
		<div class="flex items-center gap-2 text-xs text-muted-foreground"><a href="/clients" class="inline-flex items-center gap-1.5 hover:text-foreground"><ArrowLeft class="size-3.5" /> Clients</a><span aria-hidden="true">/</span><span class="truncate font-medium text-foreground">{client.name}</span></div>
		<header class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div class="flex min-w-0 items-center gap-3"><div class="flex size-9 shrink-0 items-center justify-center rounded-md bg-foreground text-sm font-semibold text-background">{client.name.slice(0, 1).toUpperCase()}</div><div class="min-w-0"><h1 class="truncate text-xl font-semibold tracking-tight">{client.name}</h1><div class="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground"><span>{client.company ?? 'Independent client'}</span>{#if client.email}<span aria-hidden="true">·</span><a href={`mailto:${client.email}`} class="inline-flex items-center gap-1.5 hover:text-foreground"><Mail class="size-3.5" /> {client.email}</a>{/if}</div></div></div><div class="flex flex-wrap gap-2"><QuickCreateDialog kind="project" action="/projects?/createProject" clients={[client]} defaultClientId={client.id} label="New project" variant="outline" /><form method="POST" action="?/deleteClient" onsubmit={(event) => { if (!confirm('Delete this client? Projects will remain but become unassigned.')) event.preventDefault(); }}><Button variant="outline" size="sm" type="submit" class="text-destructive hover:text-destructive"><Trash2 class="size-3.5" /> Delete</Button></form></div></header>
		<section class="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3"><MetricCard label="Projects" value={data.projects.length} detail="Connected work" icon={FolderKanban} tone="primary" /><MetricCard label="Tasks" value={data.tasks.length} detail="Across projects" icon={ListChecks} /><MetricCard label="Completed" value={data.tasks.filter((task) => task.status === 'done').length} detail="Finished work" icon={CheckCircle2} tone="emerald" /></section>
		<div class="grid gap-4 xl:grid-cols-[1fr_320px]"><Card.Root class="bg-card py-0"><Card.Header class="border-b border-border px-4 py-3"><Card.Title class="text-base">Projects for {client.name}</Card.Title><Card.Description class="mt-0.5 text-xs">Work connected to this relationship.</Card.Description></Card.Header><Card.Content class="p-4">{#if data.projects.length === 0}<div class="border border-dashed border-border px-5 py-8 text-center"><FolderKanban class="mx-auto size-5 text-muted-foreground" /><p class="mt-3 text-sm text-muted-foreground">No projects connected yet.</p><Button size="sm" class="mt-4" href="/projects/new"><FolderKanban class="size-3.5" /> Create a project</Button></div>{:else}<div class="divide-y divide-border">{#each data.projects as project (project.id)}<a href={`/projects/${project.id}`} class="group flex items-center gap-3 py-3 first:pt-0 last:pb-0"><span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted"><FolderKanban class="size-3.5" /></span><span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium group-hover:text-primary">{project.name}</span><span class="mt-0.5 block text-xs text-muted-foreground">{project.status === 'on_hold' ? 'On hold' : project.status.charAt(0).toUpperCase() + project.status.slice(1)}</span></span><ArrowRight class="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-1" /></a>{/each}</div>{/if}</Card.Content></Card.Root><Card.Root class="bg-card py-0"><Card.Header class="border-b border-border px-4 py-3"><Card.Title class="text-base">Client details</Card.Title><Card.Description class="mt-0.5 text-xs">Keep contact details current.</Card.Description></Card.Header><Card.Content class="p-4"><form method="POST" action="?/updateClient" class="space-y-4"><div class="space-y-1.5"><Label for="name">Name</Label><Input id="name" name="name" value={client.name} required /></div><div class="space-y-1.5"><Label for="company">Company</Label><Input id="company" name="company" value={client.company ?? ''} /></div><div class="space-y-1.5"><Label for="email">Email</Label><Input id="email" name="email" type="email" value={client.email ?? ''} /></div>{#if form?.message}<p class={`text-sm ${form.success ? 'text-emerald-600' : 'text-destructive'}`}>{form.message}</p>{/if}<Button size="sm" type="submit" class="w-full">Save details</Button></form></Card.Content></Card.Root></div>
	</div>
{:else}<p>Client not found.</p>{/if}
