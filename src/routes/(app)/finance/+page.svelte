<script lang="ts">
	import ArrowDownLeft from '@lucide/svelte/icons/arrow-down-left';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import CircleDollarSign from '@lucide/svelte/icons/circle-dollar-sign';
	import FileText from '@lucide/svelte/icons/file-text';
	import ReceiptText from '@lucide/svelte/icons/receipt-text';
	import TrendingDown from '@lucide/svelte/icons/trending-down';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import WalletCards from '@lucide/svelte/icons/wallet-cards';
	import { formatAmountWithCode, formatMoney } from '$lib/app/currency';
	import { invoiceStatusClass, statusLabel } from '$lib/app/format';
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import * as Card from '$lib/components/ui/card';
	import MetricCard from '$lib/components/metric-card.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import FinanceEntryDialog from '$lib/components/finance-entry-dialog.svelte';
	import PaginationControls from '$lib/components/pagination-controls.svelte';
	import { formatDate } from '$lib/app/format';
	import type { ActionData, PageData } from './$types';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();
</script>

<svelte:head>
	<title>Finance - Freelance OS</title>
	<meta name="description" content="Track income, expenses, and project profitability in one place." />
</svelte:head>

<div class="space-y-5">
	<PageHeader title="Finance" description="Track money in, money out, and the work it belongs to.">
		{#snippet actions()}<Button href="/invoices/new" size="sm" variant="outline" class="gap-1.5"><FileText class="size-3.5" /> New invoice</Button><Button href="/expenses/new" size="sm" variant="outline" class="gap-1.5"><WalletCards class="size-3.5" /> Add expense</Button><FinanceEntryDialog action="?/createTransaction" baseCurrency={data.baseCurrency} currencies={data.currencies} clients={data.clients} projects={data.projects} />{/snippet}
	</PageHeader>

	{#if form?.message}<p role="status" class={form.success ? 'text-sm text-emerald-600 dark:text-emerald-400' : 'text-sm text-destructive'}>{form.message}</p>{/if}

	<section class="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
		<MetricCard label="Collected" value={formatMoney(data.invoiceSummary.collected, data.displayCurrency)} labelTooltip="Invoice payments" icon={TrendingUp} tone="emerald" />
		<MetricCard label="Outstanding" value={formatMoney(data.invoiceSummary.outstanding, data.displayCurrency)} labelTooltip="Open invoice balance" icon={ReceiptText} tone="primary" />
		<MetricCard label="Overdue" value={formatMoney(data.invoiceSummary.overdue, data.displayCurrency)} labelTooltip="Needs follow-up" icon={TrendingDown} tone="amber" />
		<MetricCard label="Expenses" value={formatMoney(data.expenseTotal, data.displayCurrency)} labelTooltip="Project + workspace costs" icon={CircleDollarSign} />
	</section>

	<section class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
		<Card.Root class="gap-0 bg-card py-0"><Card.Header class="border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div><Card.Title class="text-base">Billing pulse</Card.Title><Card.Description class="mt-0.5 text-xs">The money attached to your actual client work.</Card.Description></div><a href="/invoices" class="text-xs font-medium text-muted-foreground hover:text-foreground">Open invoices</a></Card.Header><Card.Content class="p-4"><div class="space-y-3">{#if data.invoices.length === 0}<p class="text-sm text-muted-foreground">No invoices yet. Start with a deposit or milestone bill.</p>{:else}{#each data.invoices.slice(0, 4) as invoice (invoice.id)}<a href={`/invoices/${invoice.id}`} class="group flex items-center gap-3"><span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted"><FileText class="size-3.5" /></span><span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium group-hover:text-primary">{invoice.invoice_number}</span><span class="mt-1 block truncate text-xs text-muted-foreground">{invoice.project_id ? 'Project invoice' : 'Client invoice'} · Due {formatDate(invoice.due_date, { month: 'short', day: 'numeric' })}</span></span><span class="text-right"><span class="block text-sm font-medium">{formatMoney(invoice.displayTotal - invoice.displayAmountPaid, data.displayCurrency)}</span><Badge class={`mt-1 ${invoiceStatusClass(invoice.displayStatus)}`}>{statusLabel(invoice.displayStatus)}</Badge></span></a>{/each}{/if}</div></Card.Content></Card.Root>
		<Card.Root class="gap-0 bg-card py-0"><Card.Header class="border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div><Card.Title class="text-base">Expense pulse</Card.Title><Card.Description class="mt-0.5 text-xs">Recent costs that shape project margin.</Card.Description></div><a href="/expenses" class="text-xs font-medium text-muted-foreground hover:text-foreground">Open expenses</a></Card.Header><Card.Content class="p-4"><div class="space-y-3">{#if data.expenses.length === 0}<p class="text-sm text-muted-foreground">No expenses recorded yet.</p>{:else}{#each data.expenses.slice(0, 4) as expense (expense.id)}<div class="flex items-center gap-3"><span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400"><WalletCards class="size-3.5" /></span><span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{expense.description}</span><span class="mt-1 block truncate text-xs text-muted-foreground">{expense.project_id ? 'Project cost' : 'Workspace cost'} · {formatDate(expense.expense_date, { month: 'short', day: 'numeric' })}</span></span><span class="text-sm font-medium">{formatMoney(expense.displayAmount, data.displayCurrency)}</span></div>{/each}{/if}</div></Card.Content></Card.Root>
	</section>

	<section>
		<Card.Root class="bg-card py-0">
			<Card.Header class="border-b border-border px-4 py-3 sm:px-5">
				<Card.Title class="text-base">Other cash movements</Card.Title>
				<Card.Description class="mt-0.5 text-xs">Unlinked income and expenses outside the invoice workflow.</Card.Description>
			</Card.Header>
			<Card.Content class="p-0">
				{#if data.transactions.length === 0}
					<div class="flex flex-col items-center px-6 py-12 text-center"><div class="flex size-10 items-center justify-center rounded-md bg-muted"><ReceiptText class="size-5 text-muted-foreground" /></div><h2 class="mt-4 text-sm font-semibold">No finance entries yet</h2><p class="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">Record your first payment or expense to start seeing the financial picture of your freelance work.</p></div>
				{:else}
					<div class="divide-y divide-border/70">
						{#each data.transactions as transaction (transaction.id)}
							<div class="flex items-center gap-3 px-4 py-3 first:pt-0 sm:px-5">
								<div class={`flex size-8 shrink-0 items-center justify-center rounded-md ${transaction.type === 'income' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
									{#if transaction.type === 'income'}<ArrowDownLeft class="size-4" />{:else}<ArrowUpRight class="size-4" />{/if}
								</div>
								<div class="min-w-0 flex-1"><p class="truncate text-sm font-medium">{transaction.description}</p><p class="mt-0.5 truncate text-xs text-muted-foreground">{transaction.projectName ?? transaction.clientName ?? 'Unassigned'} · {formatDate(transaction.transaction_date, { month: 'short', day: 'numeric', year: 'numeric' })}</p></div>
								<div class="shrink-0 text-right"><p class={`text-sm font-medium ${transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>{transaction.type === 'income' ? '+' : '−'}{formatAmountWithCode(transaction.amount, transaction.currency_code)}</p>{#if transaction.currency_code !== data.displayCurrency}<p class="mt-0.5 text-[11px] text-muted-foreground">{formatAmountWithCode(transaction.displayAmount, data.displayCurrency)} reporting</p>{/if}</div>
							</div>
						{/each}
					</div>
					<div class="px-4 sm:px-5"><PaginationControls basePath="/finance" page={data.pagination.page} pageSize={data.pagination.pageSize} total={data.pagination.total} /></div>
				{/if}
			</Card.Content>
		</Card.Root>
	</section>
</div>
