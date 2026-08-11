<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Plus from '@lucide/svelte/icons/plus';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import type { ActionData, PageData } from './$types';
	import { supportedCurrencies } from '$lib/app/currency';

	let { data, form }: { data: PageData; form?: ActionData } = $props();
</script>

<svelte:head><title>New project - Freelance OS</title></svelte:head>

<div class="mx-auto max-w-2xl space-y-4">
	<div class="flex items-center gap-2 text-xs text-muted-foreground"><a href="/projects" class="inline-flex items-center gap-1.5 hover:text-foreground"><ArrowLeft class="size-3.5" /> Projects</a><span aria-hidden="true">/</span><span class="font-medium text-foreground">New project</span></div>
	<header><h1 class="text-xl font-semibold tracking-tight">New project</h1><p class="mt-1 text-sm text-muted-foreground">Keep the client, context, and next actions together.</p></header>
	<Card.Root class="bg-card py-0"><Card.Content class="p-4 sm:p-5"><form method="POST" action="?/createProject" class="space-y-4"><div class="space-y-1.5"><Label for="name">Project name</Label><Input id="name" name="name" placeholder="Brand refresh" autofocus required /></div><div class="space-y-1.5"><Label for="client_id">Client <span class="font-normal normal-case text-muted-foreground">optional</span></Label><select id="client_id" name="client_id" class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"><option value="">No client yet</option>{#each data.clients as client (client.id)}<option value={client.id}>{client.name}{client.company ? ` - ${client.company}` : ''}</option>{/each}</select>{#if data.clients.length === 0}<p class="text-xs text-muted-foreground">No clients yet. <a href="/clients/new" class="underline">Add one first.</a></p>{/if}</div><div class="space-y-1.5"><Label for="billing-currency">Billing currency override</Label><select id="billing-currency" name="billing_currency_code" class="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"><option value="">Inherit from client</option>{#each supportedCurrencies as currency (currency.code)}<option value={currency.code}>{currency.code} · {currency.name}</option>{/each}</select><p class="text-xs text-muted-foreground">Leave this blank to use the client’s default.</p></div><div class="space-y-1.5"><Label for="description">Description <span class="font-normal normal-case text-muted-foreground">optional</span></Label><Textarea id="description" name="description" rows={4} placeholder="What are you helping this client move forward?" /></div>{#if form?.message}<p class="text-sm text-destructive">{form.message}</p>{/if}<div class="flex justify-end gap-2 pt-2"><Button variant="outline" size="sm" href="/projects">Cancel</Button><Button size="sm" type="submit"><Plus class="size-3.5" /> Create project</Button></div></form></Card.Content></Card.Root>
</div>
