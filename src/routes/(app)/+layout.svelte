<script lang="ts">
	import AppShell from '$lib/components/app-shell.svelte';
	let { data, children } = $props();
</script>

<AppShell email={data.user.email}>{@render children()}</AppShell>


