<script lang="ts">
	// Read-only display of a sub-category's priority (1 = highest .. 3 = lowest).
	// The editable control lives on /categories; everywhere else just shows this.
	let { priority, onDark = false }: { priority: number; onDark?: boolean } = $props();

	const labels: Record<number, string> = {
		1: 'Priority 1 (highest)',
		2: 'Priority 2',
		3: 'Priority 3 (lowest)'
	};

	const tones: Record<number, string> = {
		1: 'bg-amber-50 text-amber-800 ring-amber-200',
		2: 'bg-stone-100 text-stone-600 ring-stone-200',
		3: 'bg-stone-50 text-stone-400 ring-stone-200'
	};

	const tone = $derived(
		onDark ? 'bg-white/15 text-white ring-white/25' : (tones[priority] ?? tones[2])
	);
</script>

<span
	title={labels[priority] ?? `Priority ${priority}`}
	class={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium tracking-[0.08em] tabular-nums ring-1 ring-inset ${tone}`}
>
	P{priority}
</span>
