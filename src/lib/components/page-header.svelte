<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		actions?: Snippet;
	}

	let { title, description, actions }: Props = $props();
</script>

<header class="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
	<div class="min-w-0">
		<h1 class="truncate text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
		{#if description}<p class="mt-0.5 text-sm text-muted-foreground">{description}</p>{/if}
	</div>
	{#if actions}<div class="flex shrink-0 flex-wrap gap-2">{@render actions()}</div>{/if}
</header>
