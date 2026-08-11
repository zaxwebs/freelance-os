<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Plus from '@lucide/svelte/icons/plus';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import type { ActionData } from './$types';
	import { supportedCurrencies } from '$lib/app/currency';

	let { form }: { form?: ActionData } = $props();
</script>

<svelte:head><title>New client - Freelance OS</title></svelte:head>

<div class="mx-auto max-w-2xl space-y-4">
	<div class="flex items-center gap-2 text-xs text-muted-foreground"><a href="/clients" class="inline-flex items-center gap-1.5 hover:text-foreground"><ArrowLeft class="size-3.5" /> Clients</a><span aria-hidden="true">/</span><span class="font-medium text-foreground">New client</span></div>
	<header><h1 class="text-xl font-semibold tracking-tight">New client</h1><p class="mt-1 text-sm text-muted-foreground">Keep contact details available when you need them.</p></header>
	<Card.Root class="bg-card py-0"><Card.Content class="p-4 sm:p-5"><form method="POST" action="?/createClient" class="space-y-4"><div class="space-y-1.5"><Label for="name">Name</Label><Input id="name" name="name" placeholder="Jordan Lee" autofocus required /></div><div class="space-y-1.5"><Label for="company">Company <span class="font-normal normal-case text-muted-foreground">optional</span></Label><Input id="company" name="company" placeholder="Acme Studio" /></div><div class="space-y-1.5"><Label for="email">Email <span class="font-normal normal-case text-muted-foreground">optional</span></Label><Input id="email" name="email" type="email" placeholder="hello@acme.com" /></div><div class="space-y-1.5"><Label for="billing-address">Billing address <span class="font-normal normal-case text-muted-foreground">optional</span></Label><Textarea id="billing-address" name="billing_address" rows={4} /><p class="text-xs text-muted-foreground">This address is copied onto new invoices for this client.</p></div><div class="grid gap-4 sm:grid-cols-2"><div class="space-y-1.5"><Label for="tax-id-label">Tax ID label <span class="font-normal normal-case text-muted-foreground">optional</span></Label><Input id="tax-id-label" name="tax_id_label" placeholder="VAT number" /></div><div class="space-y-1.5"><Label for="tax-id">Tax ID <span class="font-normal normal-case text-muted-foreground">optional</span></Label><Input id="tax-id" name="tax_id" placeholder="e.g. GB123456789" /></div></div><div class="space-y-1.5"><Label for="default-currency">Default billing currency</Label><select id="default-currency" name="default_currency_code" value="USD" class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20">{#each supportedCurrencies as currency (currency.code)}<option value={currency.code}>{currency.code} · {currency.name}</option>{/each}</select><p class="text-xs text-muted-foreground">Projects and invoices inherit this unless they override it.</p></div>{#if form?.message}<p class="text-sm text-destructive">{form.message}</p>{/if}<div class="flex justify-end gap-2 pt-2"><Button variant="outline" size="sm" href="/clients">Cancel</Button><Button size="sm" type="submit"><Plus class="size-3.5" /> Create client</Button></div></form></Card.Content></Card.Root>
</div>
