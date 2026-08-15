<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ClipboardPenLine from '@lucide/svelte/icons/clipboard-pen-line';
	import FilePenLine from '@lucide/svelte/icons/file-pen-line';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import DatePicker from '$lib/components/date-picker.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form?: ActionData } = $props();
	let selectedTemplateId = $state('');
	let startDate = $state<string | null>(null);
	let endDate = $state<string | null>(null);
</script>

<svelte:head>
	<title>New contract - {data.project.name} - Freelance OS</title>
	<meta name="description" content="Create a project contract from a reusable template or a blank agreement." />
</svelte:head>

<div class="space-y-5">
	<div class="flex items-center gap-2 text-xs text-muted-foreground"><a href={`/projects/${data.project.id}`} class="inline-flex items-center gap-1.5 hover:text-foreground"><ArrowLeft class="size-3.5" /> {data.project.name}</a><span aria-hidden="true">/</span><span class="font-medium text-foreground">New contract</span></div>
	<header><h1 class="text-2xl font-semibold tracking-tight">Add contract</h1><p class="mt-1 text-sm text-muted-foreground">Start with a reusable agreement or write a blank one for {data.project.name}.</p></header>

	{#if form?.message}<p role="alert" class="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">{form.message}</p>{/if}

	<form method="POST" action="?/createContract" class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
		<input type="hidden" name="template_id" value={selectedTemplateId} />
		<Card.Root class="gap-0 bg-card py-0">
			<Card.Header class="border-b border-border px-4 py-3 sm:px-5"><Card.Title class="text-base">Choose a starting point</Card.Title><Card.Description class="mt-0.5 text-xs">The selected template will be copied into this project contract.</Card.Description></Card.Header>
			<Card.Content class="space-y-2 p-4 sm:p-5">
				<label class={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${selectedTemplateId === '' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'}`}><input type="radio" name="template_choice" value="" checked={selectedTemplateId === ''} onchange={() => (selectedTemplateId = '')} class="mt-1 accent-primary" /><span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"><FilePenLine class="size-4" /></span><span><span class="block text-sm font-medium">Start blank</span><span class="mt-1 block text-xs text-muted-foreground">Write the agreement from scratch.</span></span></label>
				{#each data.templates as template (template.id)}
					<label class={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${selectedTemplateId === template.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'}`}><input type="radio" name="template_choice" value={template.id} checked={selectedTemplateId === template.id} onchange={() => (selectedTemplateId = template.id)} class="mt-1 accent-primary" /><span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"><ClipboardPenLine class="size-4" /></span><span><span class="block text-sm font-medium">{template.name}</span><span class="mt-1 block text-xs text-muted-foreground">Copied once into this contract.</span></span></label>
				{/each}
				{#if data.templates.length === 0}<p class="rounded-md border border-dashed border-border px-3 py-4 text-xs text-muted-foreground">No templates yet. You can start blank now, then create reusable templates from the Templates section.</p>{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root class="h-fit gap-0 bg-card py-0 xl:sticky xl:top-20">
			<Card.Header class="border-b border-border px-4 py-3"><Card.Title class="text-base">Contract details</Card.Title><Card.Description class="mt-0.5 text-xs">You can refine these in the editor.</Card.Description></Card.Header>
			<Card.Content class="space-y-4 p-4 sm:p-5">
				<div class="space-y-1.5"><Label for="new-contract-start">Start date</Label><DatePicker id="new-contract-start" name="start_date" bind:value={startDate} placeholder="Choose start date" /></div>
				<div class="space-y-1.5"><Label for="new-contract-end">End date</Label><DatePicker id="new-contract-end" name="end_date" bind:value={endDate} placeholder="Choose end date" /></div>
				<div class="rounded-md border border-border bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">The new contract will be named <span class="font-medium text-foreground">{data.project.name} - Contract</span> and saved as a draft.</div>
				<div class="flex flex-col gap-2"><Button type="submit" class="w-full">Create draft</Button><Button variant="outline" size="sm" href={`/projects/${data.project.id}`} class="w-full">Cancel</Button></div>
			</Card.Content>
		</Card.Root>
	</form>
</div>
