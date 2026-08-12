<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import FileText from '@lucide/svelte/icons/file-text';
	import Plus from '@lucide/svelte/icons/plus';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import MetricCard from '$lib/components/metric-card.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import PaginationControls from '$lib/components/pagination-controls.svelte';
	import { formatMoney } from '$lib/app/currency';
	import { formatDate, proposalStatusClass, statusLabel } from '$lib/app/format';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const statusFilters = [
		{ value: 'all', label: 'All proposals' },
		{ value: 'draft', label: 'Draft' },
		{ value: 'sent', label: 'Sent' },
		{ value: 'accepted', label: 'Accepted' },
		{ value: 'declined', label: 'Declined' },
		{ value: 'expired', label: 'Expired' }
	];
	let activeCount = $derived(data.proposals.filter((proposal: { status: string }) => ['sent', 'viewed'].includes(proposal.status)).length);
	let acceptedCount = $derived(data.proposals.filter((proposal: { status: string }) => proposal.status === 'accepted').length);
	let draftCount = $derived(data.proposals.filter((proposal: { status: string }) => proposal.status === 'draft').length);
</script>

<svelte:head>
	<title>Proposals - Freelance OS</title>
	<meta name="description" content="Turn your next freelance engagement into a clear proposal." />
</svelte:head>

<div class="space-y-5">
	<PageHeader title="Proposals" description="Shape the work before it becomes a project or invoice.">
		{#snippet actions()}<Button href="/proposals/new" size="sm" class="gap-1.5"><Plus class="size-3.5" /> New proposal</Button>{/snippet}
	</PageHeader>

	<section class="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
		<MetricCard label="Active proposals" value={activeCount} detail="Awaiting a response" tone="primary" />
		<MetricCard label="Accepted" value={acceptedCount} detail="Ready to convert" tone="emerald" />
		<MetricCard label="Drafts" value={draftCount} detail="Still editable" />
	</section>

	<Card.Root class="gap-0 bg-card py-0">
		<Card.Header class="border-b border-border px-4 py-3 sm:flex sm:flex-row sm:items-center sm:justify-between">
			<div><Card.Title class="text-base">Proposal Register</Card.Title><Card.Description class="mt-0.5 text-xs">A simple record of the work you are offering.</Card.Description></div>
			<div class="flex flex-wrap gap-1.5">
				{#each statusFilters as filter (filter.value)}
					<a href={filter.value === 'all' ? '/proposals' : `/proposals?status=${filter.value}`} class={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${data.status === filter.value ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>{filter.label}</a>
				{/each}
			</div>
		</Card.Header>
		<Card.Content class="p-0">
			{#if data.proposals.length === 0}
				<div class="flex flex-col items-center px-6 py-14 text-center"><div class="flex size-10 items-center justify-center rounded-md bg-muted"><FileText class="size-5 text-muted-foreground" /></div><h2 class="mt-4 text-sm font-semibold">No proposals here yet</h2><p class="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">Create a clear offer before the work moves into a project.</p><Button href="/proposals/new" size="sm" class="mt-4"><Plus class="size-3.5" /> Create proposal</Button></div>
			{:else}
				<div class="hidden border-b border-border bg-muted/20 px-4 py-2.5 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase sm:grid sm:grid-cols-[minmax(180px,1fr)_120px_140px_120px_100px_28px] sm:items-center sm:px-5"><span>Proposal</span><span>Issue Date</span><span>Valid Until</span><span>Amount</span><span>Status</span><span aria-hidden="true"></span></div>
				<div class="divide-y divide-border/70">
					{#each data.proposals as proposal (proposal.id)}
						<a href={`/proposals/${proposal.id}`} class="group grid gap-3 px-4 py-4 transition-colors hover:bg-muted/40 sm:grid-cols-[minmax(180px,1fr)_120px_140px_120px_100px_28px] sm:items-center sm:px-5">
							<div class="min-w-0"><p class="truncate text-sm font-semibold group-hover:text-primary">{proposal.title}</p><p class="mt-1 truncate text-xs text-muted-foreground">{proposal.client?.name ?? 'Unknown client'}{proposal.client?.company ? ` · ${proposal.client.company}` : ''}</p></div>
							<div><p class="text-xs text-muted-foreground sm:hidden">Issue date</p><p class="text-sm font-medium">{formatDate(proposal.issue_date, { month: 'short', day: 'numeric', year: 'numeric' })}</p></div>
							<div><p class="text-xs text-muted-foreground sm:hidden">Valid until</p><p class="text-sm font-medium">{proposal.valid_until ? formatDate(proposal.valid_until, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No expiry set'}</p></div>
							<div><p class="text-xs text-muted-foreground sm:hidden">Amount</p><p class="text-sm font-medium">{formatMoney(proposal.total, proposal.currency_code)}</p></div>
							<div><Badge variant="outline" class={proposalStatusClass(proposal.status)}>{statusLabel(proposal.status)}</Badge></div>
							<ArrowRight class="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
						</a>
					{/each}
				</div>
				<div class="px-4 sm:px-5"><PaginationControls basePath="/proposals" page={data.pagination.page} pageSize={data.pagination.pageSize} total={data.pagination.total} query={{ status: data.status }} /></div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
