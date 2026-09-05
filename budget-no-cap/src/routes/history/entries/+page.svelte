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

<div class="mx-auto w-full max-w-5xl px-4 py-10 sm:px-8">
	<div class="mb-10">
		<a
			href={resolve('/history')}
			class="mb-4 inline-block text-sm text-stone-500 transition-colors hover:text-stone-900 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:outline-none"
		>
			← History
		</a>
		<h1 class="text-3xl font-light tracking-tight text-stone-900">All entries</h1>
		<p class="mt-2 text-sm text-stone-500">View and search all your expenses.</p>
	</div>

	<!-- Filters -->
	<section
		class="mb-8 flex flex-col items-stretch gap-4 border-b border-stone-200 pb-8 sm:flex-row sm:items-end"
	>
		<div class="flex-1">
			<label
				for="search"
				class="mb-1.5 block text-[11px] tracking-[0.1em] text-stone-500 uppercase"
			>
				Search
			</label>
			<input
				id="search"
				type="search"
				bind:value={search}
				placeholder="Search entries..."
				class="h-10 w-full border-b border-stone-300 bg-transparent text-sm text-stone-900 outline-none focus:border-stone-900"
			/>
		</div>

		<div class="flex gap-4">
			<div class="flex flex-col">
				<label
					for="from"
					class="mb-1.5 block text-[11px] tracking-[0.1em] text-stone-500 uppercase"
				>
					From
				</label>
				<input
					id="from"
					type="date"
					bind:value={fromDate}
					class="h-10 border-b border-stone-300 bg-transparent text-sm text-stone-900 outline-none focus:border-stone-900"
				/>
			</div>

			<div class="flex flex-col">
				<label for="to" class="mb-1.5 block text-[11px] tracking-[0.1em] text-stone-500 uppercase">
					To
				</label>
				<input
					id="to"
					type="date"
					bind:value={toDate}
					class="h-10 border-b border-stone-300 bg-transparent text-sm text-stone-900 outline-none focus:border-stone-900"
				/>
			</div>
		</div>

		<button
			onclick={() => {
				search = '';
				fromDate = '';
				toDate = '';
			}}
			class="h-10 text-sm text-stone-500 underline underline-offset-4 transition-colors hover:text-stone-900 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:outline-none"
		>
			Clear filters
		</button>
	</section>

	<!-- Entries -->
	<section>
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-[11px] tracking-[0.18em] text-stone-500 uppercase">Entries</h2>
			<span class="text-[13px] text-stone-500 tabular-nums">{filteredEntries.length} entries</span>
		</div>

		{#if filteredEntries.length > 0}
			<div class="divide-y divide-stone-100 border-t border-stone-200">
				{#each filteredEntries as entry (entry.id)}
					<div class="flex flex-wrap items-center gap-3 py-4 sm:flex-nowrap sm:gap-6">
						<div class="w-auto shrink-0 text-[13px] text-stone-500 sm:w-[110px]">
							{new Date(entry.date + 'T00:00:00').toLocaleDateString('en-GB', {
								day: '2-digit',
								month: 'short',
								year: 'numeric'
							})}
						</div>

						<div class="order-3 flex-1 basis-full sm:order-none sm:basis-auto">
							<div class="text-sm font-medium text-stone-900">{entry.subcategory}</div>
							<div class="mt-1 text-xs text-stone-400">{entry.category}</div>
						</div>

						<div
							class={`ml-auto w-32 shrink-0 text-right text-sm font-medium tabular-nums sm:ml-0 ${
								entry.isIncoming ? 'text-teal-700' : 'text-stone-900'
							}`}
						>
							{entry.isIncoming ? '+' : '−'} CHF {entry.amount.toLocaleString('de-CH', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}
						</div>

						<form method="POST" action="?/deleteEntry" use:enhance>
							<input type="hidden" name="entry_id" value={entry.id} />
							<button
								type="submit"
								aria-label="Delete entry"
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:outline-none"
							>
								×
							</button>
						</form>
					</div>
				{/each}
			</div>
		{:else}
			<div class="border-t border-stone-200 py-15 text-center">
				<p class="m-0 text-[15px] font-medium text-stone-700">No entries found.</p>
				<span class="mt-1.5 block text-[13px] text-stone-400">
					Try changing your search or date filters.
				</span>
			</div>
		{/if}
	</section>
</div>
