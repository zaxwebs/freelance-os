<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Search from '@lucide/svelte/icons/search';
	import { goto } from '$app/navigation';
	import { onMount, tick } from 'svelte';
	import { emptyWorkspaceSearch, getSearchGroups, type WorkspaceSearchResults } from '$lib/app/search';
	import * as Dialog from '$lib/components/ui/dialog';
	import Input from '$lib/components/ui/input/input.svelte';
	import SearchResultsList from '$lib/components/workspace-search-results.svelte';

	let open = $state(false);
	let query = $state('');
	let loading = $state(false);
	let errorMessage = $state('');
	let results = $state<WorkspaceSearchResults>(emptyWorkspaceSearch());
	let selectedIndex = $state(0);
	let headerFocused = $state(false);
	let inputElement = $state<HTMLInputElement>();
	let searchRequestId = 0;
	let searchTimer: ReturnType<typeof setTimeout> | undefined;
	let headerBlurTimer: ReturnType<typeof setTimeout> | undefined;
	let searchController: AbortController | undefined;
	let resultItems = $derived(getSearchGroups(results).flatMap((group) => group.items));

	const resetSearch = () => {
		if (searchTimer) clearTimeout(searchTimer);
		searchController?.abort();
		searchRequestId += 1;
		query = '';
		loading = false;
		errorMessage = '';
		results = emptyWorkspaceSearch();
		selectedIndex = 0;
	};

	const handleOpenChange = (value: boolean) => {
		open = value;
		if (value) void tick().then(() => inputElement?.focus());
		else resetSearch();
	};

	const openSearch = () => handleOpenChange(true);

	const selectResult = (href: string) => {
		headerFocused = false;
		handleOpenChange(false);
		void goto(href);
	};

	const handleHeaderFocus = () => {
		if (headerBlurTimer) clearTimeout(headerBlurTimer);
		headerFocused = true;
	};

	const handleHeaderBlur = () => {
		headerBlurTimer = setTimeout(() => {
			headerFocused = false;
	}, 120);
	};

	const searchWorkspace = async (searchTerm: string, requestId: number) => {
		const controller = new AbortController();
		searchController = controller;
		try {
			const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`, { signal: controller.signal });
			if (!response.ok) throw new Error('Search is unavailable right now.');
			if (requestId !== searchRequestId) return;
			results = (await response.json()) as WorkspaceSearchResults;
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') return;
			if (requestId !== searchRequestId) return;
			errorMessage = error instanceof Error ? error.message : 'Search is unavailable right now.';
			results = emptyWorkspaceSearch();
		} finally {
			if (requestId === searchRequestId) loading = false;
		}
	};

	const handleQueryInput = (event: Event) => {
		const nextQuery = (event.currentTarget as HTMLInputElement).value;
		query = nextQuery;
		selectedIndex = 0;
		if (searchTimer) clearTimeout(searchTimer);
		searchController?.abort();
		const searchTerm = nextQuery.trim();
		const requestId = ++searchRequestId;

		if (searchTerm.length < 2) {
			loading = false;
			results = emptyWorkspaceSearch();
			errorMessage = '';
			return;
		}

		loading = true;
		errorMessage = '';
		searchTimer = setTimeout(() => void searchWorkspace(searchTerm, requestId), 220);
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'ArrowDown' && resultItems.length > 0) {
			event.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, resultItems.length - 1);
		} else if (event.key === 'ArrowUp' && resultItems.length > 0) {
			event.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, 0);
		} else if (event.key === 'Enter') {
			if (resultItems[selectedIndex]) {
				event.preventDefault();
				selectResult(resultItems[selectedIndex].href);
			} else if (headerFocused && query.trim().length >= 2) {
				event.preventDefault();
				headerFocused = false;
				void goto(`/search?q=${encodeURIComponent(query.trim())}`);
			}
		} else if (event.key === 'Escape' && headerFocused) {
			event.preventDefault();
			headerFocused = false;
			(event.currentTarget as HTMLInputElement).blur();
		}
	};

	onMount(() => {
		const handleGlobalShortcut = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
				event.preventDefault();
				openSearch();
			}
		};
		window.addEventListener('keydown', handleGlobalShortcut);
		return () => {
			window.removeEventListener('keydown', handleGlobalShortcut);
			if (searchTimer) clearTimeout(searchTimer);
			if (headerBlurTimer) clearTimeout(headerBlurTimer);
			searchController?.abort();
		};
	});

</script>

<div class="min-w-0 flex-1">
	<div class="relative hidden w-full max-w-md sm:block">
		<Search class="pointer-events-none absolute top-1/2 left-2.5 z-10 size-3.5 -translate-y-1/2 text-muted-foreground" />
		<Input value={query} oninput={handleQueryInput} onkeydown={handleKeydown} onfocus={handleHeaderFocus} onblur={handleHeaderBlur} placeholder="Search your workspace" aria-label="Search your workspace" aria-keyshortcuts="Control+K Meta+K" class="h-8 bg-muted/40 pr-14 pl-8 focus-visible:bg-background" />
		<kbd class="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">⌘ K</kbd>

		{#if headerFocused && query.trim().length >= 2}
			<div class="absolute top-10 right-0 left-0 z-50 overflow-hidden rounded-md border border-border bg-card shadow-lg">
				{#if loading}
					<div class="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground"><LoaderCircle class="size-4 animate-spin" /> Searching workspace...</div>
				{:else if errorMessage}
					<div class="px-4 py-8 text-center text-sm text-destructive" role="alert">{errorMessage}</div>
				{:else if resultItems.length === 0}
					<div class="flex flex-col items-center px-4 py-8 text-center"><Search class="size-5 text-muted-foreground" /><p class="mt-2 text-sm font-medium">No results found</p><p class="mt-1 text-xs text-muted-foreground">Try a different keyword.</p></div>
				{:else}
					<SearchResultsList {results} compact {selectedIndex} onResultSelect={selectResult} />
					<a href={`/search?q=${encodeURIComponent(query.trim())}`} class="flex items-center justify-between border-t border-border px-3 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"><span>View all results</span><ArrowUpRight class="size-3.5" /></a>
				{/if}
			</div>
		{/if}
	</div>
	<button type="button" class="hidden" aria-label="Search your workspace" aria-keyshortcuts="Control+K Meta+K" onclick={openSearch}>
		<Search class="size-3.5 shrink-0" />
		<span class="min-w-0 flex-1 truncate">Search your workspace</span>
		<kbd class="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">⌘ K</kbd>
	</button>
	<button type="button" class="ml-auto flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:hidden" aria-label="Search your workspace" aria-keyshortcuts="Control+K Meta+K" onclick={openSearch}><Search class="size-4" /></button>
</div>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Content class="max-w-xl gap-0 overflow-hidden bg-card p-0">
		<Dialog.Header class="border-b border-border px-4 py-3">
			<Dialog.Title class="text-base">Search workspace</Dialog.Title>
			<Dialog.Description class="text-xs">Find tasks, projects, and clients in this workspace.</Dialog.Description>
		</Dialog.Header>

		<div class="border-b border-border p-3">
			<div class="relative">
				<Search class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input bind:ref={inputElement} value={query} oninput={handleQueryInput} onkeydown={handleKeydown} placeholder="Search tasks, projects, or clients..." aria-label="Search tasks, projects, or clients" class="h-10 pr-12 pl-9" />
				<kbd class="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">Esc</kbd>
			</div>
		</div>

		<div class="max-h-[min(60vh,28rem)] overflow-y-auto p-2">
			{#if query.trim().length < 2}
				<div class="flex flex-col items-center px-6 py-10 text-center"><Search class="size-5 text-muted-foreground" /><p class="mt-3 text-sm font-medium">Start typing to search</p><p class="mt-1 text-xs text-muted-foreground">Use the arrow keys to move through results.</p></div>
			{:else if loading}
				<div class="flex items-center justify-center gap-2 px-6 py-10 text-sm text-muted-foreground"><LoaderCircle class="size-4 animate-spin" /> Searching workspace...</div>
			{:else if errorMessage}
				<div class="px-6 py-10 text-center text-sm text-destructive" role="alert">{errorMessage}</div>
			{:else if resultItems.length === 0}
				<div class="flex flex-col items-center px-6 py-10 text-center"><Search class="size-5 text-muted-foreground" /><p class="mt-3 text-sm font-medium">No results found</p><p class="mt-1 text-xs text-muted-foreground">Try a different keyword.</p></div>
			{:else}
				<SearchResultsList {results} compact {selectedIndex} onResultSelect={selectResult} />
			{/if}
		</div>

		<div class="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
			<span>Search across your workspace</span>
			{#if query.trim().length >= 2}<a href={`/search?q=${encodeURIComponent(query.trim())}`} class="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary">View all results <ArrowUpRight class="size-3.5" /></a>{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
