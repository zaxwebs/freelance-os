<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import FolderKanban from '@lucide/svelte/icons/folder-kanban';
	import ListChecks from '@lucide/svelte/icons/list-checks';
	import Mail from '@lucide/svelte/icons/mail';
	import ReceiptText from '@lucide/svelte/icons/receipt-text';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import DeleteConfirmDialog from '$lib/components/delete-confirm-dialog.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import MetricCard from '$lib/components/metric-card.svelte';
	import QuickCreateDialog from '$lib/components/quick-create-dialog.svelte';
	import { formatDate, invoiceStatusClass, statusLabel } from '$lib/app/format';
	import { formatMoney } from '$lib/app/currency';
	import { supportedCurrencies } from '$lib/app/currency';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form?: ActionData } = $props();
	let client = $derived(data.client);
</script>

<svelte:head><title>{client?.name ?? 'Client'} - Freelance OS</title></svelte:head>

{#if client}
	<div class="space-y-4">
		<div class="flex items-center gap-2 text-xs text-muted-foreground"><a href="/clients" class="inline-flex items-center gap-1.5 hover:text-foreground"><ArrowLeft class="size-3.5" /> Clients</a><span aria-hidden="true">/</span><span class="truncate font-medium text-foreground">{client.name}</span></div>
		<header class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
			<div class="flex min-w-0 items-center gap-3"><div class="flex size-9 shrink-0 items-center justify-center rounded-md bg-foreground text-sm font-semibold text-background">{client.name.slice(0, 1).toUpperCase()}</div><div class="min-w-0"><h1 class="truncate text-xl font-semibold tracking-tight">{client.name}</h1><div class="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground"><span>{client.company ?? 'Independent client'}</span>{#if client.email}<span aria-hidden="true">·</span><a href={`mailto:${client.email}`} class="inline-flex items-center gap-1.5 hover:text-foreground"><Mail class="size-3.5" /> {client.email}</a>{/if}</div></div></div>
			<div class="flex flex-wrap gap-2"><QuickCreateDialog kind="project" action="/projects?/createProject" clients={[client]} defaultClientId={client.id} label="New project" variant="outline" /><DeleteConfirmDialog action="?/deleteClient" itemName={client.name} itemType="client" detail="The client will be removed. Its projects and task history will remain, but clients with invoices cannot be removed." /></div>
		</header>
		<section class="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3"><MetricCard label="Projects" value={data.projects.length} detail="Connected work" icon={FolderKanban} tone="primary" /><MetricCard label="Tasks" value={data.tasks.length} detail="Across projects" icon={ListChecks} /><MetricCard label="Completed" value={data.tasks.filter((task) => task.status === 'done').length} detail="Finished work" icon={CheckCircle2} tone="emerald" /></section>
		<div class="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
			<Card.Root class="gap-0 bg-card py-0"><Card.Header class="border-b border-border px-4 py-3"><Card.Title class="text-base">Projects for {client.name}</Card.Title><Card.Description class="mt-0.5 text-xs">Work connected to this relationship.</Card.Description></Card.Header><Card.Content class="p-4">{#if data.projects.length === 0}<div class="border border-dashed border-border px-5 py-8 text-center"><FolderKanban class="mx-auto size-5 text-muted-foreground" /><p class="mt-3 text-sm text-muted-foreground">No projects connected yet.</p><Button size="sm" class="mt-4" href="/projects/new"><FolderKanban class="size-3.5" /> Create a project</Button></div>{:else}<div class="divide-y divide-border">{#each data.projects as project (project.id)}<a href={`/projects/${project.id}`} class="group flex items-center gap-3 py-3 first:pt-0 last:pb-0"><span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted"><FolderKanban class="size-3.5" /></span><span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium group-hover:text-primary">{project.name}</span><span class="mt-0.5 block text-xs text-muted-foreground">{project.status === 'on_hold' ? 'On hold' : project.status.charAt(0).toUpperCase() + project.status.slice(1)}</span></span><ArrowRight class="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-1" /></a>{/each}</div>{/if}</Card.Content></Card.Root>
			<Card.Root class="gap-0 bg-card py-0"><Card.Header class="border-b border-border px-4 py-3"><Card.Title class="text-base">Client details</Card.Title><Card.Description class="mt-0.5 text-xs">Keep contact details and billing defaults current.</Card.Description></Card.Header><Card.Content class="p-4"><form method="POST" action="?/updateClient" class="space-y-4"><div class="space-y-1.5"><Label for="name">Name</Label><Input id="name" name="name" value={client.name} required /></div><div class="space-y-1.5"><Label for="company">Company</Label><Input id="company" name="company" value={client.company ?? ''} /></div><div class="space-y-1.5"><Label for="email">Email</Label><Input id="email" name="email" type="email" value={client.email ?? ''} /></div><div class="space-y-1.5"><Label for="billing-address">Billing address</Label><Textarea id="billing-address" name="billing_address" value={client.billing_address ?? ''} rows={4} /><p class="text-xs text-muted-foreground">Copied to new invoices and saved on the invoice when it is created.</p></div><div class="grid gap-4 sm:grid-cols-2"><div class="space-y-1.5"><Label for="tax-id-label">Tax ID label</Label><Input id="tax-id-label" name="tax_id_label" value={client.tax_id_label ?? ''} placeholder="VAT number" /></div><div class="space-y-1.5"><Label for="tax-id">Tax ID</Label><Input id="tax-id" name="tax_id" value={client.tax_id ?? ''} placeholder="e.g. GB123456789" /></div></div><div class="space-y-1.5"><Label for="default-currency">Default billing currency</Label><select id="default-currency" name="default_currency_code" value={client.default_currency_code ?? 'USD'} class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20">{#each supportedCurrencies as currency (currency.code)}<option value={currency.code}>{currency.code} · {currency.name}</option>{/each}</select><p class="text-xs text-muted-foreground">Used when a project or invoice does not override the currency.</p></div>{#if form?.message}<p class={`text-sm ${form.success ? 'text-emerald-600' : 'text-destructive'}`}>{form.message}</p>{/if}<Button size="sm" type="submit" class="w-full">Save details</Button></form></Card.Content></Card.Root>
		</div>

		<section class="overflow-hidden rounded-md border border-border bg-card">
			<div class="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex items-start gap-2.5"><span class="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted"><ReceiptText class="size-3.5 text-muted-foreground" /></span><div><h2 class="text-sm font-medium">Billing</h2><p class="mt-0.5 text-xs text-muted-foreground">Invoices across this client’s projects.</p></div></div>
				<div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
					<span><span class="text-muted-foreground">Invoiced</span> <span class="font-medium">{formatMoney(data.financeMetrics.invoiced, data.displayCurrency)}</span></span>
					<span><span class="text-muted-foreground">Paid</span> <span class="font-medium text-emerald-600">{formatMoney(data.financeMetrics.paid, data.displayCurrency)}</span></span>
					<span><span class="text-muted-foreground">Due</span> <span class="font-medium text-amber-600">{formatMoney(data.financeMetrics.outstanding, data.displayCurrency)}</span></span>
					<Button href={`/invoices/new?client=${client.id}`} size="sm" variant="outline"><ReceiptText class="size-3.5" /> New invoice</Button>
				</div>
			</div>
			{#if data.invoices.length === 0}
				<div class="border-t border-border px-4 py-3 text-xs text-muted-foreground">No billing activity yet. Add an invoice when you are ready to request a deposit or milestone payment.</div>
			{:else}
				<div class="border-t border-border divide-y divide-border">
					{#each data.invoices as invoice (invoice.id)}
						<a href={`/invoices/${invoice.id}`} class="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40">
							<span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted"><ReceiptText class="size-3.5" /></span>
							<span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium group-hover:text-primary">{invoice.invoice_number}</span><span class="mt-1 block truncate text-xs text-muted-foreground">{invoice.project_id ? data.projects.find((project) => project.id === invoice.project_id)?.name ?? 'Project' : 'No project attached'} · Due {formatDate(invoice.due_date, { month: 'short', day: 'numeric' })}</span></span>
							<span class="text-right"><span class="block text-sm font-medium">{formatMoney(invoice.displayTotal, data.displayCurrency)}</span><span class={`mt-1 block text-xs ${invoiceStatusClass(invoice.displayStatus)} rounded-full px-2 py-0.5`}>{statusLabel(invoice.displayStatus)}</span></span>
							<ArrowRight class="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-1" />
						</a>
					{/each}
				</div>
			{/if}
		</section>
	</div>
{:else}<p>Client not found.</p>{/if}
