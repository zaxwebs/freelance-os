<script lang="ts">
	import { onMount } from 'svelte';
	import Bold from '@lucide/svelte/icons/bold';
	import Heading2 from '@lucide/svelte/icons/heading-2';
	import Italic from '@lucide/svelte/icons/italic';
	import List from '@lucide/svelte/icons/list';
	import ListOrdered from '@lucide/svelte/icons/list-ordered';
	import Underline from '@lucide/svelte/icons/underline';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';

	interface TemplateValues {
		name?: string;
		content?: string;
	}

	interface Props {
		action: string;
		cancelHref: string;
		formMessage?: string;
		initial?: TemplateValues;
		submitLabel?: string;
	}

	let { action, cancelHref, formMessage, initial = {}, submitLabel = 'Save template' }: Props = $props();
	let name = $state('');
	let content = $state('');
	let editor: HTMLDivElement | null = null;

	onMount(() => {
		name = initial.name ?? '';
		content = initial.content ?? '';
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

<form method="POST" {action} class="space-y-4" onsubmit={syncContent}>
	<Card.Root class="bg-card py-0">
		<Card.Content class="space-y-5 p-4 sm:p-5">
			<div class="space-y-1.5">
				<Label for="template-name">Template name</Label>
				<Input id="template-name" name="name" bind:value={name} placeholder="Freelance services agreement" autofocus required />
				<p class="text-xs text-muted-foreground">Use a name that makes this agreement easy to find later.</p>
			</div>

			<div class="space-y-1.5">
				<div class="flex items-center justify-between gap-3">
					<Label for="template-content">Contract content</Label>
					<span class="text-xs text-muted-foreground">WYSIWYG editor</span>
				</div>
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
					<div bind:this={editor} id="template-content" class="min-h-80 px-4 py-4 text-sm leading-7 outline-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_p]:mb-3" contenteditable="true" data-placeholder="Start writing your agreement..." role="textbox" aria-multiline="true" aria-label="Contract content" oninput={syncContent}></div>
				</div>
				<input type="hidden" name="content" value={content} />
				<p class="text-xs text-muted-foreground">Formatting is saved with the template. You can add reusable details as placeholders.</p>
			</div>

			<div class="space-y-2 rounded-md border border-border bg-muted/20 p-3">
				<div><p class="text-xs font-semibold text-foreground">Insert placeholder</p><p class="mt-0.5 text-xs text-muted-foreground">These will be filled in when a contract is created from the template later.</p></div>
				<div class="flex flex-wrap gap-1.5">
					{#each [
						{ label: 'Client name', value: 'client_name' },
						{ label: 'Project name', value: 'project_name' },
						{ label: 'Freelancer name', value: 'freelancer_name' },
						{ label: 'Start date', value: 'start_date' },
						{ label: 'End date', value: 'end_date' }
					] as placeholder (placeholder.value)}
						<button type="button" class="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30" onclick={() => insertPlaceholder(placeholder.value)}>{placeholder.label}</button>
					{/each}
				</div>
			</div>

			{#if formMessage}<p class="text-sm text-destructive">{formMessage}</p>{/if}
			<div class="flex flex-wrap justify-end gap-2 pt-1">
				<Button variant="outline" size="sm" href={cancelHref}>Cancel</Button>
				<Button size="sm" type="submit">{submitLabel}</Button>
			</div>
		</Card.Content>
	</Card.Root>
</form>
