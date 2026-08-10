<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Button from '$lib/components/ui/button/button.svelte';

	interface Props {
		page: number;
		pageSize: number;
		total: number;
		basePath: string;
		query?: Record<string, string>;
	}

	let { page, pageSize, total, basePath, query = {} }: Props = $props();

	let totalPages = $derived(Math.max(1, Math.ceil(total / pageSize)));
	let firstItem = $derived(total === 0 ? 0 : (page - 1) * pageSize + 1);
	let lastItem = $derived(Math.min(page * pageSize, total));

	function pageHref(nextPage: number) {
		const params = new URLSearchParams();
		for (const [key, value] of Object.entries(query)) {
			if (value && value !== 'all') params.set(key, value);
		}
		params.set('page', String(nextPage));
		return `${basePath}?${params.toString()}`;
	}
</script>

{#if total > 0 && totalPages > 1}
	<div class="flex items-center justify-between gap-3 py-2 text-xs text-muted-foreground">
		<p>Showing {firstItem}-{lastItem} of {total}</p>
		<div class="flex items-center gap-1">
			{#if page > 1}
				<Button variant="outline" size="icon-sm" href={pageHref(page - 1)} aria-label="Previous page"><ChevronLeft class="size-3.5" /></Button>
			{:else}
				<Button variant="outline" size="icon-sm" disabled aria-label="Previous page"><ChevronLeft class="size-3.5" /></Button>
			{/if}
			<span class="min-w-16 text-center font-medium text-foreground">Page {page} of {totalPages}</span>
			{#if page < totalPages}
				<Button variant="outline" size="icon-sm" href={pageHref(page + 1)} aria-label="Next page"><ChevronRight class="size-3.5" /></Button>
			{:else}
				<Button variant="outline" size="icon-sm" disabled aria-label="Next page"><ChevronRight class="size-3.5" /></Button>
			{/if}
		</div>
	</div>
{/if}
