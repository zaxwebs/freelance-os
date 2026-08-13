<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import FileText from '@lucide/svelte/icons/file-text';
	import Plus from '@lucide/svelte/icons/plus';
	import Receipt from '@lucide/svelte/icons/receipt';
	import TrendingDown from '@lucide/svelte/icons/trending-down';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import MetricCard from '$lib/components/metric-card.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import PaginationControls from '$lib/components/pagination-controls.svelte';
	import { formatDate, invoiceStatusClass, overdueDateClass, statusLabel } from '$lib/app/format';
	import { formatMoney } from '$lib/app/currency';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const statusFilters = [
		{ value: 'all', label: 'All invoices' },
		{ value: 'draft', label: 'Draft' },
		{ value: 'sent', label: 'Sent' },
		{ value: 'partially_paid', label: 'Partially paid' },
		{ value: 'paid', label: 'Paid' },
		{ value: 'overdue', label: 'Overdue' }
	];
</script>

<svelte:head>
	<title>Invoices - Freelance OS</title>
	<meta name="description" content="Create, send, and track freelancer invoices." />
</svelte:head>

<div class="space-y-5">
	<PageHeader title="Invoices" description="Turn completed work into clear, trackable billing.">
		{#snippet actions()}<Button href="/invoices/new" size="sm" class="gap-1.5"><Plus class="size-3.5" /> New invoice</Button>{/snippet}
	</PageHeader>

	<section class="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
		<MetricCard label="Outstanding" value={formatMoney(data.metrics.outstanding, data.displayCurrency)} detail="Open balance" icon={Receipt} tone="primary" />
		<MetricCard label="Overdue" value={formatMoney(data.metrics.overdue, data.displayCurrency)} detail="Needs follow-up" icon={TrendingDown} tone="amber" />
		<MetricCard label="Paid" labelTooltip="Counts invoices that are fully paid. Partially paid invoices remain in Outstanding." value={formatMoney(data.metrics.paid, data.displayCurrency)} detail="Recorded payments" icon={TrendingUp} tone="emerald" />
	</section>

	<Card.Root class="gap-0 bg-card py-0">
		<Card.Header class="border-b border-border px-4 py-3 sm:flex sm:flex-row sm:items-center sm:justify-between">
			<div><Card.Title class="text-base">Invoice Register</Card.Title><Card.Description class="mt-0.5 text-xs">Every deposit, milestone, and final invoice in one place.</Card.Description></div>
			<div class="flex flex-wrap gap-1.5">
				{#each statusFilters as filter (filter.value)}
					<a href={filter.value === 'all' ? '/invoices' : `/invoices?status=${filter.value}`} class={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${data.status === filter.value ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>{filter.label}</a>
				{/each}
			</div>
		</Card.Header>
		<Card.Content class="p-0">
			{#if data.invoices.length === 0}
				<div class="flex flex-col items-center px-6 py-14 text-center"><div class="flex size-10 items-center justify-center rounded-md bg-muted"><FileText class="size-5 text-muted-foreground" /></div><h2 class="mt-4 text-sm font-semibold">No invoices here yet</h2><p class="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">Create an invoice for a deposit, milestone, or final payment and keep the project balance visible.</p><Button href="/invoices/new" size="sm" class="mt-4"><Plus class="size-3.5" /> Create invoice</Button></div>
			{:else}
				<div class="hidden border-b border-border bg-muted/20 px-4 py-2.5 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase sm:grid sm:grid-cols-[minmax(130px,0.7fr)_minmax(180px,1fr)_minmax(140px,0.8fr)_120px_28px] sm:items-center sm:px-5"><span>Invoice</span><span>Client / Project</span><span>Amount</span><span>Status</span><span aria-hidden="true"></span></div>
				<div class="divide-y divide-border/70">
					{#each data.invoices as invoice (invoice.id)}
						<a href={`/invoices/${invoice.id}`} class="group grid gap-3 px-4 py-4 transition-colors hover:bg-muted/40 sm:grid-cols-[minmax(130px,0.7fr)_minmax(180px,1fr)_minmax(140px,0.8fr)_120px_28px] sm:items-center sm:px-5">
							<div><p class="text-sm font-semibold group-hover:text-primary">{invoice.invoice_number}</p><p class="mt-1 text-xs text-muted-foreground">Issued {formatDate(invoice.issue_date, { month: 'short', day: 'numeric', year: 'numeric' })}</p></div>
							<div class="min-w-0"><p class="truncate text-sm font-medium">{invoice.clientName}</p><p class="mt-1 truncate text-xs text-muted-foreground">{invoice.projectName ?? 'No project attached'}</p></div>
							<div><p class="text-sm font-medium">{formatMoney(invoice.displayTotal, data.displayCurrency)}</p><p class="mt-1 text-xs text-muted-foreground">{formatMoney(invoice.displayTotal - invoice.displayAmountPaid, data.displayCurrency)} due{invoice.currency_code !== data.displayCurrency ? ` · ${invoice.currency_code} invoice` : ''}</p></div>
							<div><Badge class={invoiceStatusClass(invoice.displayStatus)}>{statusLabel(invoice.displayStatus)}</Badge><p class={`mt-1 text-xs ${overdueDateClass(invoice.displayStatus === 'overdue')}`}>Due {formatDate(invoice.due_date, { month: 'short', day: 'numeric' })}</p></div>
							<ArrowRight class="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
						</a>
					{/each}
				</div>
				<div class="px-4 sm:px-5"><PaginationControls basePath="/invoices" page={data.pagination.page} pageSize={data.pagination.pageSize} total={data.pagination.total} query={{ status: data.status }} /></div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
