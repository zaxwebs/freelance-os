<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import DeleteConfirmDialog from '$lib/components/delete-confirm-dialog.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import { taskPriorities, taskStatuses } from '$lib/app/types';
	import { formatDate, priorityClass, priorityLabel, statusClass, statusLabel } from '$lib/app/format';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form?: ActionData } = $props();
	let task = $derived(data.task);
</script>

<svelte:head><title>{task?.title ?? 'Task'} - Freelance OS</title></svelte:head>

{#if task}
	<div class="mx-auto max-w-4xl space-y-4"><a href="/tasks" class="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft class="size-3.5" /> Tasks</a><header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><div class="mb-2 flex flex-wrap items-center gap-2"><span class={`inline-flex items-center px-2.5 py-1 text-xs font-medium ${statusClass(task.status)}`}>{statusLabel(task.status)}</span><span class={`text-xs font-medium ${priorityClass(task.priority)}`}>{priorityLabel(task.priority)} priority</span></div><h1 class="max-w-3xl text-2xl font-semibold leading-tight tracking-tight">{task.title}</h1><p class="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground"><CalendarDays class="size-3.5" /> {formatDate(task.due_date)}</p></div><DeleteConfirmDialog action="?/deleteTask" itemName={task.title} itemType="task" detail="The task and all of its details will be permanently removed." /></header>
		<Card.Root class="gap-0 bg-card py-0"><Card.Header class="border-b border-border px-4 py-3 sm:px-5"><Card.Title class="text-base">Edit task</Card.Title><Card.Description class="mt-0.5 text-xs">Keep the task current as the work changes.</Card.Description></Card.Header><Card.Content class="p-4 sm:p-5"><form method="POST" action="?/updateTask" class="space-y-4"><div class="space-y-1.5"><Label for="title">Task title</Label><Input id="title" name="title" value={task.title} required /></div><div class="grid gap-4 sm:grid-cols-3"><div class="space-y-1.5 sm:col-span-1"><Label for="project_id">Project</Label><select id="project_id" name="project_id" class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"><option value="">No project</option>{#each data.projects as project (project.id)}<option value={project.id} selected={task.project_id === project.id}>{project.name}</option>{/each}</select></div><div class="space-y-1.5"><Label for="status">Status</Label><select id="status" name="status" class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20">{#each taskStatuses as status (status.value)}<option value={status.value} selected={task.status === status.value}>{status.label}</option>{/each}</select></div><div class="space-y-1.5"><Label for="priority">Priority</Label><select id="priority" name="priority" class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20">{#each taskPriorities as priority (priority.value)}<option value={priority.value} selected={task.priority === priority.value}>{priority.label}</option>{/each}</select></div></div><div class="space-y-1.5"><Label for="due_date">Due date</Label><Input id="due_date" name="due_date" type="date" value={task.due_date?.slice(0, 10) ?? ''} /></div><div class="space-y-1.5"><Label for="description">Notes</Label><Textarea id="description" name="description" rows={5} value={task.description ?? ''} placeholder="What does done look like?" /></div>{#if form?.message}<p class={`text-sm ${form.success ? 'text-emerald-600' : 'text-destructive'}`}>{form.message}</p>{/if}<div class="flex justify-end pt-2"><Button size="sm" type="submit">Save changes</Button></div></form></Card.Content></Card.Root></div>
{:else}<p>Task not found.</p>{/if}




