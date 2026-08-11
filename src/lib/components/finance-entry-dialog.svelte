<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import { formatAmountWithCode, parseMoney } from '$lib/app/currency';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';

	interface Option {
		id: string;
		name: string;
	}

	interface CurrencyOption {
		code: string;
		name: string;
		minorUnits: number;
	}

	interface Props {
		action: string;
		baseCurrency: string;
		currencies: readonly CurrencyOption[];
		clients: Option[];
		projects: Option[];
	}

	let { action, baseCurrency, currencies, clients, projects }: Props = $props();
	let open = $state(false);
	let type = $state('income');
	let amount = $state('');
	let currencyCode = $state('');
	let selectedCurrency = $derived(currencyCode || baseCurrency);
	let exchangeRate = $state('');
	let transactionDate = $state(new Date().toISOString().slice(0, 10));
	let basePreview = $derived.by(() => {
		const parsedAmount = parseMoney(amount, selectedCurrency);
		const rate = selectedCurrency === baseCurrency ? 1 : Number(exchangeRate);
		if (!parsedAmount || !Number.isFinite(rate) || rate <= 0) return null;
		return formatAmountWithCode(parsedAmount * rate, baseCurrency);
	});

	const handleCurrencyChange = (event: Event) => {
		currencyCode = (event.currentTarget as HTMLSelectElement).value;
		exchangeRate = currencyCode === baseCurrency ? '1' : '';
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button {...props} size="sm" class="gap-1.5"><Plus class="size-3.5" /> Add entry</Button>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content class="max-w-lg gap-0 overflow-hidden bg-card p-0">
		<Dialog.Header class="border-b border-border px-4 py-3">
			<Dialog.Title class="text-base">Add finance entry</Dialog.Title>
			<Dialog.Description class="text-xs">Record income received or an expense. The base value is saved with the entry.</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action={action} class="space-y-4 p-4 sm:p-5">
			<div class="grid gap-4 sm:grid-cols-2">
				<div class="space-y-1.5">
					<Label for="finance-type">Type</Label>
					<select id="finance-type" name="type" bind:value={type} class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20">
						<option value="income">Income received</option>
						<option value="expense">Expense</option>
					</select>
				</div>
				<div class="space-y-1.5">
					<Label for="finance-date">Date</Label>
					<Input id="finance-date" name="transaction_date" type="date" bind:value={transactionDate} required />
				</div>
			</div>

			<div class="space-y-1.5">
				<Label for="finance-description">Description</Label>
				<Input id="finance-description" name="description" placeholder="Website deposit from Cedar and Co" maxlength={160} required />
			</div>

			<div class="grid gap-4 sm:grid-cols-[1fr_150px]">
				<div class="space-y-1.5">
					<Label for="finance-amount">Amount</Label>
					<Input id="finance-amount" name="amount" type="number" min="0.01" step="0.01" bind:value={amount} placeholder="0.00" required />
				</div>
				<div class="space-y-1.5">
					<Label for="finance-currency">Currency</Label>
		<select id="finance-currency" name="currency_code" value={selectedCurrency} onchange={handleCurrencyChange} class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20">
						{#each currencies as currency (currency.code)}<option value={currency.code}>{currency.code} · {currency.name}</option>{/each}
					</select>
				</div>
			</div>

			<div class="rounded-md border border-border bg-muted/30 p-3">
				<div class="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
					<div class="space-y-1.5">
						<Label for="finance-rate">Exchange rate</Label>
						<Input id="finance-rate" name="exchange_rate" type="number" min="0.000001" step="0.000001" bind:value={exchangeRate} disabled={selectedCurrency === baseCurrency} aria-describedby="finance-rate-help" />
					</div>
					<p id="finance-rate-help" class="text-xs text-muted-foreground">1 {selectedCurrency} = {selectedCurrency === baseCurrency ? '1' : exchangeRate || '—'} {baseCurrency}</p>
				</div>
				{#if basePreview}<p class="mt-2 text-xs text-muted-foreground">Saved base value: <span class="font-medium text-foreground">{basePreview}</span></p>{/if}
			</div>

			<div class="grid gap-4 sm:grid-cols-2">
				<div class="space-y-1.5">
					<Label for="finance-client">Client <span class="font-normal text-muted-foreground">optional</span></Label>
					<select id="finance-client" name="client_id" class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"><option value="">No client</option>{#each clients as client (client.id)}<option value={client.id}>{client.name}</option>{/each}</select>
				</div>
				<div class="space-y-1.5">
					<Label for="finance-project">Project <span class="font-normal text-muted-foreground">optional</span></Label>
					<select id="finance-project" name="project_id" class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"><option value="">No project</option>{#each projects as project (project.id)}<option value={project.id}>{project.name}</option>{/each}</select>
				</div>
			</div>

			<div class="flex items-center justify-end gap-2 pt-1">
				<Button type="button" variant="outline" size="sm" onclick={() => (open = false)}>Cancel</Button>
				<Button type="submit" size="sm">Save entry</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
