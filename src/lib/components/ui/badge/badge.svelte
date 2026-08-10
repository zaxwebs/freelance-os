<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";

	export const badgeVariants = tv({
		base: "gap-1.5 rounded-full border px-2.5 py-1 text-[0.625rem] font-semibold tracking-[0.08em] uppercase transition-colors has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&>svg]:size-3! group/badge inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none",
		variants: {
			variant: {
				default: "border-transparent bg-foreground text-background [a]:hover:text-background/70",
				secondary: "border-transparent bg-secondary text-secondary-foreground [a]:hover:text-foreground",
				destructive: "border-destructive/20 bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:border-destructive/30 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:text-destructive/70",
				outline: "border-border bg-background text-foreground [a]:hover:text-foreground/70",
				ghost: "border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
				link: "border-transparent bg-transparent text-foreground underline-offset-4 hover:underline",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
</script>

<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAnchorAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		href,
		class: className,
		variant = "default",
		children,
		...restProps
	}: WithElementRef<HTMLAnchorAttributes> & {
		variant?: BadgeVariant;
	} = $props();
</script>

<svelte:element
	this={href ? "a" : "span"}
	bind:this={ref}
	data-slot="badge"
	{href}
	class={cn(badgeVariants({ variant }), className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
