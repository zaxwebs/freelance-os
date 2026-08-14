<script lang="ts">
	import FolderKanban from '@lucide/svelte/icons/folder-kanban';
	import Plus from '@lucide/svelte/icons/plus';
	import Users from '@lucide/svelte/icons/users';
	import { enhance } from '$app/forms';
	import Button, { type ButtonVariant } from '$lib/components/ui/button/button.svelte';
	import DatePicker from '$lib/components/date-picker.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import { taskPriorities } from '$lib/app/types';
	import { supportedCurrencies } from '$lib/app/currency';

	type QuickCreateKind = 'task' | 'project' | 'client';
	type ProjectOption = { id: string; name: string };
	type ClientOption = { id: string; name: string; company?: string | null; default_currency_code?: string | null };

	interface Props {
		kind: QuickCreateKind;
		action: string;
		projects?: ProjectOption[];
		clients?: ClientOption[];
		defaultProjectId?: string;
		defaultClientId?: string;
		onSuccess?: () => void | Promise<void>;
		label?: string;
		variant?: ButtonVariant;
	}

	let {
		kind,
		action,
		projects = [],
		clients = [],
		defaultProjectId = '',
		defaultClientId = '',
		onSuccess,
		label,
		variant = 'default'
	}: Props = $props();

	let open = $state(false);
	let errorMessage = $state('');
	let buttonLabel = $derived(label ?? (kind === 'task' ? 'New task' : kind === 'project' ? 'New project' : 'New client'));
	let dialogTitle = $derived(kind === 'task' ? 'Create a task' : kind === 'project' ? 'Create a project' : 'Add a client');
	let dialogDescription = $derived(
		kind === 'task'
			? 'Capture the next action without leaving your current view.'
			: kind === 'project'
				? 'Give the engagement a name and connect it to a client.'
				: 'Keep the relationship ready for the next piece of work.'
	);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button {...props} {variant} size="sm">
				<Plus class="size-3.5" />
				{buttonLabel}
			</Button>
		{/snippet}
	</Dialog.Trigger>

	<Dialog.Content class="max-w-md gap-0 bg-card p-0">
		<Dialog.Header class="px-5 pt-5 pb-1">
			<Dialog.Title class="text-base">{dialogTitle}</Dialog.Title>
			<Dialog.Description class="text-xs">{dialogDescription}</Dialog.Description>
		</Dialog.Header>

		<form
			method="POST"
			action={action}
			class="space-y-4 px-5 py-4"
			use:enhance={() => {
				errorMessage = '';
				return async ({ result, update }) => {
					if (result.type === 'failure') {
						const data = result.data as { message?: string } | undefined;
						errorMessage = data?.message ?? 'Please check the form and try again.';
						await update({ reset: false, invalidateAll: false });
						return;
					}
					open = false;
					await update();
					await onSuccess?.();
				};
			}}
		>
			{#if kind === 'task'}
				<div class="space-y-1.5">
					<Label for="quick-task-title">Task title</Label>
					<Input id="quick-task-title" name="title" placeholder="Send homepage concepts" autofocus required />
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-1.5">
						<Label for="quick-task-project">Project</Label>
						<select id="quick-task-project" name="project_id" class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20">
							<option value="">No project</option>
							{#each projects as project (project.id)}
								<option value={project.id} selected={defaultProjectId === project.id}>{project.name}</option>
							{/each}
						</select>
					</div>
					<div class="space-y-1.5">
						<Label for="quick-task-priority">Priority</Label>
						<select id="quick-task-priority" name="priority" class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20">
							{#each taskPriorities as priority (priority.value)}
								<option value={priority.value} selected={priority.value === 'medium'}>{priority.label}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="space-y-1.5">
					<Label for="quick-task-due-date">Due date <span class="font-normal normal-case text-muted-foreground">optional</span></Label>
					<DatePicker id="quick-task-due-date" name="due_date" />
				</div>
			{:else if kind === 'project'}
				<div class="space-y-1.5">
					<Label for="quick-project-name">Project name</Label>
					<Input id="quick-project-name" name="name" placeholder="Brand refresh" autofocus required />
				</div>

				<div class="space-y-1.5">
					<Label for="quick-project-client">Client <span class="font-normal normal-case text-muted-foreground">optional</span></Label>
					<select id="quick-project-client" name="client_id" class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20">
						<option value="">No client yet</option>
						{#each clients as client (client.id)}
							<option value={client.id} selected={defaultClientId === client.id}>{client.name}{client.company ? ` - ${client.company}` : ''}</option>
						{/each}
					</select>
				</div>

				<div class="space-y-1.5">
					<Label for="quick-project-description">Description <span class="font-normal normal-case text-muted-foreground">optional</span></Label>
					<Textarea id="quick-project-description" name="description" rows={3} placeholder="What are you helping this client move forward?" />
				</div>

				<div class="space-y-1.5">
					<Label for="quick-project-currency">Billing currency override</Label>
					<select id="quick-project-currency" name="billing_currency_code" class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20">
						<option value="">Inherit from client</option>
						{#each supportedCurrencies as currency (currency.code)}<option value={currency.code}>{currency.code} · {currency.name}</option>{/each}
					</select>
				</div>
			{:else}
				<div class="space-y-1.5">
					<Label for="quick-client-name">Name</Label>
					<Input id="quick-client-name" name="name" placeholder="Jordan Lee" autofocus required />
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-1.5">
						<Label for="quick-client-company">Company <span class="font-normal normal-case text-muted-foreground">optional</span></Label>
						<Input id="quick-client-company" name="company" placeholder="Acme Studio" />
					</div>
					<div class="space-y-1.5">
						<Label for="quick-client-email">Email <span class="font-normal normal-case text-muted-foreground">optional</span></Label>
						<Input id="quick-client-email" name="email" type="email" placeholder="hello@acme.com" />
					</div>
				</div>

				<div class="space-y-1.5">
					<Label for="quick-client-address">Billing address <span class="font-normal normal-case text-muted-foreground">optional</span></Label>
					<Textarea id="quick-client-address" name="billing_address" rows={3} />
				</div>

				<div class="space-y-1.5">
					<Label for="quick-client-currency">Default billing currency</Label>
					<select id="quick-client-currency" name="default_currency_code" class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20">
						{#each supportedCurrencies as currency (currency.code)}<option value={currency.code} selected={currency.code === 'USD'}>{currency.code} · {currency.name}</option>{/each}
					</select>
				</div>
			{/if}

			{#if errorMessage}
				<p class="text-sm text-destructive" role="alert">{errorMessage}</p>
			{/if}

			<Dialog.Footer class="pt-1">
				<Dialog.Close>
					{#snippet child({ props })}
						<Button {...props} variant="outline" size="sm">Cancel</Button>
					{/snippet}
				</Dialog.Close>
				<Button size="sm" type="submit">
					{#if kind === 'task'}<Plus class="size-3.5" /> Create task{:else if kind === 'project'}<FolderKanban class="size-3.5" /> Create project{:else}<Users class="size-3.5" /> Create client{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
