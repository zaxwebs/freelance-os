<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import CircleDollarSign from '@lucide/svelte/icons/circle-dollar-sign';
	import Plus from '@lucide/svelte/icons/plus';
	import ReceiptText from '@lucide/svelte/icons/receipt-text';
	import Repeat2 from '@lucide/svelte/icons/repeat-2';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import MetricCard from '$lib/components/metric-card.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import PaginationControls from '$lib/components/pagination-controls.svelte';
	import { formatDate } from '$lib/app/format';
	import { formatMoney } from '$lib/app/currency';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
</script>

<svelte:head><title>Expenses - Freelance OS</title><meta name="description" content="Track freelancer expenses, billable costs, and project spend." /></svelte:head>

<div class="space-y-5">
	<PageHeader title="Expenses" description="Know what the work costs, and what can be passed through to a client.">
		{#snippet actions()}<Button href="/expenses/new" size="sm" class="gap-1.5"><Plus class="size-3.5" /> Add expense</Button>{/snippet}
	</PageHeader>

	<section class="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3"><MetricCard label="Total spend" value={formatMoney(data.metrics.total, data.displayCurrency)} detail="Recorded expenses" icon={CircleDollarSign} tone="amber" /><MetricCard label="Billable" value={formatMoney(data.metrics.billable, data.displayCurrency)} detail="Ready to invoice" icon={ReceiptText} tone="primary" /><MetricCard label="Project-linked" value={formatMoney(data.metrics.linked, data.displayCurrency)} detail="Connected to work" icon={Repeat2} /></section>

	<Card.Root class="gap-0 bg-card py-0"><Card.Header class="border-b border-border px-4 py-3"><Card.Title class="text-base">Expense register</Card.Title><Card.Description class="mt-0.5 text-xs">Business costs stay separate from client payments, but still roll up into project profit.</Card.Description></Card.Header><Card.Content class="p-0">{#if data.expenses.length === 0}<div class="flex flex-col items-center px-6 py-14 text-center"><div class="flex size-10 items-center justify-center rounded-md bg-muted"><ReceiptText class="size-5 text-muted-foreground" /></div><h2 class="mt-4 text-sm font-semibold">No expenses yet</h2><p class="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">Record software, equipment, travel, and client costs so project profitability reflects reality.</p><Button href="/expenses/new" size="sm" class="mt-4"><Plus class="size-3.5" /> Add first expense</Button></div>{:else}<div class="divide-y divide-border/70">{#each data.expenses as expense (expense.id)}<div class="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_150px_150px_130px_28px] sm:items-center sm:px-5"><div class="min-w-0"><p class="truncate text-sm font-medium">{expense.description}</p><p class="mt-1 truncate text-xs text-muted-foreground">{expense.projectName ?? expense.clientName ?? 'Workspace expense'} · {formatDate(expense.expense_date, { month: 'short', day: 'numeric', year: 'numeric' })}</p></div><div><Badge variant="outline">{expense.category}</Badge>{#if expense.billable}<span class="ml-1.5 text-xs text-primary">Billable</span>{/if}</div><div class="text-sm font-medium">{formatMoney(expense.displayAmount, data.displayCurrency)}{#if expense.currency_code !== data.displayCurrency}<p class="mt-1 text-xs font-normal text-muted-foreground">{formatMoney(expense.amount, expense.currency_code)} original</p>{/if}</div><div class="text-xs text-muted-foreground">{expense.invoice_id ? 'Invoiced' : expense.billable ? 'Ready to invoice' : 'Internal cost'}</div><ArrowRight class="size-4 text-muted-foreground" /></div>{/each}</div><div class="px-4 sm:px-5"><PaginationControls basePath="/expenses" page={data.pagination.page} pageSize={data.pagination.pageSize} total={data.pagination.total} /></div>{/if}</Card.Content></Card.Root>
</div>
