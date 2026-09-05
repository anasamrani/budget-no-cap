<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let search = $state('');
	let fromDate = $state('');
	let toDate = $state('');

	const filteredEntries = $derived(
		data.entries.filter((entry) => {
			const matchesSearch =
				search.trim() === '' ||
				entry.subcategory.toLowerCase().includes(search.toLowerCase()) ||
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

<div class="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8">
	<div class="mb-7">
		<a
			href={resolve('/history')}
			class="mb-4 inline-block text-sm text-gray-500 hover:text-gray-900"
		>
			← History
		</a>
		<h1 class="text-3xl font-bold text-gray-900">All entries</h1>
		<p class="mt-2 text-[15px] text-gray-500">View and search all your expenses.</p>
	</div>

	<!-- Filters -->
	<section
		class="mb-6 flex flex-col items-stretch gap-4 rounded-xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-end"
	>
		<div class="flex-1">
			<label for="search" class="mb-1.5 block text-[13px] font-medium text-gray-700">Search</label>
			<input
				id="search"
				type="search"
				bind:value={search}
				placeholder="Search entries..."
				class="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
			/>
		</div>

		<div class="flex gap-3">
			<div class="flex flex-col">
				<label for="from" class="mb-1.5 block text-[13px] font-medium text-gray-700">From</label>
				<input
					id="from"
					type="date"
					bind:value={fromDate}
					class="h-10 rounded-lg border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
				/>
			</div>

			<div class="flex flex-col">
				<label for="to" class="mb-1.5 block text-[13px] font-medium text-gray-700">To</label>
				<input
					id="to"
					type="date"
					bind:value={toDate}
					class="h-10 rounded-lg border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
				/>
			</div>
		</div>

		<button
			onclick={() => {
				search = '';
				fromDate = '';
				toDate = '';
			}}
			class="h-10 rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 transition hover:bg-gray-50"
		>
			Clear filters
		</button>
	</section>

	<!-- Entries -->
	<section class="rounded-xl border border-gray-200 bg-white">
		<div class="flex items-center justify-between border-b border-gray-200 px-6 py-5">
			<h2 class="text-lg font-semibold text-gray-900">Entries</h2>
			<span class="text-[13px] text-gray-500">{filteredEntries.length} entries</span>
		</div>

		{#if filteredEntries.length > 0}
			<div>
				{#each filteredEntries as entry (entry.id)}
					<div
						class="flex flex-wrap items-center gap-3 border-b border-gray-100 px-6 py-4 last:border-b-0 sm:flex-nowrap sm:gap-6"
					>
						<div class="w-auto shrink-0 text-[13px] text-gray-500 sm:w-[110px]">
							{new Date(entry.date + 'T00:00:00').toLocaleDateString('en-GB', {
								day: '2-digit',
								month: 'short',
								year: 'numeric'
							})}
						</div>

						<div class="order-3 flex-1 basis-full sm:order-none sm:basis-auto">
							<div class="text-sm font-medium text-gray-900">{entry.subcategory}</div>
							<div class="mt-1 text-xs text-gray-400">{entry.category}</div>
						</div>

						<div
							class={`ml-auto text-sm font-semibold sm:ml-0 ${entry.isIncoming ? 'text-green-600' : 'text-gray-900'}`}
						>
							{entry.isIncoming ? '+' : '-'} CHF {entry.amount.toLocaleString('de-CH', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}
						</div>

						<form method="POST" action="?/deleteEntry" use:enhance>
							<input type="hidden" name="entry_id" value={entry.id} />
							<button
								type="submit"
								aria-label="Delete entry"
								class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-600"
							>
								×
							</button>
						</form>
					</div>
				{/each}
			</div>
		{:else}
			<div class="px-5 py-15 text-center">
				<p class="m-0 text-[15px] font-medium text-gray-700">No entries found.</p>
				<span class="mt-1.5 block text-[13px] text-gray-400">
					Try changing your search or date filters.
				</span>
			</div>
		{/if}
	</section>
</div>
