<script lang="ts">
	import { Pie } from 'svelte-chartjs';
	import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	ChartJS.register(ArcElement, Tooltip, Legend);

	let { data }: { data: PageData } = $props();

	// Darkest = largest category, so rank reads through weight rather than hue.
	const rampHex = ['#1c1917', '#44403c', '#78716c', '#a8a29e', '#d6d3d1', '#e7e5e4'];
	const rampClasses = [
		'bg-stone-900',
		'bg-stone-700',
		'bg-stone-500',
		'bg-stone-400',
		'bg-stone-300',
		'bg-stone-200'
	];

	const monthLabel = new Date()
		.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
		.toUpperCase();

	const total = $derived(data.chartValues.reduce((sum, value) => sum + value, 0));

	const ranked = $derived(
		data.chartLabels
			.map((label, i) => ({ label, value: data.chartValues[i] }))
			.sort((a, b) => b.value - a.value)
			.map((item, i) => ({
				...item,
				hex: rampHex[i % rampHex.length],
				swatch: rampClasses[i % rampClasses.length],
				percent: total > 0 ? Math.round((item.value / total) * 100) : 0
			}))
	);

	const colorByLabel = $derived(new Map(ranked.map((item) => [item.label, item.hex])));

	const chartData = $derived({
		labels: data.chartLabels,
		datasets: [
			{
				data: data.chartValues,
				backgroundColor: data.chartLabels.map((label) => colorByLabel.get(label) ?? rampHex[5]),
				borderWidth: 0
			}
		]
	});

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false }
		}
	};
</script>

<svelte:head>
	<title>Balance</title>
</svelte:head>

<div class="mx-auto w-full max-w-5xl px-4 py-10 sm:px-8">
	<!-- Balance -->
	<div class="mb-10">
		<p class="text-[11px] tracking-[0.18em] text-stone-500 uppercase">{monthLabel}</p>
		<h1
			class={`mt-2 text-7xl font-light tracking-tighter tabular-nums ${
				data.balance >= 0 ? 'text-stone-900' : 'text-red-700'
			}`}
		>
			{data.balance >= 0 ? '' : '−'}CHF {Math.abs(data.balance)}
		</h1>
		<p class="mt-1 text-sm text-stone-500">Balance</p>
	</div>

	<!-- Spent & income -->
	<div class="mb-10 flex flex-wrap gap-x-12 gap-y-6 border-y border-stone-200 py-6">
		<div>
			<p class="text-[11px] tracking-[0.18em] text-stone-500 uppercase">Spent this month</p>
			<p class="mt-1.5 text-2xl font-light text-stone-900 tabular-nums">
				CHF {data.spentThisMonth}
			</p>
		</div>

		<div>
			<p class="text-[11px] tracking-[0.18em] text-stone-500 uppercase">Income this month</p>
			<p class="mt-1.5 text-2xl font-light text-teal-700 tabular-nums">
				CHF {data.incomeThisMonth}
			</p>
		</div>

		<a
			href={resolve('/add-entry')}
			class="ml-auto flex items-center rounded-md bg-stone-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700 focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 focus-visible:outline-none"
		>
			Add entry
		</a>
	</div>

	<!-- Where it went -->
	<div>
		<p class="mb-6 text-[11px] tracking-[0.18em] text-stone-500 uppercase">Where it went</p>

		{#if data.chartLabels.length > 0}
			<div class="flex flex-col items-center gap-10 sm:flex-row sm:items-center sm:gap-14">
				<div class="h-[220px] w-[220px] shrink-0">
					<Pie data={chartData} options={chartOptions} />
				</div>

				<div class="w-full max-w-md">
					<div class="space-y-3">
						{#each ranked as item (item.label)}
							<div class="flex items-center gap-3 text-sm">
								<span class={`h-2.5 w-2.5 shrink-0 rounded-full ${item.swatch}`}></span>
								<span class="flex-1 truncate text-stone-700">{item.label}</span>
								<span class="text-stone-900 tabular-nums">{item.value.toFixed(2)}</span>
								<span class="w-9 text-right text-stone-500 tabular-nums">{item.percent}%</span>
							</div>
						{/each}
					</div>

					<div
						class="mt-4 flex items-center justify-between border-t border-stone-200 pt-4 text-sm"
					>
						<span class="font-medium text-stone-900">Total</span>
						<span class="font-medium text-stone-900 tabular-nums">{total.toFixed(2)}</span>
					</div>
				</div>
			</div>
		{:else}
			<div class="border-t border-stone-200 py-10 text-center text-sm text-stone-500">
				No spending recorded this month.
			</div>
		{/if}
	</div>
</div>
