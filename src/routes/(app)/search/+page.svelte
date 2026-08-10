<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import Search from '@lucide/svelte/icons/search';
	import * as Card from '$lib/components/ui/card';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import WorkspaceSearchResults from '$lib/components/workspace-search-results.svelte';

	let { data } = $props();
	let hasResults = $derived(data.results.tasks.length + data.results.projects.length + data.results.clients.length > 0);
</script>

<svelte:head>
	<title>Search - Freelance OS</title>
	<meta name="description" content="Search tasks, projects, and clients across your freelance workspace." />
</svelte:head>

<div class="space-y-5">
	<PageHeader title="Search workspace" description="Find tasks, projects, and clients in one place." />

	<Card.Root class="bg-card py-0">
		<CardContent class="p-3 sm:p-4">
			<form method="GET" class="relative max-w-2xl">
				<Search class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input name="q" value={data.query} placeholder="Search tasks, projects, or clients..." aria-label="Search tasks, projects, or clients" autofocus class="pl-9 pr-20" />
				<button type="submit" class="absolute top-1/2 right-2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground">Search</button>
			</form>
		</CardContent>
	</Card.Root>

	{#if data.query.length < 2}
		<div class="flex flex-col items-center rounded-md border border-dashed border-border px-6 py-14 text-center"><Search class="size-5 text-muted-foreground" /><h2 class="mt-3 text-sm font-semibold">Search your workspace</h2><p class="mt-1 text-xs text-muted-foreground">Enter at least two characters to find matching work.</p></div>
	{:else if !hasResults}
		<div class="flex flex-col items-center rounded-md border border-dashed border-border px-6 py-14 text-center"><Search class="size-5 text-muted-foreground" /><h2 class="mt-3 text-sm font-semibold">No results found</h2><p class="mt-1 text-xs text-muted-foreground">Try a different keyword or check your spelling.</p></div>
	{:else}
		<WorkspaceSearchResults results={data.results} />
	{/if}

	<a href="/overview" class="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">Back to overview <ArrowUpRight class="size-3.5" /></a>
</div>
