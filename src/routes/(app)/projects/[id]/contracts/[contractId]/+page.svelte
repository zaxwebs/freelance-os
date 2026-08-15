<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Edit3 from '@lucide/svelte/icons/edit-3';
	import ClipboardPenLine from '@lucide/svelte/icons/clipboard-pen-line';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import DeleteConfirmDialog from '$lib/components/delete-confirm-dialog.svelte';
	import { formatDate, statusClass, statusLabel } from '$lib/app/format';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
</script>

<svelte:head>
	<title>{data.contract.name} - Freelance OS</title>
	<meta name="description" content="View the contract attached to this project." />
</svelte:head>

<div class="space-y-5">
	<div class="flex items-center gap-2 text-xs text-muted-foreground"><a href={`/projects/${data.project.id}`} class="inline-flex items-center gap-1.5 hover:text-foreground"><ArrowLeft class="size-3.5" /> {data.project.name}</a><span aria-hidden="true">/</span><span class="font-medium text-foreground">Contract</span></div>
	<header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div class="min-w-0"><div class="mb-2 flex items-center gap-2"><span class="flex size-8 items-center justify-center rounded-md bg-muted"><ClipboardPenLine class="size-4 text-muted-foreground" /></span><Badge class={statusClass(data.contract.status)}>{statusLabel(data.contract.status)}</Badge></div><h1 class="truncate text-2xl font-semibold tracking-tight">{data.contract.name}</h1><p class="mt-1 text-sm text-muted-foreground">{data.project.name}</p></div><div class="flex flex-wrap gap-2"><DeleteConfirmDialog action="?/deleteContract" itemName={data.contract.name} itemType="contract" detail="This project contract and its content will be permanently removed. Reusable templates are not affected." hiddenFields={{ contract_id: data.contract.id }} /><Button href={`/projects/${data.project.id}/contracts/${data.contract.id}/edit`} size="sm"><Edit3 class="size-3.5" /> Edit contract</Button></div></header>

	<div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
		<Card.Root class="gap-0 bg-card py-0"><Card.Content class="p-6 sm:p-8"><article class="prose prose-sm max-w-none text-foreground leading-7 [&_h2]:mb-4 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_p]:mb-4" aria-label="Contract content">{#if data.contract.content}{@html data.contract.content}{:else}<p class="text-muted-foreground">This contract is still blank. Edit it to add the agreement.</p>{/if}</article></Card.Content></Card.Root>
		<Card.Root class="h-fit gap-0 bg-card py-0 xl:sticky xl:top-20"><Card.Header class="border-b border-border px-4 py-3"><Card.Title class="text-base">Contract details</Card.Title><Card.Description class="mt-0.5 text-xs">Dates and lifecycle for this project agreement.</Card.Description></Card.Header><Card.Content class="space-y-3 p-4 text-sm"><div><p class="text-xs text-muted-foreground">Start date</p><p class="mt-1 font-medium">{data.contract.start_date ? formatDate(data.contract.start_date, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}</p></div><div><p class="text-xs text-muted-foreground">End date</p><p class="mt-1 font-medium">{data.contract.end_date ? formatDate(data.contract.end_date, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}</p></div></Card.Content></Card.Root>
	</div>
</div>
