<script lang="ts">
	import { Pie } from 'svelte-chartjs';
	import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
	import type { PageData } from './$types';

	ChartJS.register(ArcElement, Tooltip, Legend);

	let { data }: { data: PageData } = $props();

	const palette = ['#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#ec4899'];

	const chartData = $derived({
		labels: data.chartLabels,
		datasets: [
			{
				data: data.chartValues,
				backgroundColor: data.chartLabels.map((_, i) => palette[i % palette.length]),
				borderWidth: 0
			}
		]
	});

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: 'bottom' as const
			}
		}
	};
</script>

<svelte:head>
	<title>Balance</title>
</svelte:head>

<div class="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8">
	<div class="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
		<!-- Pie chart -->
		<div class="flex flex-col items-center">
			{#if data.chartLabels.length > 0}
				<div class="h-[280px] w-[280px] max-w-full">
					<Pie data={chartData} options={chartOptions} />
				</div>
			{:else}
				<div class="flex h-[280px] w-[280px] items-center justify-center text-center text-gray-400">
					No spending recorded this month.
				</div>
			{/if}
		</div>

		<div class="flex flex-col items-center gap-6 lg:pt-6">
			<!-- Monthly spending -->
			<div class="text-center">
				<p class="text-sm text-gray-500">Amount spent this month</p>

				<h2 class="mt-1 text-3xl font-bold text-gray-900">
					CHF {data.spentThisMonth}
				</h2>
			</div>

			<!-- Income & balance -->
			<div class="grid w-full max-w-md grid-cols-2 gap-4">
				<div class="rounded-xl border border-gray-200 bg-white p-4 text-center">
					<p class="text-sm text-gray-500">Income this month</p>
					<p class="mt-1 text-2xl font-semibold text-green-600">
						CHF {data.incomeThisMonth}
					</p>
				</div>

				<div class="rounded-xl border border-gray-200 bg-white p-4 text-center">
					<p class="text-sm text-gray-500">Balance</p>
					<p
						class="mt-1 text-2xl font-semibold {data.balance >= 0
							? 'text-green-600'
							: 'text-red-600'}"
					>
						{data.balance >= 0 ? '+' : '-'} CHF {Math.abs(data.balance)}
					</p>
				</div>
			</div>

			<!-- Add entry -->
			<button
				onclick={() => (window.location.href = '/add-entry')}
				class="mt-2 rounded-xl bg-blue-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800"
			>
				Add entry
			</button>
		</div>
	</div>
</div>
