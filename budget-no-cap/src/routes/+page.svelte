<script lang="ts">
	import { Pie } from 'svelte-chartjs';
	import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
	import type { PageData } from './$types';

	ChartJS.register(ArcElement, Tooltip, Legend);

	let { data }: { data: PageData } = $props();

	let showUserMenu = $state(false);

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

<div class="flex min-h-screen flex-col bg-gray-50">
<header class="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-6">
	<h1 class="text-3xl font-bold text-gray-900">
		Balance
	</h1>

	<div class="relative">
		<button
			onclick={() => (showUserMenu = !showUserMenu)}
			class="flex items-center gap-2 text-sm text-gray-600 transition hover:text-gray-900"
		>
			{data.email}

			<span class="text-xs">
				{showUserMenu ? '▲' : '▼'}
			</span>
		</button>

		{#if showUserMenu}
			<div
				class="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
			>
				<a
					href="/history"
					class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
				>
					History
				</a>

				<a
					href="/categories"
					class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
				>
					Categories
				</a>
			</div>
		{/if}
	</div>
</header>

	<!-- Main content -->
	<main class="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-8 py-10">
		<!-- Pie chart -->
		{#if data.chartLabels.length > 0}
			<div class="h-[350px] w-[350px] max-w-full">
				<Pie data={chartData} options={chartOptions} />
			</div>
		{:else}
			<p class="text-gray-400">No spending recorded this month.</p>
		{/if}

		<!-- Monthly spending -->
		<div class="mt-8 text-center">
			<p class="text-lg text-gray-500">Amount spent this month:</p>

			<h2 class="mt-2 text-4xl font-bold text-gray-900">
				CHF {data.spentThisMonth}
			</h2>
		</div>
	</main>

	<!-- Add entry -->
	<footer class="flex justify-center border-t border-gray-200 bg-white px-6 py-6">
		<button
			onclick={() => (window.location.href = '/add-entry')}
			class="rounded-xl bg-blue-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800"
		>
			Add entry
		</button>
	</footer>
</div>
