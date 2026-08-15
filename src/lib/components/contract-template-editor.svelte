<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import ContractRichTextEditor from '$lib/components/contract-rich-text-editor.svelte';
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

	onMount(() => {
		name = initial.name ?? '';
	});

</script>

<form method="POST" {action} class="space-y-4">
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
				<ContractRichTextEditor bind:value={content} initialValue={initial.content} ariaLabel="Contract content" />
				<input type="hidden" name="content" value={content} />
				<p class="text-xs text-muted-foreground">Formatting is saved with the template. Use Insert field in the toolbar for details that fill from a project.</p>
			</div>

			{#if formMessage}<p class="text-sm text-destructive">{formMessage}</p>{/if}
			<div class="flex flex-wrap justify-end gap-2 pt-1">
				<Button variant="outline" size="sm" href={cancelHref}>Cancel</Button>
				<Button size="sm" type="submit">{submitLabel}</Button>
			</div>
		</Card.Content>
	</Card.Root>
</form>
