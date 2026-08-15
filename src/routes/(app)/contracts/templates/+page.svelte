<script lang="ts">
	import ClipboardPenLine from '@lucide/svelte/icons/clipboard-pen-line';
	import Copy from '@lucide/svelte/icons/copy';
	import Plus from '@lucide/svelte/icons/plus';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import DeleteConfirmDialog from '$lib/components/delete-confirm-dialog.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
</script>

<svelte:head>
	<title>Contract templates - Freelance OS</title>
	<meta name="description" content="Create reusable contract templates for your projects." />
</svelte:head>

<div class="space-y-5">
	<PageHeader title="Contract templates" description="Reusable agreements for your projects.">
		{#snippet actions()}<Button href="/contracts/templates/new" size="sm" class="gap-1.5"><Plus class="size-3.5" /> New template</Button>{/snippet}
	</PageHeader>

	<Card.Root class="gap-0 bg-card py-0">
		<Card.Header class="border-b border-border px-4 py-3 sm:px-5">
			<div><Card.Title class="text-base">Your templates</Card.Title><Card.Description class="mt-0.5 text-xs">Keep your common agreements ready to reuse.</Card.Description></div>
		</Card.Header>
		<Card.Content class="p-0">
			{#if data.templates.length === 0}
				<div class="flex flex-col items-center px-6 py-14 text-center"><div class="flex size-10 items-center justify-center rounded-md bg-muted"><ClipboardPenLine class="size-5 text-muted-foreground" /></div><h2 class="mt-4 text-sm font-semibold">No templates yet</h2><p class="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">Create your first reusable agreement. You can add placeholders for client, project, freelancer, and dates.</p><Button href="/contracts/templates/new" size="sm" class="mt-4"><Plus class="size-3.5" /> Create template</Button></div>
			{:else}
				<div class="hidden border-b border-border bg-muted/20 px-4 py-2.5 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase sm:grid sm:grid-cols-[minmax(220px,1fr)_200px] sm:items-center sm:px-5"><span>Template</span><span class="text-right">Actions</span></div>
				<div class="divide-y divide-border/70">
					{#each data.templates as template (template.id)}
						<div class="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(220px,1fr)_200px] sm:items-center sm:px-5">
							<a href={`/contracts/templates/${template.id}/edit`} class="group flex min-w-0 items-center gap-3">
								<div class="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"><ClipboardPenLine class="size-4" /></div>
								<div class="min-w-0"><p class="truncate text-sm font-semibold group-hover:text-primary">{template.name}</p></div>
							</a>
							<div class="flex flex-wrap justify-start gap-1.5 sm:justify-end">
								<Button href={`/contracts/templates/${template.id}/edit`} variant="outline" size="xs">Edit</Button>
								<form method="POST" action="?/duplicateTemplate"><input type="hidden" name="template_id" value={template.id} /><Button type="submit" variant="outline" size="xs" class="gap-1"><Copy class="size-3" /> Duplicate</Button></form>
								<DeleteConfirmDialog action="?/deleteTemplate" itemName={template.name} itemType="template" detail="This template and its content will be permanently removed." hiddenFields={{ template_id: template.id }} triggerIconOnly />
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
