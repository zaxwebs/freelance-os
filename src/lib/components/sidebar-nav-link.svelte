<script lang="ts">
	import type { Component } from 'svelte';
	import { page } from '$app/state';
	import * as Sidebar from '$lib/components/ui/sidebar';

	interface Props {
		href: string;
		label: string;
		icon: Component;
		onclick?: () => void;
	}

	let { href, label, icon: Icon, onclick }: Props = $props();
	let active = $derived(page.url.pathname === href || (href !== '/overview' && page.url.pathname.startsWith(href)));
</script>

<Sidebar.MenuItem>
	<Sidebar.MenuButton isActive={active} tooltipContent={label} class="rounded-md">
		{#snippet child({ props })}
			<a href={href} {...props} {onclick}>
				<Icon />
				<span>{label}</span>
			</a>
		{/snippet}
	</Sidebar.MenuButton>
</Sidebar.MenuItem>
