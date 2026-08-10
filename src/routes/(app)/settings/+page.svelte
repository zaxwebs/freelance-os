<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Check from '@lucide/svelte/icons/check';
	import LogOut from '@lucide/svelte/icons/log-out';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import UserRound from '@lucide/svelte/icons/user-round';
	import { enhance } from '$app/forms';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import CardDescription from '$lib/components/ui/card/card-description.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import CardTitle from '$lib/components/ui/card/card-title.svelte';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Settings - Freelance OS</title>
	<meta name="description" content="Manage your Freelance OS account and workspace preferences." />
</svelte:head>

<div class="space-y-5">
	<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
		<div>
			<a href="/overview" class="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft class="size-3.5" /> Overview</a>
			<h1 class="text-xl font-semibold tracking-tight">Settings</h1>
			<p class="mt-1 text-sm text-muted-foreground">Account and workspace preferences.</p>
		</div>
		<Badge variant="secondary" class="w-fit gap-2 px-3 py-1.5"><Check class="size-3.5" /> Synced with Supabase</Badge>
	</div>

	<div class="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
		<Card>
			<CardHeader>
				<div class="flex items-start gap-4"><div class="flex size-11 items-center justify-center bg-muted"><UserRound class="size-5" /></div><div><CardTitle>Account</CardTitle><CardDescription>Your sign-in identity for this workspace.</CardDescription></div></div>
			</CardHeader>
			<CardContent class="space-y-5">
				<div class="rounded-none border border-border bg-muted/30 p-4"><p class="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Signed in as</p><p class="mt-2 break-all text-sm font-medium">{data.email}</p>{#if data.createdAt}<p class="mt-1 text-xs text-muted-foreground">Account created {new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>{/if}</div>
				<form method="POST" action="?/signOut" use:enhance><Button variant="outline" size="sm" type="submit" class="gap-2"><LogOut class="size-3.5" /> Sign out</Button></form>
				{#if form?.message}<p class="text-sm text-destructive">{form.message}</p>{/if}
			</CardContent>
		</Card>

		<Card class="bg-foreground text-background">
			<CardHeader><div class="flex size-11 items-center justify-center bg-background/10"><ShieldCheck class="size-5" /></div><CardTitle class="mt-5 text-background">Private by default</CardTitle><CardDescription class="text-background/65">Your clients, projects, and tasks are protected by row-level security policies in Supabase.</CardDescription></CardHeader>
			<CardContent><div class="space-y-3 text-sm text-background/75"><p class="flex gap-3"><Check class="mt-0.5 size-4 shrink-0 text-background" /> Only your signed-in account can read this workspace.</p><p class="flex gap-3"><Check class="mt-0.5 size-4 shrink-0 text-background" /> Updates are saved directly to your database.</p><p class="flex gap-3"><Check class="mt-0.5 size-4 shrink-0 text-background" /> Magic-link authentication keeps passwords out of the app.</p></div></CardContent>
		</Card>
	</div>
</div>
