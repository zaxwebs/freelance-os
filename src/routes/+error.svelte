<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Button from '$lib/components/ui/button/button.svelte';

	let { error } = $props();
</script>

<svelte:head>
	<title>Something went wrong - Freelance OS</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-muted/20 px-6 py-12">
	<div class="max-w-lg text-center">
		<p class="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">Freelance OS</p>
		<h1 class="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">That page took a wrong turn.</h1>
		<p class="mt-4 leading-7 text-muted-foreground">{error?.message ?? 'Something unexpected happened. Try returning to your workspace.'}</p>
		<div class="mt-8 flex justify-center gap-3">
			<Button href="/overview" class="gap-2"><ArrowLeft class="size-4" /> Back to workspace</Button>
			<Button href="/" variant="outline">Sign-in</Button>
		</div>
	</div>
</main>


