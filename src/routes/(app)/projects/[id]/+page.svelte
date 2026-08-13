<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import ArchiveRestore from '@lucide/svelte/icons/archive-restore';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import Circle from '@lucide/svelte/icons/circle';
	import FolderKanban from '@lucide/svelte/icons/folder-kanban';
	import ListChecks from '@lucide/svelte/icons/list-checks';
	import Plus from '@lucide/svelte/icons/plus';
	import ReceiptText from '@lucide/svelte/icons/receipt-text';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import ArchiveProjectDialog from '$lib/components/archive-project-dialog.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import MetricCard from '$lib/components/metric-card.svelte';
	import QuickCreateDialog from '$lib/components/quick-create-dialog.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import { formatDate, invoiceStatusClass, isOverdue, overdueDateClass, priorityClass, priorityLabel, statusClass, statusLabel } from '$lib/app/format';
	import { formatMoney } from '$lib/app/currency';
	import { supportedCurrencies } from '$lib/app/currency';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form?: ActionData } = $props();
	let project = $derived(data.project);
	let total = $derived(data.tasks.length);
	let done = $derived(data.tasks.filter((task) => task.status === 'done').length);
	let progress = $derived(total ? Math.round((done / total) * 100) : 0);
</script>

<svelte:head><title>{project?.name ?? 'Project'} - Freelance OS</title></svelte:head>

