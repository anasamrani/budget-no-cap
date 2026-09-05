<script lang="ts">
	type Entry = {
		id: number;
		date: string;
		description: string;
		category: string;
		amount: number;
	};

	const entries: Entry[] = [
		{
			id: 1,
			date: '2026-09-05',
			description: 'Grocery shopping',
			category: 'Food',
			amount: 84.5
		},
		{
			id: 2,
			date: '2026-09-04',
			description: 'Train ticket',
			category: 'Transport',
			amount: 32.0
		},
		{
			id: 3,
			date: '2026-09-03',
			description: 'Restaurant',
			category: 'Food',
			amount: 67.8
		},
		{
			id: 4,
			date: '2026-09-01',
			description: 'Netflix',
			category: 'Entertainment',
			amount: 19.9
		},
		{
			id: 5,
			date: '2026-08-28',
			description: 'Gas',
			category: 'Transport',
			amount: 72.4
		},
		{
			id: 6,
			date: '2026-08-25',
			description: 'New shoes',
			category: 'Shopping',
			amount: 129.0
		},
		{
			id: 7,
			date: '2026-08-20',
			description: 'Supermarket',
			category: 'Food',
			amount: 93.25
		},
		{
			id: 8,
			date: '2026-08-15',
			description: 'Electricity bill',
			category: 'Bills',
			amount: 145.0
		},
		{
			id: 9,
			date: '2026-08-10',
			description: 'Cinema',
			category: 'Entertainment',
			amount: 28.0
		},
		{
			id: 10,
			date: '2026-08-03',
			description: 'Coffee',
			category: 'Food',
			amount: 5.5
		}
	];

	let search = $state('');
	let fromDate = $state('');
	let toDate = $state('');

	const filteredEntries = $derived(
		entries.filter((entry) => {
			const matchesSearch =
				search.trim() === '' ||
				entry.description.toLowerCase().includes(search.toLowerCase()) ||
				entry.category.toLowerCase().includes(search.toLowerCase());

			const matchesFromDate = fromDate === '' || entry.date >= fromDate;

			const matchesToDate = toDate === '' || entry.date <= toDate;

			return matchesSearch && matchesFromDate && matchesToDate;
		})
	);
</script>

<svelte:head>
	<title>All Entries</title>
</svelte:head>

<div class="entries-page">
	<div class="page-header">
		<div>
			<a href="/history" class="back-link">← History</a>
			<h1>All entries</h1>
			<p>View and search all your expenses.</p>
		</div>
	</div>

	<!-- Filters -->
	<section class="filters">
		<div class="search-container">
			<label for="search">Search</label>
			<input id="search" type="search" bind:value={search} placeholder="Search entries..." />
		</div>

		<div class="date-container">
			<div>
				<label for="from">From</label>
				<input id="from" type="date" bind:value={fromDate} />
			</div>

			<div>
				<label for="to">To</label>
				<input id="to" type="date" bind:value={toDate} />
			</div>
		</div>

		<button
			class="clear-button"
			onclick={() => {
				search = '';
				fromDate = '';
				toDate = '';
			}}
		>
			Clear filters
		</button>
	</section>

	<!-- Entries -->
	<section class="entries-card">
		<div class="entries-header">
			<h2>Entries</h2>
			<span>{filteredEntries.length} entries</span>
		</div>

		{#if filteredEntries.length > 0}
			<div class="entries-list">
				{#each filteredEntries as entry}
					<div class="entry">
						<div class="entry-date">
							{new Date(entry.date + 'T00:00:00').toLocaleDateString('en-GB', {
								day: '2-digit',
								month: 'short',
								year: 'numeric'
							})}
						</div>

						<div class="entry-info">
							<div class="entry-description">{entry.description}</div>
							<div class="entry-category">{entry.category}</div>
						</div>

						<div class="entry-amount">
							CHF {entry.amount.toLocaleString('de-CH', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<p>No entries found.</p>
				<span>Try changing your search or date filters.</span>
			</div>
		{/if}
	</section>
</div>

<style>
	.entries-page {
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		padding: 32px;
		box-sizing: border-box;
	}

	.page-header {
		margin-bottom: 28px;
	}

	.back-link {
		display: inline-block;
		margin-bottom: 16px;
		color: #6b7280;
		font-size: 14px;
		text-decoration: none;
	}

	.back-link:hover {
		color: #111827;
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

	.filters {
		display: flex;
		align-items: flex-end;
		gap: 16px;
		margin-bottom: 24px;
		padding: 20px;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
	}

	.search-container {
		flex: 1;
	}

	.date-container {
		display: flex;
		gap: 12px;
	}

	.date-container > div {
		display: flex;
		flex-direction: column;
	}

	label {
		display: block;
		margin-bottom: 6px;
		font-size: 13px;
		font-weight: 500;
		color: #374151;
	}

	input {
		height: 40px;
		padding: 0 12px;
		box-sizing: border-box;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		background: white;
		color: #111827;
		font-size: 14px;
		outline: none;
	}

	input:focus {
		border-color: #6b7280;
		box-shadow: 0 0 0 2px #f3f4f6;
	}

	.search-container input {
		width: 100%;
	}

	.clear-button {
		height: 40px;
		padding: 0 14px;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		background: white;
		color: #374151;
		font-size: 14px;
		cursor: pointer;
	}

	.clear-button:hover {
		background: #f9fafb;
	}

	.entries-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		overflow: hidden;
	}

	.entries-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 24px;
		border-bottom: 1px solid #e5e7eb;
	}

	.entries-header h2 {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
		color: #111827;
	}

	.entries-header span {
		color: #6b7280;
		font-size: 13px;
	}

	.entry {
		display: flex;
		align-items: center;
		gap: 24px;
		padding: 18px 24px;
		border-bottom: 1px solid #f3f4f6;
	}

	.entry:last-child {
		border-bottom: none;
	}

	.entry-date {
		width: 110px;
		flex-shrink: 0;
		color: #6b7280;
		font-size: 13px;
	}

	.entry-info {
		flex: 1;
	}

	.entry-description {
		color: #111827;
		font-size: 14px;
		font-weight: 500;
	}

	.entry-category {
		margin-top: 4px;
		color: #9ca3af;
		font-size: 12px;
	}

	.entry-amount {
		font-size: 14px;
		font-weight: 600;
		color: #111827;
	}

	.empty-state {
		padding: 60px 20px;
		text-align: center;
	}

	.empty-state p {
		margin: 0;
		color: #374151;
		font-size: 15px;
		font-weight: 500;
	}

	.empty-state span {
		display: block;
		margin-top: 6px;
		color: #9ca3af;
		font-size: 13px;
	}

	@media (max-width: 800px) {
		.entries-page {
			padding: 20px 16px;
		}

		.filters {
			flex-direction: column;
			align-items: stretch;
		}

		.date-container {
			width: 100%;
		}

		.date-container > div {
			flex: 1;
		}

		.entry {
			gap: 12px;
		}

		.entry-date {
			width: 90px;
		}
	}

	@media (max-width: 550px) {
		.entry {
			flex-wrap: wrap;
		}

		.entry-date {
			width: auto;
		}

		.entry-amount {
			margin-left: auto;
		}

		.entry-info {
			order: 3;
			flex-basis: 100%;
		}
	}
</style>
