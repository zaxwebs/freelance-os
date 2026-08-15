<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ContractTemplateEditor from '$lib/components/contract-template-editor.svelte';
	import type { ActionData } from './$types';

	let { form }: { form?: ActionData } = $props();
</script>

<svelte:head>
	<title>New contract template - Freelance OS</title>
	<meta name="description" content="Create a reusable contract template." />
</svelte:head>

<div class="space-y-5">
	<div class="flex items-center gap-2 text-xs text-muted-foreground"><a href="/contracts/templates" class="inline-flex items-center gap-1.5 hover:text-foreground"><ArrowLeft class="size-3.5" /> Contract templates</a><span aria-hidden="true">/</span><span class="font-medium text-foreground">New template</span></div>
	<header><h1 class="text-2xl font-semibold tracking-tight">New contract template</h1><p class="mt-1 text-sm text-muted-foreground">Create a reusable agreement with the details you use most often.</p></header>

	<ContractTemplateEditor action="?/createTemplate" cancelHref="/contracts/templates" formMessage={form?.message} submitLabel="Create template" />
</div>
