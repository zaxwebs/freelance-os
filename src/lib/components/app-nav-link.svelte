<script lang="ts">
	import type { Component } from 'svelte';
	import { page } from '$app/state';

	interface Props {
		href: string;
		label: string;
		icon: Component;
		onclick?: () => void;
	}

	let { href, label, icon: Icon, onclick }: Props = $props();
	let active = $derived(page.url.pathname === href || (href !== '/overview' && page.url.pathname.startsWith(href)));
</script>

<a
	href={href}
	aria-current={active ? 'page' : undefined}
	onclick={onclick}
	class={{
		'flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors': true,
		'bg-foreground text-background': active,
		'text-muted-foreground hover:bg-muted hover:text-foreground': !active
	}}
>
	<Icon class="size-4" strokeWidth={active ? 2.4 : 2} />
	{label}
</a>
