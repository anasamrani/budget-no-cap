<script lang="ts">
	import { Pie } from 'svelte-chartjs';
	import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

	ChartJS.register(ArcElement, Tooltip, Legend);

	const userEmail = 'user@example.com';

	const chartData = {
		labels: ['Food', 'Transport', 'Entertainment', 'Other'],
		datasets: [
			{
				data: [450, 120, 200, 80],
				backgroundColor: ['#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'],
				borderWidth: 0
			}
		]
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: 'bottom' as const
			}
		}
	};

	const amountSpentThisMonth = 850;
</script>

<svelte:head>
	<title>Balance</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-gray-50">
	<!-- Header -->
	<header class="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-6">
		<!-- svelte-ignore a11y_missing_content -->
		<h1 class="text-3xl font-bold text-gray-900"></h1>
		<h1 class="text-3xl font-bold text-gray-900">Balance</h1>

		<div class="text-sm text-gray-500">
			{userEmail}
		</div>
	</header>

	<!-- Main content -->
	<main class="flex flex-1 flex-col items-center justify-center px-6 py-10">
		<!-- Pie chart -->
		<div class="h-[350px] w-[350px] max-w-full">
			<Pie data={chartData} options={chartOptions} />
		</div>

		<!-- Monthly spending -->
		<div class="mt-8 text-center">
			<p class="text-lg text-gray-500">Amount spent this month:</p>

			<h2 class="mt-2 text-4xl font-bold text-gray-900">
				CHF {amountSpentThisMonth}
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
