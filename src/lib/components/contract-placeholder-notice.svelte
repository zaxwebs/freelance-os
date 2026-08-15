<script lang="ts">
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import { getContractPlaceholderLabel, type ContractPlaceholderSummary } from '$lib/app/contract-placeholders';

	interface Props {
		showReady?: boolean;
		summary: ContractPlaceholderSummary;
	}

	let { showReady = false, summary }: Props = $props();
	let hasIssues = $derived(summary.missingSmart.length > 0 || summary.manual.length > 0);
	let showReadyState = $derived(showReady && !hasIssues && summary.smart.length > 0);
	let missingLabels = $derived(summary.missingSmart.map(getContractPlaceholderLabel).join(', '));
	let manualLabels = $derived(summary.manual.map((field) => `{{${field}}}`).join(', '));
	let completionCount = $derived(summary.missingSmart.length + summary.manual.length);
	let completionDetails = $derived([
		summary.missingSmart.length > 0 ? `${summary.missingSmart.length} smart field${summary.missingSmart.length === 1 ? '' : 's'} need project data` : '',
		summary.manual.length > 0 ? `${summary.manual.length} manual field${summary.manual.length === 1 ? '' : 's'} need replacement` : ''
	].filter(Boolean).join('; '));
</script>

{#if hasIssues || showReadyState}
	<div class="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-border bg-card px-3 py-2.5 text-xs" role="status" aria-live="polite">
		<div class="flex items-center gap-2">
			<span class="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true"></span>
			<span class="font-medium text-foreground">Template fields</span>
		</div>
		<div class="flex flex-wrap items-center gap-1.5">
			{#if summary.smart.length > 0}
				<span class="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary" title="Smart fields fill from project details when the contract is viewed">Smart {summary.smart.length}</span>
			{/if}
			{#if summary.manual.length > 0}
				<span class="rounded-full bg-violet-500/10 px-2 py-0.5 font-medium text-violet-700 dark:text-violet-300" title={`Manual placeholders stay in the contract until replaced: ${manualLabels}`}>Manual {summary.manual.length}</span>
			{/if}
			{#if completionCount > 0}
				<span class="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 font-medium text-amber-800 dark:text-amber-200" title={`${completionDetails}${missingLabels ? ` · ${missingLabels}` : ''}`}><CircleAlert class="size-3" aria-hidden="true" /> {completionCount} to complete</span>
			{/if}
		</div>
		<p class="text-muted-foreground">
			{#if hasIssues}
				Review the marked fields before sharing.
			{:else}
				Smart fields fill automatically from project details.
			{/if}
		</p>
	</div>
{/if}
