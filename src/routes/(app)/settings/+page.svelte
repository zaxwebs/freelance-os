<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ImagePlus from '@lucide/svelte/icons/image-plus';
	import LogOut from '@lucide/svelte/icons/log-out';
	import { enhance } from '$app/forms';
	import { onDestroy } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';

	let { data, form } = $props();
	let selectedAvatarFile = $state<File | null>(null);
	let previewUrl = $state<string | null>(null);
	let avatarSelectionMessage = $state('');

	const allowedAvatarTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

	const handleAvatarChange = (event: Event) => {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0] ?? null;

		if (previewUrl) URL.revokeObjectURL(previewUrl);
		selectedAvatarFile = null;
		previewUrl = null;
		avatarSelectionMessage = '';

		if (!file) return;
		if (!allowedAvatarTypes.some((type) => type === file.type)) {
			avatarSelectionMessage = 'Choose a JPG, PNG, GIF, or WebP image.';
			input.value = '';
			return;
		}
		if (file.size > 2 * 1024 * 1024) {
			avatarSelectionMessage = 'Profile photos must be 2 MB or smaller.';
			input.value = '';
			return;
		}

		selectedAvatarFile = file;
		previewUrl = URL.createObjectURL(file);
	};

	onDestroy(() => {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
	});
</script>

<svelte:head>
	<title>Settings - Freelance OS</title>
	<meta name="description" content="Manage your Freelance OS account and workspace preferences." />
</svelte:head>

<div class="mx-auto max-w-2xl space-y-4">
	<div class="flex items-center gap-2 text-xs text-muted-foreground"><a href="/overview" class="inline-flex items-center gap-1.5 hover:text-foreground"><ArrowLeft class="size-3.5" /> Overview</a><span aria-hidden="true">/</span><span class="font-medium text-foreground">Settings</span></div>
	<header><h1 class="text-xl font-semibold tracking-tight">Settings</h1><p class="mt-1 text-sm text-muted-foreground">Manage your profile and account access.</p></header>

	<Card class="bg-card py-0">
		<CardContent class="space-y-4 p-4 sm:p-5">
			<div class="flex items-start gap-3 border-b border-border pb-5">
				<Avatar class="size-14 shrink-0">
					{#if previewUrl || data.avatarUrl}<AvatarImage src={previewUrl ?? data.avatarUrl ?? ''} alt={previewUrl ? 'Selected profile photo preview' : 'Current profile photo'} />{/if}
					<AvatarFallback class="bg-primary text-base text-primary-foreground">{(data.displayName || data.email).slice(0, 1).toUpperCase()}</AvatarFallback>
				</Avatar>
				<div class="min-w-0 flex-1 space-y-1.5">
					<p class="text-sm font-medium">Profile photo</p>
					<p class="text-xs text-muted-foreground">JPG, PNG, GIF, or WebP up to 2 MB.</p>
					<form method="POST" action="?/uploadAvatar" enctype="multipart/form-data" use:enhance class="mt-2 space-y-2">
						<div class="flex flex-wrap items-center gap-2">
							<input id="avatar" name="avatar" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required class="sr-only" onchange={handleAvatarChange} />
							<label for="avatar" class="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-within:ring-3 focus-within:ring-ring/20"><ImagePlus class="size-3.5" /> {selectedAvatarFile ? 'Choose another' : 'Choose photo'}</label>
							{#if selectedAvatarFile}<span class="min-w-0 max-w-[14rem] truncate text-xs text-muted-foreground">{selectedAvatarFile.name}</span>{:else}<span class="text-xs text-muted-foreground">No new photo selected</span>{/if}
							<Button type="submit" size="sm" class="ml-auto" disabled={!selectedAvatarFile}>Upload photo</Button>
						</div>
						{#if avatarSelectionMessage}<p role="alert" class="text-xs text-destructive">{avatarSelectionMessage}</p>{/if}
					</form>
				</div>
			</div>

			<form method="POST" action="?/updateProfile" use:enhance class="space-y-1.5 border-b border-border pb-5">
				<Label for="display-name">Name</Label>
				<div class="flex items-center gap-2"><Input id="display-name" name="displayName" type="text" value={data.displayName} maxlength={80} placeholder="Your name" autocomplete="name" /><Button type="submit" size="sm">Save name</Button></div>
			</form>

			<div class="space-y-1.5 border-b border-border pb-5">
				<Label for="email">Email</Label>
				<Input id="email" type="email" value={data.email} disabled />
				{#if data.createdAt}<p class="text-xs text-muted-foreground">Account created {new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>{/if}
			</div>

			<div class="flex flex-wrap items-center justify-between gap-3">
				{#if form?.message}<p aria-live="polite" class={form.success ? 'text-sm text-emerald-600 dark:text-emerald-400' : 'text-sm text-destructive'}>{form.message}</p>{:else}<span></span>{/if}
				<form method="POST" action="?/signOut" use:enhance><Button variant="outline" size="sm" type="submit" class="gap-2"><LogOut class="size-3.5" /> Sign out</Button></form>
			</div>
		</CardContent>
	</Card>
</div>
