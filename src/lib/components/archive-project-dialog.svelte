<script lang="ts">
	import Archive from '@lucide/svelte/icons/archive';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog';

	interface Props {
		action: string;
		projectName: string;
	}

	let { action, projectName }: Props = $props();
	let open = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" size="sm"><Archive class="size-3.5" /> Archive</Button>
		{/snippet}
	</Dialog.Trigger>

	<Dialog.Content class="max-w-md gap-0 bg-card p-0">
		<Dialog.Header class="px-5 pt-5 pb-1">
			<Dialog.Title class="text-base">Archive project?</Dialog.Title>
			<Dialog.Description class="text-xs">You can restore it later if the work becomes active again.</Dialog.Description>
		</Dialog.Header>

		<form method="POST" {action} class="space-y-4 px-5 py-4">
			<div class="flex gap-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
				<Archive class="mt-0.5 size-4 shrink-0" />
				<div class="min-w-0 space-y-1">
					<p class="text-sm font-medium">{projectName}</p>
					<p class="text-xs leading-5 text-amber-800/80 dark:text-amber-200/80">Its tasks will stay attached and keep their current status, priority, and due dates.</p>
				</div>
			</div>

			<Dialog.Footer class="pt-1">
				<Dialog.Close>
					{#snippet child({ props })}
						<Button {...props} variant="outline" size="sm">Cancel</Button>
					{/snippet}
				</Dialog.Close>
				<Button size="sm" type="submit"><Archive class="size-3.5" /> Archive project</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
