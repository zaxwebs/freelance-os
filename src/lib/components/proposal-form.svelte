<script lang="ts">
	import FileText from '@lucide/svelte/icons/file-text';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import { formatMoney } from '$lib/app/currency';

	export type ProposalLineItem = { description: string; quantity: string; unitPrice: string; taxRate: string };

	type ClientOption = { id: string; name: string; company?: string | null; default_currency_code: string };
	type CurrencyOption = { code: string; name: string };
	type InitialValues = {
		clientId?: string;
		currencyCode?: string;
		title?: string;
		overview?: string;
		issueDate?: string;
		validUntil?: string;
		scope?: string;
		timeline?: string;
		paymentTerms?: string;
		notes?: string;
		terms?: string;
		items?: ProposalLineItem[];
	};

	interface Props {
		clients: readonly ClientOption[];
		currencies: readonly CurrencyOption[];
		action: string;
		cancelHref: string;
		submitLabel: string;
		formMessage?: string | null;
		showSendToggle?: boolean;
		initial?: InitialValues;
	}

	let {
		clients,
		currencies,
		action,
		cancelHref,
		submitLabel,
		formMessage = null,
		showSendToggle = false,
		initial = {}
	}: Props = $props();

	let clientId = $state(initial.clientId ?? '');
	let currencyCode = $state(initial.currencyCode ?? clients.find((client) => client.id === clientId)?.default_currency_code ?? 'USD');
	let title = $state(initial.title ?? '');
	let overview = $state(initial.overview ?? '');
	let issueDate = $state(initial.issueDate ?? new Date().toISOString().slice(0, 10));
	let validUntil = $state(initial.validUntil ?? '');
	let scope = $state(initial.scope ?? '');
	let timeline = $state(initial.timeline ?? '');
	let paymentTerms = $state(initial.paymentTerms ?? '');
	let notes = $state(initial.notes ?? '');
	let terms = $state(initial.terms ?? '');
	let sendNow = $state(false);
	let items = $state<ProposalLineItem[]>(initial.items?.length ? initial.items : [{ description: '', quantity: '1', unitPrice: '', taxRate: '0' }]);
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
		currencyCode = clients.find((client) => client.id === clientId)?.default_currency_code ?? 'USD';
	}
</script>

