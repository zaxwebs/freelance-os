<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Briefcase from '@lucide/svelte/icons/briefcase';
	import Bell from '@lucide/svelte/icons/bell';
	import CircleHelp from '@lucide/svelte/icons/circle-help';
	import Banknote from '@lucide/svelte/icons/banknote';
	import FolderKanban from '@lucide/svelte/icons/folder-kanban';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import ListChecks from '@lucide/svelte/icons/list-checks';
	import Plus from '@lucide/svelte/icons/plus';
	import ReceiptText from '@lucide/svelte/icons/receipt-text';
	import Scroll from '@lucide/svelte/icons/scroll';
	import Settings from '@lucide/svelte/icons/settings';
	import Users from '@lucide/svelte/icons/users';
	import WalletCards from '@lucide/svelte/icons/wallet-cards';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import SidebarNavLink from '$lib/components/sidebar-nav-link.svelte';
	import WorkspaceSearch from '$lib/components/workspace-search.svelte';

	interface Props {
		email: string;
		displayName: string;
		avatarUrl: string | null;
		children: Snippet;
	}

	let { email, displayName, avatarUrl, children }: Props = $props();
	let profileLabel = $derived(displayName || 'Your workspace');
	let initial = $derived((displayName || email).slice(0, 1).toUpperCase());
	let pageTitle = $derived(
		page.url.pathname.startsWith('/tasks')
			? 'Tasks'
			: page.url.pathname.startsWith('/projects')
				? 'Projects'
			: page.url.pathname.startsWith('/clients')
					? 'Clients'
					: page.url.pathname.startsWith('/finance')
						? 'Finance'
			: page.url.pathname.startsWith('/invoices')
					? 'Invoices'
			: page.url.pathname.startsWith('/proposals')
					? 'Proposals'
			: page.url.pathname.startsWith('/expenses')
						? 'Expenses'
					: page.url.pathname.startsWith('/search')
						? 'Search'
						: page.url.pathname.startsWith('/settings')
							? 'Settings'
							: 'Overview'
	);

	const mainNavigation = [
		{ href: '/overview', label: 'Overview', icon: LayoutDashboard },
		{ href: '/tasks', label: 'Tasks', icon: ListChecks },
		{ href: '/projects', label: 'Projects', icon: FolderKanban },
		{ href: '/clients', label: 'Clients', icon: Users },
		{ href: '/finance', label: 'Finance', icon: Banknote },
		{ href: '/invoices', label: 'Invoices', icon: ReceiptText },
		{ href: '/proposals', label: 'Proposals', icon: Scroll },
		{ href: '/expenses', label: 'Expenses', icon: WalletCards }
	];
</script>

<Sidebar.Provider>
	<Sidebar.Root variant="sidebar" collapsible="icon">
		<Sidebar.Header class="p-3">
			<a href="/overview" class="flex items-center gap-2.5 rounded-md px-2 py-2 transition-colors hover:bg-sidebar-accent">
				<span class="flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
					<Briefcase class="size-3.5" />
				</span>
				<span class="truncate text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">Freelance OS</span>
			</a>
		</Sidebar.Header>

		<Sidebar.Content class="px-2 py-1">
			<Sidebar.Group class="px-1">
				<Sidebar.GroupLabel>Workspace</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each mainNavigation as item (item.href)}
							<SidebarNavLink {...item} />
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>

			<Sidebar.Group class="mt-4 px-1">
				<Sidebar.GroupLabel>Shortcuts</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						<SidebarNavLink href="/tasks/new" label="New task" icon={Plus} />
						<SidebarNavLink href="/projects/new" label="New project" icon={FolderKanban} />
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>

			<Sidebar.Group class="mt-4 px-1">
				<Sidebar.GroupLabel>Manage</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						<SidebarNavLink href="/settings" label="Settings" icon={Settings} />
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		</Sidebar.Content>

		<Sidebar.Footer class="p-3">
			<a href="/settings" class="flex items-center gap-3 rounded-md border border-sidebar-border bg-sidebar-accent/40 p-2.5 transition-colors hover:bg-sidebar-accent">
				<Avatar class="size-8 shrink-0">
					{#if avatarUrl}<AvatarImage src={avatarUrl} alt="Profile photo" />{/if}
					<AvatarFallback class="bg-sidebar-primary text-xs text-sidebar-primary-foreground">{initial}</AvatarFallback>
				</Avatar>
				<div class="min-w-0 group-data-[collapsible=icon]:hidden">
					<p class="truncate text-xs font-medium">{profileLabel}</p>
					<p class="truncate text-[11px] text-sidebar-foreground/60">{email}</p>
				</div>
			</a>
		</Sidebar.Footer>
	</Sidebar.Root>

	<Sidebar.Inset class="bg-muted/30">
		<header class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background px-4 sm:px-6 lg:px-8">
			<div class="flex min-w-0 items-center gap-2">
				<Sidebar.Trigger class="rounded-md" />
				<div class="hidden h-4 w-px bg-border sm:block"></div>
				<nav aria-label="Breadcrumb" class="flex min-w-0 items-center gap-1.5 text-xs">
					<span class="text-muted-foreground">Workspace</span>
					<ChevronRight class="size-3.5 text-muted-foreground/60" />
					<span class="truncate font-medium text-foreground">{pageTitle}</span>
				</nav>
			</div>
			<div class="flex min-w-0 flex-1 justify-center px-2 sm:px-4"><WorkspaceSearch /></div>
			<div class="ml-auto flex items-center gap-1.5">
				<Tooltip.Root>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="ghost" size="icon-sm" aria-label="Notifications"><Bell class="size-4" /></Button>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Content side="bottom">Coming soon</Tooltip.Content>
				</Tooltip.Root>
				<Tooltip.Root>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="ghost" size="icon-sm" aria-label="Help and support"><CircleHelp class="size-4" /></Button>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Content side="bottom">Coming soon</Tooltip.Content>
				</Tooltip.Root>
				<Button href="/tasks/new" size="sm" class="hidden gap-1.5 sm:inline-flex"><Plus class="size-3.5" /> New task</Button>
				<a href="/settings" class="rounded-full outline-none ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-ring/30">
					<Avatar class="size-8">
						{#if avatarUrl}<AvatarImage src={avatarUrl} alt="Profile photo" />{/if}
						<AvatarFallback class="bg-primary text-xs text-primary-foreground">{initial}</AvatarFallback>
					</Avatar>
				</a>
			</div>
		</header>

		<main class="min-h-[calc(100vh-3.5rem)] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
			<div class="mx-auto max-w-[1360px]">{@render children()}</div>
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
