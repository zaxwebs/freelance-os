<script lang="ts">
	import Info from '@lucide/svelte/icons/info';
	import type { Component } from 'svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';

	interface Props {
		label: string;
		value: string | number;
		detail?: string;
		labelTooltip?: string;
		href?: string;
		icon?: Component;
		tone?: 'primary' | 'amber' | 'violet' | 'emerald' | 'neutral';
		featured?: boolean;
	}

	let { label, value, detail, labelTooltip, href, icon: Icon, tone = 'neutral', featured = false }: Props = $props();
	const iconToneClasses = {
		primary: 'bg-primary/10 text-primary',
		amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
		violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
		emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
		neutral: 'bg-muted text-muted-foreground'
	} as const;
	const featuredIconToneClasses = {
		primary: 'bg-primary text-white',
		amber: 'bg-amber-500 text-white',
		violet: 'bg-violet-600 text-white',
		emerald: 'bg-emerald-600 text-white',
		neutral: 'bg-slate-600 text-white'
	} as const;
	let iconClass = $derived(
		(featured ? featuredIconToneClasses : iconToneClasses)[tone]
	);
</script>

<div class={`relative overflow-hidden text-sm ${featured ? 'z-10 bg-transparent text-white' : 'bg-card text-card-foreground'}`}>
	<div class="relative p-4">
		<div class={`flex items-center justify-between ${featured ? 'text-white/70' : 'text-muted-foreground'}`}>
			<span class="flex items-center gap-1.5 text-xs font-medium">
				{label}
				{#if labelTooltip}
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props })}
								<button {...props} type="button" class={`inline-flex size-4 items-center justify-center rounded-sm outline-none transition-colors focus-visible:ring-2 ${featured ? 'text-white/55 hover:text-white focus-visible:ring-white/30' : 'text-muted-foreground/70 hover:text-foreground focus-visible:ring-ring/30'}`} aria-label={`${label}: ${labelTooltip}`}>
									<Info class="size-3" />
								</button>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content side="top">{labelTooltip}</Tooltip.Content>
					</Tooltip.Root>
				{/if}
			</span>
			{#if Icon}<span class={`flex size-7 items-center justify-center rounded-md ${iconClass}`}><Icon class="size-3.5" /></span>{/if}
		</div>
		<div class={`${featured ? 'mt-5' : 'mt-3'} flex items-end justify-between gap-3`}>
			<p class="text-2xl font-semibold tracking-tight">{value}</p>
			{#if detail}
				{#if href}<a href={href} class={`text-xs font-medium transition-colors ${featured ? 'text-white/65 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}>{detail} <span aria-hidden="true">↗</span></a>
				{:else}<span class={`text-xs ${featured ? 'text-white/65' : 'text-muted-foreground'}`}>{detail}</span>{/if}
			{/if}
		</div>
	</div>
</div>
