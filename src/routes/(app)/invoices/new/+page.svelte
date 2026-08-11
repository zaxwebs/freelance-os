<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import FileText from '@lucide/svelte/icons/file-text';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import { formatMoney } from '$lib/app/currency';
	import type { ActionData, PageData } from './$types';

	type LineItem = { description: string; quantity: string; unitPrice: string; taxRate: string };

	let { data, form }: { data: PageData; form?: ActionData } = $props();
	let clientId = $state(data.defaultClientId);
	let projectId = $state(data.defaultProjectId);
	let currencyCode = $state(data.projects.find((project) => project.id === data.defaultProjectId)?.billing_currency_code ?? data.clients.find((client) => client.id === data.defaultClientId)?.default_currency_code ?? 'USD');
	let issueDate = $state(new Date().toISOString().slice(0, 10));
	let dueDate = $state(new Date(Date.now() + data.defaultPaymentTermsDays * 86400000).toISOString().slice(0, 10));
	let sendNow = $state(false);
	let paymentInstructions = $state(data.defaultPaymentInstructions);
	let items = $state<LineItem[]>([{ description: '', quantity: '1', unitPrice: '', taxRate: '0' }]);
	let projectsForClient = $derived(data.projects.filter((project) => project.client_id === clientId));
	let subtotal = $derived(items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0));
	let taxTotal = $derived(items.reduce((sum, item) => {
		const lineSubtotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);
		return sum + lineSubtotal * (Number(item.taxRate || 0) / 100);
	}, 0));
	let total = $derived(subtotal + taxTotal);

	function addLine() {
		items = [...items, { description: '', quantity: '1', unitPrice: '', taxRate: '0' }];
	}

	function removeLine(index: number) {
		if (items.length === 1) return;
		items = items.filter((_, itemIndex) => itemIndex !== index);
	}

	function handleClientChange() {
		if (projectId && !projectsForClient.some((project) => project.id === projectId)) projectId = '';
		currencyCode = data.clients.find((client) => client.id === clientId)?.default_currency_code ?? 'USD';
	}

	function handleProjectChange() {
		currencyCode = data.projects.find((project) => project.id === projectId)?.billing_currency_code ?? data.clients.find((client) => client.id === clientId)?.default_currency_code ?? 'USD';
	}
</script>

<svelte:head><title>New invoice - Freelance OS</title></svelte:head>

