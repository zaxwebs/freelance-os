<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Search from '@lucide/svelte/icons/search';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Popover from '$lib/components/ui/popover';
	import type { Project } from '$lib/app/types';

	interface Props {
		projects: Project[];
		projectId: string;
		basePath: string;
		query?: string;
		status?: string;
	}

	let { projects, projectId, basePath, query = '', status = 'all' }: Props = $props();
	let open = $state(false);
	let searchQuery = $state('');
	let filteredProjects = $derived(projects.filter((project) => project.name.toLowerCase().includes(searchQuery.trim().toLowerCase())));

	function projectName(id: string) {
		return projects.find((project) => project.id === id)?.name ?? 'All projects';
	}

	function projectHref(id: string) {
		const params = new URLSearchParams();
		if (query.trim()) params.set('q', query.trim());
		if (status !== 'all') params.set('status', status);
		if (id !== 'all') params.set('project', id);
		const search = params.toString();
		return `${basePath}${search ? `?${search}` : ''}`;
	}

	function closeAfterSelection() {
		open = false;
		searchQuery = '';
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" size="default" class="h-9 max-w-full justify-between gap-2 sm:min-w-64">
				<span class="flex min-w-0 items-center gap-1.5">
					<span class="text-muted-foreground">Project:</span>
					<span class="truncate">{projectId === 'all' ? 'All projects' : projectName(projectId)}</span>
				</span>
				<ChevronDown class="size-3.5 shrink-0 text-muted-foreground" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content align="start" class="w-80 max-w-[calc(100vw-2rem)] gap-0 overflow-hidden p-0">
		<div class="flex items-center gap-2 border-b border-border px-3">
			<Search class="size-3.5 shrink-0 text-muted-foreground" />
			<input bind:value={searchQuery} aria-label="Search projects" placeholder="Search projects..." class="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
		</div>
		<div class="max-h-72 overflow-y-auto p-1" role="listbox" aria-label="Projects">
			<a href={projectHref('all')} role="option" aria-selected={projectId === 'all'} onclick={closeAfterSelection} class="flex items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none">
				<Check class={`size-3.5 shrink-0 ${projectId === 'all' ? 'opacity-100' : 'opacity-0'}`} />
				<span>All projects</span>
			</a>
			{#each filteredProjects as project (project.id)}
				<a href={projectHref(project.id)} role="option" aria-selected={projectId === project.id} onclick={closeAfterSelection} class="flex items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none">
					<Check class={`size-3.5 shrink-0 ${projectId === project.id ? 'opacity-100' : 'opacity-0'}`} />
					<span class="truncate">{project.name}</span>
				</a>
			{:else}
				<p class="px-2 py-6 text-center text-xs text-muted-foreground">No projects match your search.</p>
			{/each}
		</div>
	</Popover.Content>
</Popover.Root>
