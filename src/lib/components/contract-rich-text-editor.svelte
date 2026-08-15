<script lang="ts">
	import { onMount } from 'svelte';
	import Bold from '@lucide/svelte/icons/bold';
	import Braces from '@lucide/svelte/icons/braces';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Heading2 from '@lucide/svelte/icons/heading-2';
	import Italic from '@lucide/svelte/icons/italic';
	import List from '@lucide/svelte/icons/list';
	import ListOrdered from '@lucide/svelte/icons/list-ordered';
	import Underline from '@lucide/svelte/icons/underline';
	import { contractPlaceholderDefinitions } from '$lib/app/contract-placeholders';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	interface Props {
		ariaLabel?: string;
		initialValue?: string;
		minHeightClass?: string;
		placeholder?: string;
		value?: string;
	}

	let {
		ariaLabel = 'Contract content',
		initialValue = '',
		minHeightClass = 'min-h-80',
		placeholder = 'Start writing your agreement...',
		value = $bindable('')
	}: Props = $props();

	let editor: HTMLDivElement | null = null;
	let savedSelection: Range | null = null;

	onMount(() => {
		value = initialValue;
		if (editor) editor.innerHTML = initialValue;
	});

	function syncContent() {
		value = editor?.innerHTML ?? '';
	}

	function saveEditorSelection() {
		const selection = document.getSelection();
		if (!editor || !selection?.rangeCount) return;

		const range = selection.getRangeAt(0);
		if (editor.contains(range.commonAncestorContainer)) savedSelection = range.cloneRange();
	}

	function runCommand(command: string, commandValue?: string) {
		editor?.focus();
		document.execCommand(command, false, commandValue);
		syncContent();
	}

	function toggleHeading() {
		let current: Node | null = document.getSelection()?.anchorNode ?? null;
		let isHeading = false;
		while (current && current !== editor) {
			if (current.nodeType === Node.ELEMENT_NODE && (current as Element).tagName === 'H2') {
				isHeading = true;
				break;
			}
			current = current.parentNode;
		}

		editor?.focus();
		document.execCommand('formatBlock', false, isHeading ? 'p' : 'h2');
		syncContent();
	}

	function insertPlaceholder(placeholderValue: string) {
		if (savedSelection) {
			const selection = document.getSelection();
			selection?.removeAllRanges();
			selection?.addRange(savedSelection);
		}
		editor?.focus();
		document.execCommand('insertText', false, `{{${placeholderValue}}}`);
		syncContent();
		savedSelection = null;
	}
</script>

<div class="overflow-hidden rounded-md border border-input bg-background shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20">
	<div class="flex flex-wrap items-center gap-1 border-b border-border bg-muted/30 p-1.5" aria-label="Formatting toolbar">
		<button type="button" class="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30" aria-label="Bold" title="Bold" onmousedown={(event) => event.preventDefault()} onclick={() => runCommand('bold')}><Bold class="size-4" /></button>
		<button type="button" class="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30" aria-label="Italic" title="Italic" onmousedown={(event) => event.preventDefault()} onclick={() => runCommand('italic')}><Italic class="size-4" /></button>
		<button type="button" class="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30" aria-label="Underline" title="Underline" onmousedown={(event) => event.preventDefault()} onclick={() => runCommand('underline')}><Underline class="size-4" /></button>
		<span class="mx-1 h-5 w-px bg-border" aria-hidden="true"></span>
		<button type="button" class="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30" aria-label="Toggle heading" title="Toggle heading" onmousedown={(event) => event.preventDefault()} onclick={toggleHeading}><Heading2 class="size-4" /></button>
		<button type="button" class="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30" aria-label="Bulleted list" title="Bulleted list" onmousedown={(event) => event.preventDefault()} onclick={() => runCommand('insertUnorderedList')}><List class="size-4" /></button>
		<button type="button" class="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30" aria-label="Numbered list" title="Numbered list" onmousedown={(event) => event.preventDefault()} onclick={() => runCommand('insertOrderedList')}><ListOrdered class="size-4" /></button>
		<span class="mx-1 h-5 w-px bg-border" aria-hidden="true"></span>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger class="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30" aria-label="Insert field" title="Insert field" onpointerdown={saveEditorSelection}>
				<Braces class="size-4" />
				<ChevronDown class="size-3" />
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="start" class="w-56">
				{#each contractPlaceholderDefinitions as field (field.value)}
					<DropdownMenu.Item class="items-start normal-case tracking-normal" onmousedown={(event) => event.preventDefault()} onclick={() => insertPlaceholder(field.value)}>
						<span class="flex flex-col items-start gap-0.5">
							<span>{field.label}</span>
							<code class="font-mono text-[11px] font-normal text-muted-foreground">{'{{'}{field.value}{'}}'}</code>
						</span>
					</DropdownMenu.Item>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
	<div bind:this={editor} class={`${minHeightClass} px-4 py-4 text-sm leading-7 outline-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_p]:mb-3`} contenteditable="true" data-placeholder={placeholder} role="textbox" aria-multiline="true" aria-label={ariaLabel} oninput={syncContent}></div>
</div>
