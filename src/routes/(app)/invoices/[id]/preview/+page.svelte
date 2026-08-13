<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Printer from '@lucide/svelte/icons/printer';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { formatDate, invoiceStatusClass, statusLabel } from '$lib/app/format';
	import { formatMoney } from '$lib/app/currency';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	let balanceDue = $derived(Math.max(0, Number(data.invoice.total) - Number(data.invoice.amount_paid)));
</script>

<svelte:head>
	<title>Preview {data.invoice.invoice_number} - Freelance OS</title>
	<meta name="description" content={`Preview invoice ${data.invoice.invoice_number}.`} />
</svelte:head>

<div class="mx-auto max-w-4xl space-y-5">
	<div class="flex items-center justify-between print:hidden">
		<a href={`/invoices/${data.invoice.id}`} class="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft class="size-3.5" /> Back to invoice</a>
		<Button type="button" variant="outline" size="sm" onclick={() => window.print()}><Printer class="size-3.5" /> Print invoice</Button>
	</div>

	<article class="overflow-hidden rounded-lg border border-border bg-card shadow-sm print:rounded-none print:border-0 print:shadow-none">
		<header class="border-b border-border p-6 sm:p-10">
			<div class="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
				<div class="min-w-0">
					<p class="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">{data.issuer.name ?? 'Invoice issuer'}</p>
					<h1 class="mt-3 text-3xl font-semibold tracking-tight">Invoice</h1>
					{#if data.issuer.legalName && data.issuer.legalName !== data.issuer.name}<p class="mt-2 text-sm text-muted-foreground">{data.issuer.legalName}</p>{/if}
					{#if data.issuer.address}<p class="mt-4 whitespace-pre-line text-sm leading-6 text-muted-foreground">{data.issuer.address}</p>{/if}
				</div>
				<div class="min-w-0 sm:text-right">
					<p class="text-xs font-medium text-muted-foreground">Invoice number</p>
					<p class="mt-1 text-lg font-semibold">{data.invoice.invoice_number}</p>
					<Badge class={`mt-3 ${invoiceStatusClass(data.invoice.displayStatus)}`}>{statusLabel(data.invoice.displayStatus)}</Badge>
					<div class="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-left text-sm sm:text-right">
						<div><p class="text-xs text-muted-foreground">Issue date</p><p class="mt-1 font-medium">{formatDate(data.invoice.issue_date, { month: 'short', day: 'numeric', year: 'numeric' })}</p></div>
						<div><p class="text-xs text-muted-foreground">Due date</p><p class="mt-1 font-medium">{formatDate(data.invoice.due_date, { month: 'short', day: 'numeric', year: 'numeric' })}</p></div>
					</div>
				</div>
			</div>
		</header>

		<section class="grid gap-8 border-b border-border p-6 sm:grid-cols-2 sm:p-10">
			<div>
				<p class="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">From</p>
				<p class="mt-3 text-sm font-semibold">{data.issuer.name ?? 'Invoice issuer'}</p>
				{#if data.issuer.email}<p class="mt-2 text-sm text-muted-foreground">{data.issuer.email}</p>{/if}
				{#if data.issuer.phone}<p class="mt-1 text-sm text-muted-foreground">{data.issuer.phone}</p>{/if}
				{#if data.issuer.website}<p class="mt-1 text-sm text-muted-foreground">{data.issuer.website}</p>{/if}
				{#if data.issuer.taxId}<p class="mt-3 text-sm text-muted-foreground">{data.issuer.taxIdLabel ?? 'Tax ID'}: {data.issuer.taxId}</p>{/if}
			</div>
			<div class="sm:text-right">
				<p class="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">Bill to</p>
				<p class="mt-3 text-sm font-semibold">{data.billTo.name ?? 'Client'}</p>
				{#if data.billTo.company}<p class="mt-1 text-sm text-muted-foreground">{data.billTo.company}</p>{/if}
				{#if data.billTo.address}<p class="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">{data.billTo.address}</p>{/if}
				{#if data.billTo.email}<p class="mt-3 text-sm text-muted-foreground">{data.billTo.email}</p>{/if}
				{#if data.billTo.taxId}<p class="mt-1 text-sm text-muted-foreground">{data.billTo.taxIdLabel ?? 'Tax ID'}: {data.billTo.taxId}</p>{/if}
			</div>
		</section>

		<section class="p-6 sm:p-10">
			<div class="grid grid-cols-[minmax(0,1fr)_70px_110px] gap-3 border-b border-border pb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
				<span>Description</span><span class="text-right">Qty</span><span class="text-right">Amount</span>
			</div>
			<div class="divide-y divide-border">
				{#each data.lineItems as item (item.id)}
					<div class="grid grid-cols-[minmax(0,1fr)_70px_110px] gap-3 py-4 text-sm">
						<div class="min-w-0"><p class="font-medium">{item.description}</p><p class="mt-1 text-xs text-muted-foreground">{formatMoney(item.unit_price, data.invoice.currency_code)} each{item.tax_rate ? ` · ${item.tax_rate}% tax` : ''}</p></div>
						<span class="text-right text-muted-foreground">{item.quantity}</span>
						<span class="text-right font-medium">{formatMoney(item.amount, data.invoice.currency_code)}</span>
					</div>
				{/each}
			</div>

			<div class="mt-6 ml-auto w-full max-w-xs space-y-2 text-sm">
				<div class="flex justify-between"><span class="text-muted-foreground">Subtotal</span><span>{formatMoney(data.invoice.subtotal, data.invoice.currency_code)}</span></div>
				<div class="flex justify-between"><span class="text-muted-foreground">Tax</span><span>{formatMoney(data.invoice.tax_total, data.invoice.currency_code)}</span></div>
				<div class="flex justify-between border-t border-border pt-3 text-base font-semibold"><span>Total</span><span>{formatMoney(data.invoice.total, data.invoice.currency_code)}</span></div>
				<div class="flex justify-between text-sm font-medium text-primary"><span>Balance due</span><span>{formatMoney(balanceDue, data.invoice.currency_code)}</span></div>
			</div>
		</section>

		{#if data.invoice.notes || data.invoice.payment_instructions || data.issuer.footerNote}
			<footer class="border-t border-border bg-muted/30 p-6 sm:p-10">
				<div class="grid gap-8 sm:grid-cols-2">
					{#if data.invoice.notes}<div><p class="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">Notes</p><p class="mt-3 whitespace-pre-line text-sm leading-6">{data.invoice.notes}</p></div>{/if}
					{#if data.invoice.payment_instructions}<div><p class="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">Payment instructions</p><p class="mt-3 whitespace-pre-line text-sm leading-6">{data.invoice.payment_instructions}</p></div>{/if}
				</div>
				{#if data.issuer.footerNote}<p class="mt-8 border-t border-border pt-5 text-center text-xs text-muted-foreground">{data.issuer.footerNote}</p>{/if}
			</footer>
		{/if}
	</article>
</div>
