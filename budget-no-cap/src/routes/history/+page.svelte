<script lang="ts">
	import { goto } from '$app/navigation';

	const expenses = [
		{ month: 'Apr', amount: 2840 },
		{ month: 'May', amount: 3210 },
		{ month: 'Jun', amount: 2675 },
		{ month: 'Jul', amount: 3540 },
		{ month: 'Aug', amount: 2985 },
		{ month: 'Sep', amount: 3315 }
	];

	const maxExpense = 4000;
</script>

<svelte:head>
	<title>History</title>
</svelte:head>

<div class="history-page">
	<div class="page-header">
		<div>
			<h1>History</h1>
			<p>See how your expenses have changed over time.</p>
		</div>
	</div>

	<section class="chart-card">
		<div class="card-header">
			<div>
				<h2>Monthly expenses</h2>
				<p>Your expenses over the last 6 months</p>
			</div>
		</div>

		<div class="chart">
			<div class="y-axis">
				<span>4k</span>
				<span>3k</span>
				<span>2k</span>
				<span>1k</span>
				<span>0</span>
			</div>

			<div class="chart-area">
				<div class="grid-lines">
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
				</div>

				<div class="bars">
					{#each expenses as expense}
						<div class="bar-column">
							<div class="bar-wrapper">
								<div
									class="bar"
									style={`height: ${(expense.amount / maxExpense) * 100}%`}
									title={`CHF ${expense.amount.toLocaleString()}`}
								></div>
							</div>

							<span class="month">{expense.month}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<div class="entries-button-container">
		<button onclick={() => goto('/history/entries')}>
			Show all entries
		</button>
	</div>
</div>

<style>
	.history-page {
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		padding: 32px;
		box-sizing: border-box;
	}

	.page-header {
		margin-bottom: 28px;
	}

	h1 {
		margin: 0;
		font-size: 30px;
		font-weight: 700;
		color: #111827;
	}

	.page-header p {
		margin: 8px 0 0;
		color: #6b7280;
		font-size: 15px;
	}

	.chart-card {
		width: 100%;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 24px;
		box-sizing: border-box;
	}

	.card-header {
		margin-bottom: 32px;
	}

	h2 {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
		color: #111827;
	}

	.card-header p {
		margin: 6px 0 0;
		color: #6b7280;
		font-size: 14px;
	}

	.chart {
		display: flex;
		height: 360px;
	}

	.y-axis {
		width: 45px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding-bottom: 30px;
		box-sizing: border-box;
		color: #9ca3af;
		font-size: 12px;
		text-align: right;
		padding-right: 10px;
	}

	.chart-area {
		position: relative;
		flex: 1;
		height: 100%;
	}

	.grid-lines {
		position: absolute;
		inset: 0 0 30px 0;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.grid-lines div {
		width: 100%;
		border-top: 1px solid #f0f0f0;
	}

	.bars {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: stretch;
		justify-content: space-around;
		gap: 24px;
		padding: 0 20px;
		box-sizing: border-box;
	}

	.bar-column {
		flex: 1;
		max-width: 90px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.bar-wrapper {
		width: 100%;
		flex: 1;
		display: flex;
		align-items: flex-end;
		padding-bottom: 30px;
	}

	.bar {
		width: 100%;
		min-height: 4px;
		background: #111827;
		border-radius: 6px 6px 0 0;
		cursor: pointer;
		transition: opacity 0.2s ease;
	}

	.bar:hover {
		opacity: 0.75;
	}

	.month {
		height: 30px;
		display: flex;
		align-items: center;
		color: #6b7280;
		font-size: 13px;
	}

	.entries-button-container {
		display: flex;
		justify-content: center;
		margin-top: 24px;
	}

	.entries-button-container button {
		padding: 10px 18px;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		background: white;
		color: #111827;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.entries-button-container button:hover {
		background: #f9fafb;
	}

	@media (max-width: 700px) {
		.history-page {
			padding: 20px 16px;
		}

		.chart-card {
			padding: 18px;
		}

		.bars {
			gap: 10px;
			padding: 0 5px;
		}

		.bar-column {
			max-width: 60px;
		}
	}
</style>