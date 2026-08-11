<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ReceiptText from '@lucide/svelte/icons/receipt-text';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form?: ActionData } = $props();
	let clientId = $state(data.defaultClientId);
	let projectId = $state(data.defaultProjectId);
	let currencyCode = $state(data.baseCurrency);
	let amount = $state('');
	let exchangeRate = $state('');
	let projectsForClient = $derived(data.projects.filter((project) => !clientId || project.client_id === clientId));

	function handleClientChange() {
		if (projectId && !projectsForClient.some((project) => project.id === projectId)) projectId = '';
	}

	function handleCurrencyChange() {
		exchangeRate = currencyCode === data.baseCurrency ? '1' : '';
	}
</script>

<svelte:head><title>New expense - Freelance OS</title></svelte:head>

<div class="mx-auto max-w-3xl space-y-5">
	<div class="flex items-center gap-2 text-xs text-muted-foreground"><a href="/expenses" class="inline-flex items-center gap-1.5 hover:text-foreground"><ArrowLeft class="size-3.5" /> Expenses</a><span aria-hidden="true">/</span><span class="font-medium text-foreground">New expense</span></div>
	<header><h1 class="text-2xl font-semibold tracking-tight">Record expense</h1><p class="mt-1 text-sm text-muted-foreground">Capture the cost now so project profit and billable reimbursement stay accurate.</p></header>
	{#if form?.message}<p role="alert" class="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">{form.message}</p>{/if}

	<Card.Root class="gap-0 bg-card py-0"><Card.Header class="border-b border-border px-4 py-3 sm:px-5"><Card.Title class="text-base">Expense details</Card.Title><Card.Description class="mt-0.5 text-xs">Link the cost to a client or project when it should appear in profitability.</Card.Description></Card.Header><Card.Content class="p-4 sm:p-5"><form method="POST" action="?/createExpense" class="space-y-4">
		<div class="space-y-1.5"><Label for="description">Description</Label><Input id="description" name="description" maxlength={160} placeholder="Figma subscription" required /></div>
		<div class="grid gap-4 sm:grid-cols-2"><div class="space-y-1.5"><Label for="category">Category</Label><select id="category" name="category" class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"><option>Software</option><option>Equipment</option><option>Travel</option><option>Contractors</option><option>Office</option><option>Taxes</option><option>Other</option></select></div><div class="space-y-1.5"><Label for="expense-date">Date</Label><Input id="expense-date" name="expense_date" type="date" value={new Date().toISOString().slice(0, 10)} required /></div></div>
		<div class="grid gap-4 sm:grid-cols-[1fr_150px]"><div class="space-y-1.5"><Label for="amount">Amount</Label><Input id="amount" name="amount" type="number" min="0.01" step="0.01" bind:value={amount} placeholder="0.00" required /></div><div class="space-y-1.5"><Label for="currency">Currency</Label><select id="currency" name="currency_code" bind:value={currencyCode} onchange={handleCurrencyChange} class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20">{#each data.currencies as currency (currency.code)}<option value={currency.code}>{currency.code}</option>{/each}</select></div></div>
		{#if currencyCode !== data.baseCurrency}<div class="rounded-md border border-border bg-muted/30 p-3"><div class="space-y-1.5"><Label for="exchange-rate">Exchange rate</Label><Input id="exchange-rate" name="exchange_rate" type="number" min="0.000001" step="0.000001" bind:value={exchangeRate} /><p class="text-xs text-muted-foreground">1 {currencyCode} = {exchangeRate || '...'} {data.baseCurrency}</p></div></div>{:else}<input type="hidden" name="exchange_rate" value="1" />{/if}
		<div class="grid gap-4 sm:grid-cols-2"><div class="space-y-1.5"><Label for="client">Client <span class="font-normal text-muted-foreground">optional</span></Label><select id="client" name="client_id" bind:value={clientId} onchange={handleClientChange} class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"><option value="">No client</option>{#each data.clients as client (client.id)}<option value={client.id}>{client.name}{client.company ? ` - ${client.company}` : ''}</option>{/each}</select></div><div class="space-y-1.5"><Label for="project">Project <span class="font-normal text-muted-foreground">optional</span></Label><select id="project" name="project_id" bind:value={projectId} class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs focus:border-ring focus:ring-3 focus:ring-ring/20"><option value="">No project</option>{#each projectsForClient as project (project.id)}<option value={project.id}>{project.name}</option>{/each}</select></div></div>
		<label class="flex items-start gap-2 rounded-md border border-border bg-muted/30 p-3 text-xs leading-5"><input type="checkbox" name="billable" class="mt-0.5 accent-primary" /><span><span class="font-medium text-foreground">Billable to client</span><br />Keep this expense ready to include on a future invoice.</span></label>
		<div class="space-y-1.5"><Label for="notes">Notes <span class="font-normal text-muted-foreground">optional</span></Label><Textarea id="notes" name="notes" rows={4} placeholder="Receipt reference or context." /></div>
		<div class="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" href="/expenses">Cancel</Button><Button type="submit"><ReceiptText class="size-3.5" /> Save expense</Button></div>
	</form></Card.Content></Card.Root>
</div>
