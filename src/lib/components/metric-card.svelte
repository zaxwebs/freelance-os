<script lang="ts">
	import type { Component } from 'svelte';

	interface Props {
		label: string;
		value: string | number;
		detail?: string;
		href?: string;
		icon?: Component;
		tone?: 'primary' | 'amber' | 'violet' | 'emerald' | 'neutral';
	}

	let { label, value, detail, href, icon: Icon, tone = 'neutral' }: Props = $props();
	let iconClass = $derived(
		({
			primary: 'bg-primary/10 text-primary',
			amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
			violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
			emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
			neutral: 'bg-muted text-muted-foreground'
		} as const)[tone]
	);
</script>

	<div class="bg-card text-sm text-card-foreground">
	<div class="p-4">
		<div class="flex items-center justify-between text-muted-foreground"><span class="text-xs font-medium">{label}</span>{#if Icon}<span class={`flex size-7 items-center justify-center rounded-md ${iconClass}`}><Icon class="size-3.5" /></span>{/if}</div>
		<div class="mt-3 flex items-end justify-between gap-3"><p class="text-2xl font-semibold tracking-tight">{value}</p>{#if detail}{#if href}<a href={href} class="text-xs font-medium text-muted-foreground hover:text-foreground">{detail} <span aria-hidden="true">↗</span></a>{:else}<span class="text-xs text-muted-foreground">{detail}</span>{/if}{/if}</div>
	</div>
</div>
