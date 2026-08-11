<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import CircleDollarSign from '@lucide/svelte/icons/circle-dollar-sign';
	import ImagePlus from '@lucide/svelte/icons/image-plus';
	import LogOut from '@lucide/svelte/icons/log-out';
	import ReceiptText from '@lucide/svelte/icons/receipt-text';
	import { enhance } from '$app/forms';
	import { onDestroy } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';

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
	<header><h1 class="text-xl font-semibold tracking-tight">Settings</h1><p class="mt-1 text-sm text-muted-foreground">Manage your profile, account access, and workspace preferences.</p></header>
	{#if form?.message}<p role="status" class={form.success ? 'text-sm text-emerald-600 dark:text-emerald-400' : 'text-sm text-destructive'}>{form.message}</p>{/if}

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

			<div class="flex flex-wrap items-center justify-end gap-3">
				<form method="POST" action="?/signOut" use:enhance><Button variant="outline" size="sm" type="submit" class="gap-2"><LogOut class="size-3.5" /> Sign out</Button></form>
			</div>
		</CardContent>
	</Card>

	<Card class="bg-card py-0">
		<CardContent class="space-y-4 p-4 sm:p-5">
			<div class="flex items-start gap-3 border-b border-border pb-5">
				<div class="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><CircleDollarSign class="size-4" /></div>
				<div><h2 class="text-sm font-medium">Finance settings</h2><p class="mt-0.5 text-xs text-muted-foreground">Choose the currency used to display Finance and reporting totals.</p></div>
			</div>

			<form method="POST" action="?/saveSettings" use:enhance class="space-y-1.5">
				<Label for="base-currency">Display currency</Label>
				<div class="flex items-center gap-2"><select id="base-currency" name="display_currency_code" value={data.displayCurrency} class="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20">{#each data.currencies as currency (currency.code)}<option value={currency.code}>{currency.code} · {currency.name}</option>{/each}</select><Button type="submit" size="sm">Save</Button></div>
			</form>
			<div class="rounded-md border border-border bg-muted/30 p-3 text-xs leading-5 text-muted-foreground"><p class="font-medium text-foreground">USD stays internal</p><p class="mt-1">Invoices, expenses, and transactions keep their original currency plus a USD snapshot. Changing this setting only converts final Finance and reporting totals for display.</p></div>
		</CardContent>
	</Card>

	<Card class="bg-card py-0">
		<CardContent class="space-y-4 p-4 sm:p-5">
			<div class="flex items-start gap-3 border-b border-border pb-5">
				<div class="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><ReceiptText class="size-4" /></div>
				<div><h2 class="text-sm font-medium">Invoice profile</h2><p class="mt-0.5 text-xs text-muted-foreground">This identity appears in the From section of new invoices.</p></div>
			</div>

			<form method="POST" action="?/saveInvoiceSettings" use:enhance class="space-y-4">
				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-1.5"><Label for="business-name">Business name</Label><Input id="business-name" name="business_name" value={data.invoiceSettings.business_name ?? ''} placeholder="Your name or studio" /></div>
					<div class="space-y-1.5"><Label for="legal-name">Legal name <span class="font-normal text-muted-foreground">optional</span></Label><Input id="legal-name" name="legal_name" value={data.invoiceSettings.legal_name ?? ''} placeholder="Legal entity name" /></div>
				</div>
				<div class="space-y-1.5"><Label for="business-address">Freelancer address</Label><Textarea id="business-address" name="business_address" value={data.invoiceSettings.business_address ?? ''} rows={4} /><p class="text-xs text-muted-foreground">Saved onto each new invoice so later address changes do not alter past invoices.</p></div>
				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-1.5"><Label for="business-email">Business email <span class="font-normal text-muted-foreground">optional</span></Label><Input id="business-email" name="business_email" type="email" value={data.invoiceSettings.business_email ?? ''} placeholder="hello@yourstudio.com" /></div>
					<div class="space-y-1.5"><Label for="business-phone">Phone <span class="font-normal text-muted-foreground">optional</span></Label><Input id="business-phone" name="business_phone" value={data.invoiceSettings.business_phone ?? ''} placeholder="+1 555 0100" /></div>
				</div>
				<div class="space-y-1.5"><Label for="business-website">Website <span class="font-normal text-muted-foreground">optional</span></Label><Input id="business-website" name="business_website" type="url" value={data.invoiceSettings.business_website ?? ''} placeholder="https://yourstudio.com" /></div>
				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-1.5"><Label for="tax-id-label">Tax ID label <span class="font-normal text-muted-foreground">optional</span></Label><Input id="tax-id-label" name="tax_id_label" value={data.invoiceSettings.tax_id_label ?? ''} placeholder="VAT number" /></div>
					<div class="space-y-1.5"><Label for="tax-id">Tax ID <span class="font-normal text-muted-foreground">optional</span></Label><Input id="tax-id" name="tax_id" value={data.invoiceSettings.tax_id ?? ''} placeholder="Tax number" /></div>
				</div>
				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-1.5"><Label for="payment-terms">Default payment terms</Label><div class="flex items-center gap-2"><Input id="payment-terms" name="default_payment_terms_days" type="number" min="0" max="365" step="1" value={data.invoiceSettings.default_payment_terms_days ?? 14} /><span class="shrink-0 text-xs text-muted-foreground">days</span></div></div>
					<div class="space-y-1.5"><Label for="footer-note">Footer note <span class="font-normal text-muted-foreground">optional</span></Label><Input id="footer-note" name="footer_note" value={data.invoiceSettings.footer_note ?? ''} placeholder="Thank you for your business." /></div>
				</div>
				<div class="space-y-1.5"><Label for="default-payment-instructions">Default payment instructions <span class="font-normal text-muted-foreground">optional</span></Label><Textarea id="default-payment-instructions" name="default_payment_instructions" value={data.invoiceSettings.default_payment_instructions ?? ''} rows={3} placeholder="Bank transfer details or a payment link." /><p class="text-xs text-muted-foreground">Pre-filled on new invoices, and editable per invoice.</p></div>
				<div class="flex justify-end"><Button type="submit" size="sm">Save invoice profile</Button></div>
			</form>
		</CardContent>
	</Card>
</div>
