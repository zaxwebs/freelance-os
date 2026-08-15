<script lang="ts">
	import { onMount } from 'svelte';
	import { type ContractPlaceholderSummary } from '$lib/app/contract-placeholders';
	import { contractStatuses } from '$lib/app/statuses';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import ContractPlaceholderNotice from '$lib/components/contract-placeholder-notice.svelte';
	import ContractRichTextEditor from '$lib/components/contract-rich-text-editor.svelte';
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

	onMount(() => {
		status = initial.status ?? 'draft';
	});
</script>

<form method="POST" {action} class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
	<input type="hidden" name="content" value={content} />
	<div class="space-y-4">
		{#if placeholderSummary}<ContractPlaceholderNotice summary={placeholderSummary} />{/if}
		<Card.Root class="gap-0 bg-card py-0">
			<Card.Header class="border-b border-border px-4 py-3 sm:px-5"><Card.Title class="text-base">{projectName} - Contract</Card.Title><Card.Description class="mt-0.5 text-xs">Edit the agreement that belongs to this project.</Card.Description></Card.Header>
			<Card.Content class="p-4 sm:p-5">
				<ContractRichTextEditor bind:value={content} initialValue={initial.content} minHeightClass="min-h-[32rem]" />
			</Card.Content>
		</Card.Root>
	</div>

	<Card.Root class="h-fit gap-0 bg-card py-0 xl:sticky xl:top-20">
		<Card.Header class="border-b border-border px-4 py-3"><Card.Title class="text-base">Contract details</Card.Title><Card.Description class="mt-0.5 text-xs">Keep the lifecycle easy to scan.</Card.Description></Card.Header>
		<Card.Content class="space-y-4 p-4 sm:p-5">
			<div class="space-y-1.5"><Label for="contract-status">Status</Label><select id="contract-status" name="status" bind:value={status} class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20">{#each contractStatuses as option (option)}<option value={option}>{statusLabel(option)}</option>{/each}</select></div>
			{#if formMessage}<p role="alert" class="text-sm text-destructive">{formMessage}</p>{/if}
			<div class="flex flex-col gap-2"><Button type="submit" class="w-full">{submitLabel}</Button><Button variant="outline" size="sm" href={cancelHref} class="w-full">Cancel</Button></div>
		</Card.Content>
	</Card.Root>
</form>
