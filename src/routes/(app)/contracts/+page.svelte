<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import ClipboardPenLine from '@lucide/svelte/icons/clipboard-pen-line';
	import FilePlus2 from '@lucide/svelte/icons/file-plus-2';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import ContractSectionNav from '$lib/components/contract-section-nav.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import { statusClass, statusLabel } from '$lib/app/format';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
</script>

<svelte:head>
	<title>Contracts - Freelance OS</title>
	<meta name="description" content="Keep project contracts organized and ready to share." />
</svelte:head>

<div class="space-y-5">
	<PageHeader title="Contracts" description="Agreements connected to your projects." />
	<ContractSectionNav active="contracts" />

	<Card.Root class="gap-0 bg-card py-0">
		<Card.Header class="border-b border-border px-4 py-3 sm:px-5">
			<div><Card.Title class="text-base">Project contracts</Card.Title><Card.Description class="mt-0.5 text-xs">Create contracts from the project they belong to.</Card.Description></div>
		</Card.Header>
		<Card.Content class="p-0">
			{#if data.contracts.length === 0}
				<div class="flex flex-col items-center px-6 py-14 text-center"><div class="flex size-10 items-center justify-center rounded-md bg-muted"><ClipboardPenLine class="size-5 text-muted-foreground" /></div><h2 class="mt-4 text-sm font-semibold">No contracts yet</h2><p class="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">Open a project to create a contract from a reusable template or start with a blank agreement.</p><Button href="/projects" size="sm" class="mt-4"><FilePlus2 class="size-3.5" /> Choose a project</Button></div>
			{:else}
				<div class="divide-y divide-border/70">
					{#each data.contracts as contract (contract.id)}
						<a href={`/projects/${contract.project_id}/contracts/${contract.id}`} class="group flex items-center gap-3 px-4 py-4 transition-colors hover:bg-muted/40 sm:px-5">
							<div class="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"><ClipboardPenLine class="size-4" /></div>
							<div class="min-w-0 flex-1"><p class="truncate text-sm font-semibold group-hover:text-primary">{contract.name}</p><p class="mt-1 truncate text-xs text-muted-foreground">{contract.projectName}</p></div>
							<Badge class={statusClass(contract.status)}>{statusLabel(contract.status)}</Badge><ArrowRight class="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-1" />
						</a>
					{/each}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
