<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ContractEditor from '$lib/components/contract-editor.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form?: ActionData } = $props();
</script>

<svelte:head>
	<title>Edit contract - {data.project.name} - Freelance OS</title>
	<meta name="description" content="Edit the contract attached to this project." />
</svelte:head>

<div class="space-y-5">
	<div class="flex items-center gap-2 text-xs text-muted-foreground"><a href={`/projects/${data.project.id}`} class="inline-flex items-center gap-1.5 hover:text-foreground"><ArrowLeft class="size-3.5" /> {data.project.name}</a><span aria-hidden="true">/</span><span class="font-medium text-foreground">Edit contract</span></div>
	<header><h1 class="text-2xl font-semibold tracking-tight">Edit contract</h1><p class="mt-1 text-sm text-muted-foreground">Keep the agreement current as the project changes.</p></header>

	<ContractEditor action="?/updateContract" cancelHref={`/projects/${data.project.id}/contracts/${data.contract.id}`} formMessage={form?.message} initial={data.contract} placeholderSummary={data.placeholderSummary} projectName={data.project.name} />
</div>