<div class="mx-auto max-w-5xl space-y-5">
	<div class="flex items-center gap-2 text-xs text-muted-foreground"><a href="/invoices" class="inline-flex items-center gap-1.5 hover:text-foreground"><ArrowLeft class="size-3.5" /> Invoices</a><span aria-hidden="true">/</span><span class="font-medium text-foreground">New invoice</span></div>
	<header><h1 class="text-2xl font-semibold tracking-tight">New invoice</h1><p class="mt-1 text-sm text-muted-foreground">Create a deposit, milestone, or final invoice for work already in motion.</p></header>

	{#if form?.message}<p role="alert" class="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">{form.message}</p>{/if}

	<form method="POST" action="?/createInvoice" class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
		<input type="hidden" name="line_items" value={JSON.stringify(items)} />
		<input type="hidden" name="currency_code" value={currencyCode} />
		<Card.Root class="gap-0 bg-card py-0">
			<Card.Header class="border-b border-border px-4 py-3 sm:px-5"><Card.Title class="text-base">Invoice details</Card.Title><Card.Description class="mt-0.5 text-xs">The client and project determine where this invoice appears.</Card.Description></Card.Header>
			<Card.Content class="space-y-4 p-4 sm:p-5">
				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-1.5"><Label for="client">Client</Label><select id="client" name="client_id" bind:value={clientId} onchange={handleClientChange} required class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"><option value="">Choose a client</option>{#each data.clients as client (client.id)}<option value={client.id}>{client.name}{client.company ? ` - ${client.company}` : ''}</option>{/each}</select>{#if data.clients.length === 0}<p class="text-xs text-muted-foreground">Create a client before billing.</p>{/if}</div>
					<div class="space-y-1.5"><Label for="project">Project <span class="font-normal text-muted-foreground">optional</span></Label><select id="project" name="project_id" bind:value={projectId} onchange={handleProjectChange} class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"><option value="">No project attached</option>{#each projectsForClient as project (project.id)}<option value={project.id}>{project.name}</option>{/each}</select><p class="text-xs text-muted-foreground">Multiple invoices can be attached to the same project.</p></div>
				</div>
				<div class="space-y-1.5"><Label for="currency">Invoice currency</Label><select id="currency" bind:value={currencyCode} class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20">{#each data.currencies as currency (currency.code)}<option value={currency.code}>{currency.code} · {currency.name}</option>{/each}</select><p class="text-xs text-muted-foreground">Inherited from the project or client by default. You can override it for this invoice.</p></div>
				<div class="grid gap-4 sm:grid-cols-2"><div class="space-y-1.5"><Label for="issue-date">Issue date</Label><Input id="issue-date" name="issue_date" type="date" bind:value={issueDate} required /></div><div class="space-y-1.5"><Label for="due-date">Due date</Label><Input id="due-date" name="due_date" type="date" bind:value={dueDate} required /></div></div>

				<div class="rounded-md border border-border">
					<div class="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-2"><div><p class="text-sm font-medium">Line items</p><p class="text-xs text-muted-foreground">Use one line per milestone or service.</p></div><Button type="button" variant="outline" size="sm" onclick={addLine}><Plus class="size-3.5" /> Add line</Button></div>
					<div class="divide-y divide-border">
						{#each items as item, index (index)}
							<div class="grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_82px_112px_82px_32px] sm:items-end">
								<div class="space-y-1.5"><Label for={`line-description-${index}`}>Description</Label><Input id={`line-description-${index}`} bind:value={item.description} placeholder="Brand strategy milestone" /></div>
								<div class="space-y-1.5"><Label for={`line-quantity-${index}`}>Qty</Label><Input id={`line-quantity-${index}`} bind:value={item.quantity} type="number" min="0.01" step="0.01" /></div>
								<div class="space-y-1.5"><Label for={`line-rate-${index}`}>Rate</Label><Input id={`line-rate-${index}`} bind:value={item.unitPrice} type="number" min="0" step="0.01" placeholder="0.00" /></div>
								<div class="space-y-1.5"><Label for={`line-tax-${index}`}>Tax %</Label><Input id={`line-tax-${index}`} bind:value={item.taxRate} type="number" min="0" max="100" step="0.01" /></div>
								<Button type="button" variant="ghost" size="icon-sm" aria-label="Remove line item" onclick={() => removeLine(index)} disabled={items.length === 1}><Trash2 class="size-3.5" /></Button>
							</div>
						{/each}
					</div>
				</div>

				<div class="grid gap-4 sm:grid-cols-2"><div class="space-y-1.5"><Label for="notes">Notes <span class="font-normal text-muted-foreground">optional</span></Label><Textarea id="notes" name="notes" rows={4} placeholder="Thanks for the work together." /></div><div class="space-y-1.5"><Label for="payment-instructions">Payment instructions <span class="font-normal text-muted-foreground">optional</span></Label><Textarea id="payment-instructions" name="payment_instructions" bind:value={paymentInstructions} rows={4} placeholder="Bank transfer details or payment link." /><p class="text-xs text-muted-foreground">Pre-filled from Settings. You can change it for this invoice.</p></div></div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="h-fit gap-0 bg-card py-0 xl:sticky xl:top-20">
			<Card.Header class="border-b border-border px-4 py-3"><Card.Title class="text-base">Review</Card.Title><Card.Description class="mt-0.5 text-xs">Saved in {currencyCode}. Reporting also keeps a USD snapshot.</Card.Description></Card.Header>
			<Card.Content class="space-y-4 p-4 sm:p-5">
				<div class="space-y-2 text-sm"><div class="flex justify-between gap-4"><span class="text-muted-foreground">Subtotal</span><span>{formatMoney(subtotal, currencyCode)}</span></div><div class="flex justify-between gap-4"><span class="text-muted-foreground">Tax</span><span>{formatMoney(taxTotal, currencyCode)}</span></div><div class="flex justify-between gap-4 border-t border-border pt-3 text-base font-semibold"><span>Total</span><span>{formatMoney(total, currencyCode)}</span></div></div>
				<label class="flex items-start gap-2 rounded-md border border-border bg-muted/30 p-3 text-xs leading-5"><input type="checkbox" name="send_now" bind:checked={sendNow} class="mt-0.5 accent-primary" /><span><span class="font-medium text-foreground">Mark as sent</span><br />Start tracking this invoice as awaiting payment.</span></label>
				<div class="flex flex-col gap-2 sm:flex-row xl:flex-col"><Button type="submit" class="w-full"><FileText class="size-3.5" /> {sendNow ? 'Create and mark sent' : 'Save draft'}</Button><Button type="button" variant="outline" href="/invoices" class="w-full">Cancel</Button></div>
			</Card.Content>
		</Card.Root>
	</form>
</div>