{#if project}
	<div class="space-y-4">
		<div class="flex items-center gap-2 text-xs text-muted-foreground"><a href="/projects" class="inline-flex items-center gap-1.5 hover:text-foreground"><ArrowLeft class="size-3.5" /> Projects</a><span aria-hidden="true">/</span><span class="truncate font-medium text-foreground">{project.name}</span></div>
		<header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div class="min-w-0">
				<div class="mb-2 flex flex-wrap items-center gap-2"><span class="flex size-8 items-center justify-center rounded-md bg-muted"><FolderKanban class="size-4" /></span><Badge class={statusClass(project.status)}>{statusLabel(project.status)}</Badge></div>
				<h1 class="truncate text-2xl font-semibold tracking-tight">{project.name}</h1>
				<p class="mt-2 max-w-2xl truncate text-sm text-muted-foreground">{project.description ?? 'No project description yet.'}</p>
			</div>
			<div class="flex flex-wrap gap-2"><QuickCreateDialog kind="task" action="/tasks?/createTask" projects={[project]} defaultProjectId={project.id} label="Add task" variant="outline" />{#if project.status === 'archived'}<form method="POST" action="?/restoreProject"><Button variant="outline" size="sm" type="submit"><ArchiveRestore class="size-3.5" /> Restore</Button></form>{:else}<ArchiveProjectDialog action="?/archiveProject" projectName={project.name} />{/if}</div>
		</header>

		<section class="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3"><MetricCard label="Progress" value={`${progress}%`} detail={`${done} of ${total} done`} tone="primary" /><MetricCard label="Tasks" value={total} detail={`${done} completed`} icon={ListChecks} /><MetricCard label="Open work" value={total - done} detail="Keep momentum" tone="amber" /></section>

		<div class="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
			<Card.Root class="gap-0 bg-card py-0">
				<Card.Header class="border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div><Card.Title class="text-base">Project tasks</Card.Title><Card.Description class="mt-0.5 text-xs">Everything attached to this engagement.</Card.Description></div><a href="/tasks?project={project.id}" class="text-xs font-medium text-muted-foreground hover:text-foreground">Open queue</a></Card.Header>
				<Card.Content class="p-4">
					{#if data.tasks.length === 0}
						<div class="border border-dashed border-border px-5 py-8 text-center"><p class="text-sm text-muted-foreground">No tasks attached yet.</p><Button size="sm" class="mt-4" href="/tasks/new?project={project.id}"><Plus class="size-3.5" /> Add first task</Button></div>
					{:else}
						<div class="divide-y divide-border">
							{#each data.tasks as task (task.id)}
							<div class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">{#if task.status === 'done'}<CheckCircle2 class="size-4 text-emerald-600" />{:else}<Circle class="size-4 text-muted-foreground" />{/if}<a href={`/tasks/${task.id}`} class="min-w-0 flex-1"><p class={`truncate text-sm font-medium ${task.status === 'done' ? 'text-muted-foreground line-through' : 'hover:text-primary'}`}>{task.title}</p><p class={`mt-1 flex items-center gap-2 text-xs ${overdueDateClass(isOverdue(task.due_date, task.status))}`}><CalendarDays class="size-3.5" /> {formatDate(task.due_date, { month: 'short', day: 'numeric' })}</p></a><Badge class={`hidden sm:inline-flex ${statusClass(task.status)}`}>{statusLabel(task.status)}</Badge><Badge variant="outline" class={`hidden sm:inline-flex ${priorityClass(task.priority)}`}>{priorityLabel(task.priority)}</Badge><ArrowRight class="size-3.5 text-muted-foreground" /></div>
							{/each}
						</div>
					{/if}
				</Card.Content>
			</Card.Root>

			<Card.Root class="gap-0 bg-card py-0">
				<Card.Header class="border-b border-border px-4 py-3"><Card.Title class="text-base">Project details</Card.Title><Card.Description class="mt-0.5 text-xs">Update the context as the engagement evolves.</Card.Description></Card.Header>
				<Card.Content class="p-4"><form method="POST" action="?/updateProject" class="space-y-4"><div class="space-y-1.5"><Label for="name">Project name</Label><Input id="name" name="name" value={project.name} required /></div><div class="space-y-1.5"><Label for="client_id">Client</Label><select id="client_id" name="client_id" class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"><option value="">No client attached</option>{#each data.clients as client (client.id)}<option value={client.id} selected={project.client_id === client.id}>{client.name}</option>{/each}</select></div><div class="space-y-1.5"><Label for="billing-currency">Billing currency override</Label><select id="billing-currency" name="billing_currency_code" class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"><option value="">Inherit from client</option>{#each supportedCurrencies as currency (currency.code)}<option value={currency.code} selected={project.billing_currency_code === currency.code}>{currency.code} · {currency.name}</option>{/each}</select></div><div class="space-y-1.5"><Label for="status">Status</Label><select id="status" name="status" class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"><option value="active" selected={project.status === 'active'}>Active</option><option value="on_hold" selected={project.status === 'on_hold'}>On hold</option><option value="completed" selected={project.status === 'completed'}>Completed</option><option value="archived" selected={project.status === 'archived'}>Archived</option></select></div><div class="space-y-1.5"><Label for="description">Description</Label><Textarea id="description" name="description" value={project.description ?? ''} rows={4} /></div>{#if form?.message}<p class={`text-sm ${form.success ? 'text-emerald-600' : 'text-destructive'}`}>{form.message}</p>{/if}<Button size="sm" type="submit" class="w-full">Save project</Button></form></Card.Content>
			</Card.Root>
		</div>

		<section class="overflow-hidden rounded-md border border-border bg-card">
			<div class="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex items-start gap-2.5"><span class="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted"><ReceiptText class="size-3.5 text-muted-foreground" /></span><div><h2 class="text-sm font-medium">Billing</h2><p class="mt-0.5 text-xs text-muted-foreground">Invoices and project costs, kept secondary to the work.</p></div></div>
				<div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
					<span><span class="text-muted-foreground">Invoiced</span> <span class="font-medium">{formatMoney(data.financeMetrics.invoiced, data.displayCurrency)}</span></span>
					<span><span class="text-muted-foreground">Paid</span> <span class="font-medium text-emerald-600">{formatMoney(data.financeMetrics.paid, data.displayCurrency)}</span></span>
					<span><span class="text-muted-foreground">Due</span> <span class="font-medium text-amber-600">{formatMoney(data.financeMetrics.outstanding, data.displayCurrency)}</span></span>
					<Button href={`/invoices/new?project=${project.id}${project.client_id ? `&client=${project.client_id}` : ''}`} size="sm" variant="outline"><Plus class="size-3.5" /> New invoice</Button>
				</div>
			</div>
			{#if data.invoices.length === 0}
				<div class="border-t border-border px-4 py-3 text-xs text-muted-foreground">No billing activity yet. Add an invoice when you are ready to request a deposit or milestone payment.</div>
			{:else}
				<div class="border-t border-border divide-y divide-border">
					{#each data.invoices as invoice (invoice.id)}
						<a href={`/invoices/${invoice.id}`} class="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40">
							<span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted"><ReceiptText class="size-3.5" /></span>
							<span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium group-hover:text-primary">{invoice.invoice_number}</span><span class="mt-1 block truncate text-xs text-muted-foreground">Due {formatDate(invoice.due_date, { month: 'short', day: 'numeric', year: 'numeric' })}</span></span>
							<span class="text-right"><span class="block text-sm font-medium">{formatMoney(invoice.displayTotal, data.displayCurrency)}</span><Badge class={`mt-1 ${invoiceStatusClass(invoice.displayStatus)}`}>{statusLabel(invoice.displayStatus)}</Badge></span>
							<ArrowRight class="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-1" />
						</a>
					{/each}
				</div>
			{/if}
		</section>
	</div>
{:else}<p>Project not found.</p>{/if}
