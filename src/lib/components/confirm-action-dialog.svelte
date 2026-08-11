<script lang="ts">
	import Ban from '@lucide/svelte/icons/ban';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog';

	interface Props {
		action: string;
		title: string;
		description?: string;
		itemName: string;
		detail: string;
		triggerLabel: string;
		confirmLabel: string;
	}

	let {
		action,
		title,
		description = 'Please confirm this action before continuing.',
		itemName,
		detail,
		triggerLabel,
		confirmLabel
	}: Props = $props();
	let open = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="sm" class="text-destructive hover:text-destructive"><Ban class="size-3.5" /> {triggerLabel}</Button>
		{/snippet}
	</Dialog.Trigger>

	<Dialog.Content class="max-w-md gap-0 bg-card p-0">
		<Dialog.Header class="px-5 pt-5 pb-1">
			<Dialog.Title class="text-base">{title}</Dialog.Title>
			<Dialog.Description class="text-xs">{description}</Dialog.Description>
		</Dialog.Header>

		<form method="POST" {action} class="space-y-4 px-5 py-4">
			<div class="flex gap-3 rounded-md border border-destructive/25 bg-destructive/5 px-3 py-3 text-destructive">
				<Ban class="mt-0.5 size-4 shrink-0" />
				<div class="min-w-0 space-y-1">
					<p class="truncate text-sm font-medium">{itemName}</p>
					<p class="text-xs leading-5 text-foreground/75">{detail}</p>
				</div>
			</div>

			<Dialog.Footer class="pt-1">
				<Dialog.Close>
					{#snippet child({ props })}
						<Button {...props} variant="outline" size="sm">Cancel</Button>
					{/snippet}
				</Dialog.Close>
				<Button variant="destructive" size="sm" type="submit"><Ban class="size-3.5" /> {confirmLabel}</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
