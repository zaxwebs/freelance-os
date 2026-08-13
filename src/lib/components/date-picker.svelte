<script lang="ts">
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import X from '@lucide/svelte/icons/x';
	import { parseDate, type DateValue, DateFormatter, getLocalTimeZone } from '@internationalized/date';
	import { cn } from '$lib/utils';
	import Button from '$lib/components/ui/button/button.svelte';
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import * as Popover from '$lib/components/ui/popover';

	interface Props {
		name: string;
		value?: string | null;
		id?: string;
		placeholder?: string;
		class?: string;
		required?: boolean;
		disabled?: boolean;
	}

	let {
		name,
		value = $bindable<string | null>(),
		id,
		placeholder = 'Select date',
		class: className,
		required = false,
		disabled = false
	}: Props = $props();

	const formatter = new DateFormatter('en-US', { dateStyle: 'medium' });
	let open = $state(false);
	let selectedDate = $state<DateValue | undefined>(value ? parseDate(value) : undefined);

	$effect(() => {
		const nextDate = value ? parseDate(value) : undefined;
		if (nextDate?.toString() !== selectedDate?.toString()) selectedDate = nextDate;
	});

	function updateDate(date: DateValue | undefined) {
		selectedDate = date;
		value = date?.toString() ?? '';
		open = false;
	}

	function displayDate(date: DateValue | undefined) {
		return date ? formatter.format(date.toDate(getLocalTimeZone())) : placeholder;
	}
</script>

<div class="flex items-center gap-2">
	<Popover.Root bind:open>
		<Popover.Trigger {id} {disabled}>
			{#snippet child({ props })}
				<Button {...props} variant="outline" class={cn('w-full justify-start text-left font-normal', !selectedDate && 'text-muted-foreground', className)}>
					<CalendarIcon class="mr-2 size-3.5" />
					{displayDate(selectedDate)}
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="w-auto overflow-hidden p-0" align="start">
			<Calendar type="single" value={selectedDate} onValueChange={updateDate} captionLayout="dropdown" initialFocus disableDaysOutsideMonth />
			{#if !required}
				<div class="border-t border-border p-2"><Button variant="ghost" size="sm" class="w-full justify-center" type="button" onclick={() => updateDate(undefined)} disabled={!selectedDate}><X class="size-3.5" /> Clear date</Button></div>
			{/if}
		</Popover.Content>
	</Popover.Root>
	<input type="hidden" {name} value={selectedDate?.toString() ?? ''} {required} {disabled} />
</div>
