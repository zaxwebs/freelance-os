<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ContractTemplateEditor from '$lib/components/contract-template-editor.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form?: ActionData } = $props();
</script>

<svelte:head>
	<title>Edit {data.template.name} - Freelance OS</title>
	<meta name="description" content="Edit a reusable contract template." />
</svelte:head>

<div class="space-y-5">
	<div class="flex items-center gap-2 text-xs text-muted-foreground"><a href="/contracts/templates" class="inline-flex items-center gap-1.5 hover:text-foreground"><ArrowLeft class="size-3.5" /> Contract templates</a><span aria-hidden="true">/</span><span class="max-w-[18rem] truncate font-medium text-foreground">{data.template.name}</span></div>
	<header><h1 class="truncate text-2xl font-semibold tracking-tight">Edit contract template</h1><p class="mt-1 text-sm text-muted-foreground">Keep this reusable agreement current as your work changes.</p></header>

	<ContractTemplateEditor action="?/updateTemplate" cancelHref="/contracts/templates" formMessage={form?.message} submitLabel="Save changes" initial={data.template} />
</div>
