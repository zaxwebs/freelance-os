<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ProposalForm from '$lib/components/proposal-form.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form?: ActionData } = $props();
</script>

<svelte:head><title>New proposal - Freelance OS</title></svelte:head>

<div class="mx-auto max-w-5xl space-y-5">
	<div class="flex items-center gap-2 text-xs text-muted-foreground"><a href="/proposals" class="inline-flex items-center gap-1.5 hover:text-foreground"><ArrowLeft class="size-3.5" /> Proposals</a><span aria-hidden="true">/</span><span class="font-medium text-foreground">New proposal</span></div>
	<header><h1 class="text-2xl font-semibold tracking-tight">New proposal</h1><p class="mt-1 text-sm text-muted-foreground">Define the work, price, and next step before you start the project.</p></header>

	<ProposalForm
		clients={data.clients}
		currencies={data.currencies}
		action="?/createProposal"
		cancelHref="/proposals"
		submitLabel="Save draft"
		formMessage={form?.message}
		showSendToggle={true}
		initial={{ clientId: data.defaultClientId }}
	/>
</div>