{#if formMessage}<p role="alert" class="mb-4 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">{formMessage}</p>{/if}

<form method="POST" action={action} class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
	<input type="hidden" name="line_items" value={JSON.stringify(items)} />
	<input type="hidden" name="currency_code" value={currencyCode} />
	<Card.Root class="gap-0 bg-card py-0">
		<Card.Header class="border-b border-border px-4 py-3 sm:px-5"><Card.Title class="text-base">Proposal details</Card.Title><Card.Description class="mt-0.5 text-xs">Keep the offer clear, specific, and easy to approve.</Card.Description></Card.Header>
		<Card.Content class="space-y-4 p-4 sm:p-5">
			<div>
				<div class="space-y-1.5"><Label for="client">Client</Label><select id="client" name="client_id" bind:value={clientId} onchange={handleClientChange} required class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"><option value="">Choose a client</option>{#each clients as client (client.id)}<option value={client.id}>{client.name}{client.company ? ` - ${client.company}` : ''}</option>{/each}</select>{#if clients.length === 0}<p class="text-xs text-muted-foreground">Create a client before starting a proposal.</p>{/if}</div>
			</div>
			<div class="space-y-1.5"><Label for="title">Proposal title</Label><Input id="title" name="title" bind:value={title} placeholder="Brand strategy and website refresh" required /></div>
			<div class="grid gap-4 sm:grid-cols-3"><div class="space-y-1.5"><Label for="issue-date">Issue date</Label><Input id="issue-date" name="issue_date" type="date" bind:value={issueDate} required /></div><div class="space-y-1.5"><Label for="valid-until">Valid until <span class="font-normal text-muted-foreground">optional</span></Label><Input id="valid-until" name="valid_until" type="date" bind:value={validUntil} /></div><div class="space-y-1.5"><Label for="currency">Currency</Label><select id="currency" bind:value={currencyCode} class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20">{#each currencies as currency (currency.code)}<option value={currency.code}>{currency.code} · {currency.name}</option>{/each}</select></div></div>
			<div class="space-y-1.5"><Label for="overview">Overview <span class="font-normal text-muted-foreground">optional</span></Label><Textarea id="overview" name="overview" bind:value={overview} rows={4} placeholder="Summarize the opportunity, approach, and outcome for the client." /></div>
			<div class="space-y-1.5"><Label for="scope">Scope and deliverables <span class="font-normal text-muted-foreground">optional</span></Label><Textarea id="scope" name="scope" bind:value={scope} rows={5} placeholder="Describe the work, deliverables, and what success looks like." /></div>
			<div class="grid gap-4 sm:grid-cols-2"><div class="space-y-1.5"><Label for="timeline">Timeline <span class="font-normal text-muted-foreground">optional</span></Label><Textarea id="timeline" name="timeline" bind:value={timeline} rows={3} placeholder="4 weeks from project kickoff." /></div><div class="space-y-1.5"><Label for="payment-terms">Payment terms <span class="font-normal text-muted-foreground">optional</span></Label><Textarea id="payment-terms" name="payment_terms" bind:value={paymentTerms} rows={3} placeholder="50% to start, 50% on delivery." /></div></div>

			<div class="rounded-md border border-border">
				<div class="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-2"><div><p class="text-sm font-medium">Pricing</p><p class="text-xs text-muted-foreground">Use one line per deliverable or milestone.</p></div><Button type="button" variant="outline" size="sm" onclick={addLine}><Plus class="size-3.5" /> Add line</Button></div>
				<div class="divide-y divide-border">
					{#each items as item, index (index)}
						<div class="grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_82px_112px_82px_32px] sm:items-end">
							<div class="space-y-1.5"><Label for={`line-description-${index}`}>Description</Label><Input id={`line-description-${index}`} bind:value={item.description} placeholder="Strategy workshop" /></div>
							<div class="space-y-1.5"><Label for={`line-quantity-${index}`}>Qty</Label><Input id={`line-quantity-${index}`} bind:value={item.quantity} type="number" min="0.01" step="0.01" /></div>
							<div class="space-y-1.5"><Label for={`line-rate-${index}`}>Rate</Label><Input id={`line-rate-${index}`} bind:value={item.unitPrice} type="number" min="0" step="0.01" placeholder="0.00" /></div>
							<div class="space-y-1.5"><Label for={`line-tax-${index}`}>Tax %</Label><Input id={`line-tax-${index}`} bind:value={item.taxRate} type="number" min="0" max="100" step="0.01" /></div>
							<Button type="button" variant="ghost" size="icon-sm" aria-label="Remove proposal line" onclick={() => removeLine(index)} disabled={items.length === 1}><Trash2 class="size-3.5" /></Button>
						</div>
					{/each}
				</div>
			</div>

			<div class="grid gap-4 sm:grid-cols-2"><div class="space-y-1.5"><Label for="notes">Notes <span class="font-normal text-muted-foreground">optional</span></Label><Textarea id="notes" name="notes" bind:value={notes} rows={4} placeholder="A short note for the client." /></div><div class="space-y-1.5"><Label for="terms">Terms <span class="font-normal text-muted-foreground">optional</span></Label><Textarea id="terms" name="terms" bind:value={terms} rows={4} placeholder="Assumptions, exclusions, or next steps." /></div></div>
		</Card.Content>
	</Card.Root>

	<Card.Root class="h-fit gap-0 bg-card py-0 xl:sticky xl:top-20">
		<Card.Header class="border-b border-border px-4 py-3"><Card.Title class="text-base">Review</Card.Title><Card.Description class="mt-0.5 text-xs">Saved in {currencyCode}.</Card.Description></Card.Header>
		<Card.Content class="space-y-4 p-4 sm:p-5">
			<div class="space-y-2 text-sm"><div class="flex justify-between gap-4"><span class="text-muted-foreground">Subtotal</span><span>{formatMoney(subtotal, currencyCode)}</span></div><div class="flex justify-between gap-4"><span class="text-muted-foreground">Tax</span><span>{formatMoney(taxTotal, currencyCode)}</span></div><div class="flex justify-between gap-4 border-t border-border pt-3 text-base font-semibold"><span>Total</span><span>{formatMoney(total, currencyCode)}</span></div></div>
			{#if showSendToggle}<label class="flex items-start gap-2 rounded-md border border-border bg-muted/30 p-3 text-xs leading-5"><input type="checkbox" name="send_now" bind:checked={sendNow} class="mt-0.5 accent-primary" /><span><span class="font-medium text-foreground">Mark as sent</span><br />Start tracking this proposal as awaiting a response.</span></label>{/if}
			<div class="flex flex-col gap-2 sm:flex-row xl:flex-col"><Button type="submit" class="w-full"><FileText class="size-3.5" /> {showSendToggle && sendNow ? 'Create and mark sent' : submitLabel}</Button><Button type="button" variant="outline" href={cancelHref} class="w-full">Cancel</Button></div>
		</Card.Content>
	</Card.Root>
</form>
