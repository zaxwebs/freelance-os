<script lang="ts">
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog';

	interface Props {
		action: string;
		hiddenFields?: Record<string, string>;
		itemName: string;
		itemType: string;
		detail: string;
		triggerIconOnly?: boolean;
	}

	let { action, hiddenFields = {}, itemName, itemType, detail, triggerIconOnly = false }: Props = $props();
	let open = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant={triggerIconOnly ? 'ghost' : 'outline'} size={triggerIconOnly ? 'icon-xs' : 'sm'} class="text-destructive hover:text-destructive" aria-label={triggerIconOnly ? `Delete ${itemName}` : undefined} title={triggerIconOnly ? `Delete ${itemName}` : undefined}><Trash2 class="size-3.5" />{#if !triggerIconOnly} Delete{/if}</Button>
		{/snippet}
	</Dialog.Trigger>

	<Dialog.Content class="max-w-md gap-0 bg-card p-0">
		<Dialog.Header class="px-5 pt-5 pb-1">
			<Dialog.Title class="text-base">Delete {itemType}?</Dialog.Title>
			<Dialog.Description class="text-xs">This action cannot be undone.</Dialog.Description>
		</Dialog.Header>

		<form method="POST" {action} class="space-y-4 px-5 py-4">
			{#each Object.entries(hiddenFields) as [name, value]}
				<input type="hidden" {name} {value} />
			{/each}
			<div class="flex gap-3 rounded-md border border-destructive/25 bg-destructive/5 px-3 py-3 text-destructive">
				<Trash2 class="mt-0.5 size-4 shrink-0" />
				<div class="min-w-0 space-y-1">
					<p class="truncate text-sm font-medium">{itemName}</p>
					<p class="text-xs leading-5 text-destructive">{detail}</p>
				</div>
			</div>

			<Dialog.Footer class="pt-1">
				<Dialog.Close>
					{#snippet child({ props })}
						<Button {...props} variant="outline" size="sm">Cancel</Button>
					{/snippet}
				</Dialog.Close>
				<Button variant="destructive" size="sm" type="submit"><Trash2 class="size-3.5" /> Delete {itemType}</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
