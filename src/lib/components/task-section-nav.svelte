<script lang="ts">
	type TaskSection = 'tasks' | 'kanban';

	interface Props {
		active: TaskSection;
	}

	let { active }: Props = $props();

	const items: Array<{ id: TaskSection; label: string; href: string }> = [
		{ id: 'tasks', label: 'Tasks', href: '/tasks' },
		{ id: 'kanban', label: 'Kanban', href: '/tasks/kanban' }
	];
</script>

<nav aria-label="Task views" class="flex items-center gap-1 overflow-x-auto">
	{#each items as item (item.id)}
		<a
			href={item.href}
			aria-current={active === item.id ? 'page' : undefined}
			class={`border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${active === item.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'}`}
		>
			{item.label}
		</a>
	{/each}
</nav>
