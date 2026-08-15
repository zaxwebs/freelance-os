<script lang="ts">
	import { onMount } from 'svelte';
	import Bold from '@lucide/svelte/icons/bold';
	import Heading2 from '@lucide/svelte/icons/heading-2';
	import Italic from '@lucide/svelte/icons/italic';
	import List from '@lucide/svelte/icons/list';
	import ListOrdered from '@lucide/svelte/icons/list-ordered';
	import Underline from '@lucide/svelte/icons/underline';
	import { contractPlaceholderDefinitions, type ContractPlaceholderSummary } from '$lib/app/contract-placeholders';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import ContractPlaceholderNotice from '$lib/components/contract-placeholder-notice.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { statusLabel } from '$lib/app/format';

	interface ContractValues {
		content?: string;
		name?: string;
		status?: string;
	}

	interface Props {
		action: string;
		cancelHref: string;
		formMessage?: string;
		initial?: ContractValues;
		placeholderSummary?: ContractPlaceholderSummary;
		projectName: string;
		submitLabel?: string;
	}

	let { action, cancelHref, formMessage, initial = {}, placeholderSummary, projectName, submitLabel = 'Save changes' }: Props = $props();
	let content = $state('');
	let status = $state('draft');
	let editor: HTMLDivElement | null = null;

	onMount(() => {
		content = initial.content ?? '';
		status = initial.status ?? 'draft';
		if (editor) editor.innerHTML = content;
	});

	function syncContent() {
		content = editor?.innerHTML ?? '';
	}

	function runCommand(command: string, value?: string) {
		editor?.focus();
		document.execCommand(command, false, value);
		syncContent();
	}

	function insertPlaceholder(value: string) {
		editor?.focus();
		document.execCommand('insertText', false, `{{${value}}}`);
		syncContent();
	}
</script>

<form method="POST" {action} class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]" onsubmit={syncContent}>
	<input type="hidden" name="content" value={content} />
	<div class="space-y-4">
		{#if placeholderSummary}<ContractPlaceholderNotice summary={placeholderSummary} />{/if}
		<Card.Root class="gap-0 bg-card py-0">
			<Card.Header class="border-b border-border px-4 py-3 sm:px-5"><Card.Title class="text-base">{projectName} - Contract</Card.Title><Card.Description class="mt-0.5 text-xs">Edit the agreement that belongs to this project.</Card.Description></Card.Header>
			<Card.Content class="p-4 sm:p-5">
				<div class="overflow-hidden rounded-md border border-input bg-background shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20">
					<div class="flex flex-wrap items-center gap-1 border-b border-border bg-muted/30 p-1.5" aria-label="Formatting toolbar">
						<button type="button" class="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30" aria-label="Bold" title="Bold" onmousedown={(event) => event.preventDefault()} onclick={() => runCommand('bold')}><Bold class="size-4" /></button>
						<button type="button" class="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30" aria-label="Italic" title="Italic" onmousedown={(event) => event.preventDefault()} onclick={() => runCommand('italic')}><Italic class="size-4" /></button>
						<button type="button" class="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30" aria-label="Underline" title="Underline" onmousedown={(event) => event.preventDefault()} onclick={() => runCommand('underline')}><Underline class="size-4" /></button>
						<span class="mx-1 h-5 w-px bg-border" aria-hidden="true"></span>
						<button type="button" class="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30" aria-label="Heading" title="Heading" onmousedown={(event) => event.preventDefault()} onclick={() => runCommand('formatBlock', 'h2')}><Heading2 class="size-4" /></button>
						<button type="button" class="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30" aria-label="Bulleted list" title="Bulleted list" onmousedown={(event) => event.preventDefault()} onclick={() => runCommand('insertUnorderedList')}><List class="size-4" /></button>
						<button type="button" class="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30" aria-label="Numbered list" title="Numbered list" onmousedown={(event) => event.preventDefault()} onclick={() => runCommand('insertOrderedList')}><ListOrdered class="size-4" /></button>
					</div>
					<div bind:this={editor} class="min-h-[32rem] px-4 py-5 text-sm leading-7 outline-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_p]:mb-3" contenteditable="true" data-placeholder="Start writing your agreement..." role="textbox" aria-multiline="true" aria-label="Contract content" oninput={syncContent}></div>
				</div>
				<p class="mt-2 text-xs text-muted-foreground">This is an independent copy. Changes here will not affect the reusable template.</p>
			</Card.Content>
		</Card.Root>

		<Card.Root class="gap-0 bg-card py-0">
			<Card.Header class="border-b border-border px-4 py-3 sm:px-5"><Card.Title class="text-base">Insert smart field</Card.Title><Card.Description class="mt-0.5 text-xs">Smart fields resolve to current project details when the contract is viewed.</Card.Description></Card.Header>
			<Card.Content class="flex flex-wrap gap-1.5 p-4 sm:p-5">
				{#each contractPlaceholderDefinitions as placeholder (placeholder.value)}
					<button type="button" class="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30" onclick={() => insertPlaceholder(placeholder.value)}>{placeholder.label}</button>
				{/each}
			</Card.Content>
		</Card.Root>
	</div>

	<Card.Root class="h-fit gap-0 bg-card py-0 xl:sticky xl:top-20">
		<Card.Header class="border-b border-border px-4 py-3"><Card.Title class="text-base">Contract details</Card.Title><Card.Description class="mt-0.5 text-xs">Keep the lifecycle easy to scan.</Card.Description></Card.Header>
		<Card.Content class="space-y-4 p-4 sm:p-5">
			<div class="space-y-1.5"><Label for="contract-status">Status</Label><select id="contract-status" name="status" bind:value={status} class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20">{#each ['draft', 'active', 'ended'] as option}<option value={option}>{statusLabel(option)}</option>{/each}</select></div>
			{#if formMessage}<p role="alert" class="text-sm text-destructive">{formMessage}</p>{/if}
			<div class="flex flex-col gap-2"><Button type="submit" class="w-full">{submitLabel}</Button><Button variant="outline" size="sm" href={cancelHref} class="w-full">Cancel</Button></div>
		</Card.Content>
	</Card.Root>
</form>
