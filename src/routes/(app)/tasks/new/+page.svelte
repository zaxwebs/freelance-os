<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Plus from '@lucide/svelte/icons/plus';
	import Button from '$lib/components/ui/button/button.svelte';
	import DatePicker from '$lib/components/date-picker.svelte';
	import * as Card from '$lib/components/ui/card';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import { taskPriorities } from '$lib/app/types';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form?: ActionData } = $props();
</script>

<svelte:head><title>New task - Freelance OS</title></svelte:head>

<div class="mx-auto max-w-2xl space-y-4">
	<div class="flex items-center gap-2 text-xs text-muted-foreground"><a href="/tasks" class="inline-flex items-center gap-1.5 hover:text-foreground"><ArrowLeft class="size-3.5" /> Tasks</a><span aria-hidden="true">/</span><span class="font-medium text-foreground">New task</span></div>
	<header><h1 class="text-xl font-semibold tracking-tight">New task</h1><p class="mt-1 text-sm text-muted-foreground">Capture a clear next action.</p></header>
	<Card.Root class="bg-card py-0"><Card.Content class="p-4 sm:p-5"><form method="POST" action="?/createTask" class="space-y-4"><div class="space-y-1.5"><Label for="title">Task title</Label><Input id="title" name="title" placeholder="Send homepage concepts" autofocus required /></div><div class="grid gap-4 sm:grid-cols-2"><div class="space-y-1.5"><Label for="project_id">Project</Label><select id="project_id" name="project_id" class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"><option value="">No project</option>{#each data.projects as project (project.id)}<option value={project.id} selected={data.defaultProjectId === project.id}>{project.name}</option>{/each}</select>{#if data.projects.length === 0}<p class="text-xs text-muted-foreground">No projects yet. <a href="/projects/new" class="underline">Create one first.</a></p>{/if}</div><div class="space-y-1.5"><Label for="priority">Priority</Label><select id="priority" name="priority" class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20">{#each taskPriorities as priority (priority.value)}<option value={priority.value} selected={priority.value === 'medium'}>{priority.label}</option>{/each}</select></div></div><div class="space-y-1.5"><Label for="due_date">Due date <span class="font-normal normal-case text-muted-foreground">optional</span></Label><DatePicker id="due_date" name="due_date" /></div><div class="space-y-1.5"><Label for="description">Notes <span class="font-normal normal-case text-muted-foreground">optional</span></Label><Textarea id="description" name="description" placeholder="What does done look like?" rows={4} /></div>{#if form?.message}<p class="text-sm text-destructive">{form.message}</p>{/if}<div class="flex justify-end gap-2 pt-2"><Button variant="outline" size="sm" href="/tasks">Cancel</Button><Button size="sm" type="submit"><Plus class="size-3.5" /> Create task</Button></div></form></Card.Content></Card.Root>
</div>
