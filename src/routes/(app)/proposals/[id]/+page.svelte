<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Check from '@lucide/svelte/icons/check';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import Eye from '@lucide/svelte/icons/eye';
	import FileText from '@lucide/svelte/icons/file-text';
	import FolderPlus from '@lucide/svelte/icons/folder-plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Send from '@lucide/svelte/icons/send';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import ProposalForm from '$lib/components/proposal-form.svelte';
	import { formatDate, proposalStatusClass, statusLabel } from '$lib/app/format';
	import { formatMoney } from '$lib/app/currency';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form?: ActionData } = $props();
	let createInvoice = $state(false);
	let depositAmount = $state(String(data.proposal.total));
	let projectName = $state(data.proposal.title);
	let displayClient = $derived(data.client?.company ? `${data.client.name} · ${data.client.company}` : data.client?.name ?? 'Unknown client');
</script>

<svelte:head><title>{data.proposal.title} - Freelance OS</title></svelte:head>

<div class="space-y-5">
	<div class="flex items-center gap-2 text-xs text-muted-foreground"><a href="/proposals" class="inline-flex items-center gap-1.5 hover:text-foreground"><ArrowLeft class="size-3.5" /> Proposals</a><span aria-hidden="true">/</span><span class="truncate font-medium text-foreground">{data.proposal.proposal_number}</span></div>
	<header class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
		<div class="min-w-0"><div class="flex flex-wrap items-center gap-2"><h1 class="text-2xl font-semibold tracking-tight">{data.proposal.title}</h1><Badge variant="outline" class={proposalStatusClass(data.proposal.status)}>{statusLabel(data.proposal.status)}</Badge></div><p class="mt-1 text-sm text-muted-foreground">{data.proposal.proposal_number} · {displayClient}</p></div>
		<div class="flex flex-wrap gap-2">
			<Button href={`/proposals/${data.proposal.id}/preview`} variant="outline" size="sm"><Eye class="size-3.5" /> Preview</Button>
			{#if data.proposal.status === 'draft'}<Button href={`/proposals/${data.proposal.id}?edit=1`} variant="outline" size="sm"><Pencil class="size-3.5" /> Edit</Button><form method="POST" action="?/markSent"><Button type="submit" size="sm"><Send class="size-3.5" /> Mark sent</Button></form>{/if}
			{#if ['sent', 'viewed'].includes(data.proposal.status)}<form method="POST" action="?/accept"><Button type="submit" size="sm"><Check class="size-3.5" /> Accept</Button></form><form method="POST" action="?/decline"><Button type="submit" variant="outline" size="sm"><CircleX class="size-3.5" /> Decline</Button></form>{/if}
		</div>
	</header>
	{#if data.proposal.overview}<section class="rounded-md border border-border bg-card px-4 py-4 sm:px-5"><p class="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">Overview</p><p class="mt-2 max-w-3xl whitespace-pre-line text-sm leading-6">{data.proposal.overview}</p></section>{/if}

	{#if form?.message}<p role="status" class={form.success ? 'rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300' : 'rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive'}>{form.message}</p>{/if}

	{#if data.editing}
		<div class="flex items-center justify-between"><div><h2 class="text-lg font-semibold tracking-tight">Edit proposal</h2><p class="mt-1 text-sm text-muted-foreground">Update the draft before you send it.</p></div><Button href={`/proposals/${data.proposal.id}`} variant="ghost" size="sm">Cancel editing</Button></div>
		<ProposalForm
			clients={data.clients}
			currencies={data.currencies}
			action="?/updateProposal"
			cancelHref={`/proposals/${data.proposal.id}`}
			submitLabel="Save changes"
			formMessage={form?.message}
			initial={{ clientId: data.proposal.client_id, currencyCode: data.proposal.currency_code, title: data.proposal.title, overview: data.proposal.overview ?? '', issueDate: data.proposal.issue_date, validUntil: data.proposal.valid_until ?? '', scope: data.proposal.scope ?? '', timeline: data.proposal.timeline ?? '', paymentTerms: data.proposal.payment_terms ?? '', notes: data.proposal.notes ?? '', terms: data.proposal.terms ?? '', items: data.lineItems.map((item) => ({ description: item.description, quantity: String(item.quantity), unitPrice: String(item.unit_price), taxRate: String(item.tax_rate) })) }}
		/>
	{:else}
		<section class="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3"><div class="bg-card p-4"><p class="text-xs font-medium text-muted-foreground">Proposal total</p><p class="mt-2 text-2xl font-semibold">{formatMoney(data.proposal.total, data.proposal.currency_code)}</p><p class="mt-1 text-xs text-muted-foreground">{data.proposal.proposal_number}</p></div><div class="bg-card p-4"><p class="text-xs font-medium text-muted-foreground">Issued</p><p class="mt-2 text-lg font-semibold">{formatDate(data.proposal.issue_date, { month: 'short', day: 'numeric', year: 'numeric' })}</p><p class="mt-1 text-xs text-muted-foreground">{data.proposal.valid_until ? `Valid until ${formatDate(data.proposal.valid_until, { month: 'short', day: 'numeric', year: 'numeric' })}` : 'No expiry set'}</p></div><div class="bg-card p-4"><p class="text-xs font-medium text-muted-foreground">Next step</p><p class={`mt-2 text-lg font-semibold ${data.proposal.status === 'draft' ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>{data.proposal.converted_at ? 'Project created' : data.proposal.status === 'accepted' ? 'Ready to convert' : data.proposal.status === 'draft' ? 'Ready to send' : 'Awaiting response'}</p><p class="mt-1 text-xs text-muted-foreground">{data.proposal.converted_at ? 'Created during conversion' : 'Project will be created after acceptance'}</p></div></section>

		<div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
			<div class="space-y-4">
				<Card.Root class="gap-0 bg-card py-0"><Card.Header class="border-b border-border px-4 py-3"><Card.Title class="text-base">Pricing</Card.Title><Card.Description class="mt-0.5 text-xs">The work and rates included in this proposal.</Card.Description></Card.Header><Card.Content class="p-0"><div class="divide-y divide-border">{#each data.lineItems as item (item.id)}<div class="grid grid-cols-[minmax(0,1fr)_70px_110px] gap-3 px-4 py-3 sm:px-5"><div class="min-w-0"><p class="truncate text-sm font-medium">{item.description}</p><p class="mt-1 text-xs text-muted-foreground">{item.quantity} × {formatMoney(item.unit_price, data.proposal.currency_code)}{item.tax_rate ? ` · ${item.tax_rate}% tax` : ''}</p></div><span class="text-right text-xs text-muted-foreground">{formatMoney(Number(item.quantity) * Number(item.unit_price), data.proposal.currency_code)}</span><span class="text-right text-sm font-medium">{formatMoney(item.amount, data.proposal.currency_code)}</span></div>{/each}</div><div class="space-y-2 border-t border-border px-4 py-4 text-sm sm:px-5"><div class="flex justify-between"><span class="text-muted-foreground">Subtotal</span><span>{formatMoney(data.proposal.subtotal, data.proposal.currency_code)}</span></div><div class="flex justify-between"><span class="text-muted-foreground">Tax</span><span>{formatMoney(data.proposal.tax_total, data.proposal.currency_code)}</span></div><div class="flex justify-between border-t border-border pt-3 text-base font-semibold"><span>Total</span><span>{formatMoney(data.proposal.total, data.proposal.currency_code)}</span></div></div></Card.Content></Card.Root>

				{#if data.proposal.scope || data.proposal.timeline || data.proposal.payment_terms || data.proposal.notes || data.proposal.terms}<Card.Root class="gap-0 bg-card py-0"><Card.Header class="border-b border-border px-4 py-3"><Card.Title class="text-base">Proposal context</Card.Title><Card.Description class="mt-0.5 text-xs">The details that frame the engagement.</Card.Description></Card.Header><Card.Content class="grid gap-5 p-4 sm:grid-cols-2 sm:p-5">{#if data.proposal.scope}<div class="sm:col-span-2"><p class="text-xs font-medium text-muted-foreground">Scope and deliverables</p><p class="mt-1 whitespace-pre-line text-sm leading-6">{data.proposal.scope}</p></div>{/if}{#if data.proposal.timeline}<div><p class="text-xs font-medium text-muted-foreground">Timeline</p><p class="mt-1 whitespace-pre-line text-sm leading-6">{data.proposal.timeline}</p></div>{/if}{#if data.proposal.payment_terms}<div><p class="text-xs font-medium text-muted-foreground">Payment terms</p><p class="mt-1 whitespace-pre-line text-sm leading-6">{data.proposal.payment_terms}</p></div>{/if}{#if data.proposal.notes}<div><p class="text-xs font-medium text-muted-foreground">Notes</p><p class="mt-1 whitespace-pre-line text-sm leading-6">{data.proposal.notes}</p></div>{/if}{#if data.proposal.terms}<div><p class="text-xs font-medium text-muted-foreground">Terms</p><p class="mt-1 whitespace-pre-line text-sm leading-6">{data.proposal.terms}</p></div>{/if}</Card.Content></Card.Root>{/if}
			</div>

			<div class="space-y-4">
				<Card.Root class="gap-0 bg-card py-0"><Card.Header class="border-b border-border px-4 py-3"><Card.Title class="text-base">Client</Card.Title><Card.Description class="mt-0.5 text-xs">Who this proposal is for.</Card.Description></Card.Header><Card.Content class="p-4">{#if data.client}<a href={`/clients/${data.client.id}`} class="text-sm font-medium text-primary hover:underline">{data.client.name}</a>{:else}<p class="text-sm font-medium">Unknown client</p>{/if}</Card.Content></Card.Root>

				{#if data.proposal.status === 'accepted' && !data.proposal.converted_at}<Card.Root class="gap-0 border-primary/30 bg-primary/5 py-0"><Card.Header class="border-b border-primary/20 px-4 py-3"><Card.Title class="text-base">Turn into work</Card.Title><Card.Description class="mt-0.5 text-xs">Create the project and optionally request a deposit.</Card.Description></Card.Header><Card.Content class="p-4"><form method="POST" action="?/convert" class="space-y-4"><div class="space-y-1.5"><Label for="project-name">Project name</Label><Input id="project-name" name="project_name" bind:value={projectName} required /></div><label class="flex items-start gap-2 rounded-md border border-border bg-background/70 p-3 text-xs leading-5"><input type="checkbox" name="create_invoice" bind:checked={createInvoice} class="mt-0.5 accent-primary" /><span><span class="font-medium text-foreground">Create a deposit invoice</span><br />Save it as a draft so you can review it before sending.</span></label>{#if createInvoice}<div class="space-y-1.5"><Label for="deposit-amount">Deposit amount</Label><Input id="deposit-amount" name="deposit_amount" type="number" min="0.01" max={data.proposal.total} step="0.01" bind:value={depositAmount} required /><p class="text-xs text-muted-foreground">Up to {formatMoney(data.proposal.total, data.proposal.currency_code)}.</p></div>{/if}<Button type="submit" class="w-full"><FolderPlus class="size-3.5" /> {createInvoice ? 'Create project and invoice' : 'Create project'}</Button></form></Card.Content></Card.Root>{/if}
				{#if data.proposal.converted_at}<Card.Root class="gap-0 border-emerald-500/20 bg-emerald-500/5 py-0"><Card.Content class="flex items-start gap-3 p-4"><span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600"><Check class="size-4" /></span><div><p class="text-sm font-medium">Converted to a project</p><p class="mt-1 text-xs leading-5 text-muted-foreground">This proposal is now part of the delivery workflow.</p></div></Card.Content></Card.Root>{/if}
			</div>
		</div>
	{/if}
</div>
