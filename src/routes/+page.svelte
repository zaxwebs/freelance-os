<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Briefcase from '@lucide/svelte/icons/briefcase';
	import Check from '@lucide/svelte/icons/check';
	import LockKeyhole from '@lucide/svelte/icons/lock-keyhole';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form?: ActionData } = $props();
</script>

<svelte:head>
	<title>Freelance OS - Make space for the work</title>
	<meta name="description" content="A calm workspace for managing freelance clients, projects, and tasks." />
</svelte:head>

<main class="min-h-screen bg-background text-foreground">
	<div class="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
		<section class="relative hidden overflow-hidden bg-foreground p-10 text-background lg:flex lg:flex-col lg:justify-between xl:p-16">
			<div class="absolute -right-24 -top-24 size-80 rounded-full border border-background/10"></div>
			<div class="absolute -bottom-28 -left-20 size-96 rounded-full border border-background/10"></div>
			<div class="relative z-10 flex items-center gap-3 text-sm font-semibold tracking-[0.18em] uppercase">
				<span class="flex size-10 items-center justify-center bg-background text-foreground"><Briefcase class="size-4" /></span>
				Freelance OS
			</div>

			<div class="relative z-10 max-w-xl">
				<p class="mb-6 flex items-center gap-2 text-sm font-medium text-background/60"><Sparkles class="size-4" /> Made for independent work</p>
				<h1 class="text-4xl leading-[1.05] font-semibold tracking-tight xl:text-3xl">Make space for the work.</h1>
				<p class="mt-8 max-w-md text-lg leading-8 text-background/65">The calm, focused home for everything you are moving forward across clients and projects.</p>
			</div>

			<div class="relative z-10 flex gap-6 text-xs tracking-[0.15em] text-background/50 uppercase"><span>Clients</span><span>Projects</span><span>Momentum</span></div>
		</section>

		<section class="flex items-center justify-center px-6 py-12 sm:px-10">
			<div class="w-full max-w-md">
				<div class="mb-12 lg:hidden">
					<div class="flex items-center gap-3 text-sm font-semibold tracking-[0.18em] uppercase"><span class="flex size-10 items-center justify-center bg-foreground text-background"><Briefcase class="size-4" /></span> Freelance OS</div>
				</div>

				<div class="mb-8 space-y-3">
					<p class="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">Your work, in one place</p>
					<h2 class="text-3xl leading-none font-semibold tracking-tight">Welcome back.</h2>
					<p class="leading-7 text-muted-foreground">Sign in to pick up where you left off.</p>
				</div>

				<Card.Root class="border-border bg-card shadow-xl shadow-black/5">
					<Card.Content class="p-6 sm:p-8">
						<form method="POST" action="?/sendMagicLink" class="space-y-4">
							<div class="space-y-2"><Label for="email">Work email</Label><Input id="email" name="email" type="email" placeholder="you@studio.com" value={form?.email ?? ''} required /></div>
							<Button type="submit" class="h-11 w-full">Send sign-in link <ArrowRight class="size-4" /></Button>
						</form>
						{#if form?.message}<p class={`mt-5 text-sm ${form.success ? 'text-emerald-600' : 'text-destructive'}`}>{form.message}</p>{/if}
					</Card.Content>
				</Card.Root>

				<div class="mt-8 space-y-3 text-sm text-muted-foreground">
					<div class="flex items-center gap-3"><LockKeyhole class="size-4" /><span>Passwordless and private by default.</span></div>
					<div class="flex items-center gap-3"><Check class="size-4" /><span>Keep every client and project in view.</span></div>
				</div>
			</div>
		</section>
	</div>
</main>


