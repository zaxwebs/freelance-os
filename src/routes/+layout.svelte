<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	let { data, children } = $props();
	let { supabase, claims } = $derived(data);

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (session?.expires_at !== claims?.exp) {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

	<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Freelance OS</title>
	<meta
		name="description"
		content="A calm task tracker for independent work across clients and projects."
	/>
</svelte:head>
{@render children()}


