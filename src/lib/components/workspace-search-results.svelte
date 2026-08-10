<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import BriefcaseBusiness from '@lucide/svelte/icons/briefcase-business';
	import FolderKanban from '@lucide/svelte/icons/folder-kanban';
	import ListChecks from '@lucide/svelte/icons/list-checks';
	import Users from '@lucide/svelte/icons/users';
	import { getSearchGroups, type WorkspaceSearchResults } from '$lib/app/search';

	interface Props {
		results: WorkspaceSearchResults;
		compact?: boolean;
		selectedIndex?: number;
		onResultSelect?: (href: string) => void;
	}

	let { results, compact = false, selectedIndex, onResultSelect }: Props = $props();
	let groups = $derived(getSearchGroups(results));

	const handleResultClick = (event: MouseEvent, href: string) => {
		if (!onResultSelect) return;
		event.preventDefault();
		onResultSelect(href);
	};
</script>

<div class={compact ? 'divide-y divide-border/70' : 'overflow-hidden rounded-md border border-border bg-card'}>
	{#each groups as group (group.kind)}
		<section class={compact ? '' : 'border-b border-border last:border-0'}>
			<div class={compact ? 'flex items-center gap-2 px-3 py-2 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase' : 'flex items-center gap-2 border-b border-border/70 bg-muted/30 px-4 py-2.5 text-xs font-semibold'}>
				{#if group.kind === 'task'}<ListChecks class="size-3.5 text-blue-600 dark:text-blue-400" />{:else if group.kind === 'project'}<FolderKanban class="size-3.5 text-violet-600 dark:text-violet-400" />{:else}<Users class="size-3.5 text-emerald-600 dark:text-emerald-400" />{/if}
				{group.label}<span class="font-normal text-muted-foreground">{group.items.length}</span>
			</div>
			<div class="divide-y divide-border/70">
				{#each group.items as item (item.href)}
					<a href={item.href} data-selected={item.index === selectedIndex} onclick={(event) => handleResultClick(event, item.href)} class={`group flex items-center gap-3 transition-colors ${compact ? 'px-3 py-2.5' : 'px-4 py-3'} ${item.index === selectedIndex ? 'bg-muted' : 'hover:bg-muted/50'}`}>
						<span class="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-background">
							{#if item.kind === 'task'}<ListChecks class="size-3.5" />{:else if item.kind === 'project'}<FolderKanban class="size-3.5" />{:else}<BriefcaseBusiness class="size-3.5" />{/if}
						</span>
						<span class="min-w-0 flex-1">
							<span class="block truncate text-sm font-medium group-hover:text-primary">{item.title}</span>
							<span class="mt-0.5 block truncate text-xs text-muted-foreground">{item.subtitle}</span>
						</span>
						{#if item.meta}<span class="hidden max-w-32 truncate text-xs text-muted-foreground sm:block">{item.meta}</span>{/if}
						<ArrowUpRight class="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
					</a>
				{/each}
			</div>
		</section>
	{/each}
</div>
