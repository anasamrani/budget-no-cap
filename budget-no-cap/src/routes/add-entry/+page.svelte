<script lang="ts">
	import { enhance } from '$app/forms';
	import PriorityBadge from '$lib/components/PriorityBadge.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let selectedCategoryId = $state<string | null>(null);
	let selectedSubCategoryId = $state<string | null>(null);
	let amount = $state('');
	let type = $state<'in' | 'out'>('out');

	const availableSubCategories = $derived(
		data.categories.find((category) => category.category_id === selectedCategoryId)?.subcategory ??
			[]
	);
</script>

<svelte:head>
	<title>Add Entry</title>
</svelte:head>

<div class="mx-auto w-full max-w-2xl px-4 py-10 sm:px-8">
	<h1 class="mb-10 text-3xl font-light tracking-tight text-stone-900">Add entry</h1>

	<form method="POST" action="?/add" use:enhance>
		<input type="hidden" name="subcategory_id" value={selectedSubCategoryId ?? ''} />
		<input type="hidden" name="type" value={type} />

		<!-- Amount -->
		<div class="mb-10 border-b border-stone-200 pb-8">
			<label for="amount" class="text-[11px] tracking-[0.18em] text-stone-500 uppercase">
				Amount
			</label>
			<div class="mt-2 flex items-baseline gap-3">
				<span class="text-2xl font-light text-stone-400">CHF</span>
				<input
					id="amount"
					name="amount"
					type="number"
					min="0"
					step="0.01"
					bind:value={amount}
					placeholder="0.00"
					class="w-full border-0 border-b border-transparent bg-transparent text-5xl font-light tracking-tight text-stone-900 tabular-nums outline-none placeholder:text-stone-300 focus:border-stone-900"
				/>
			</div>
		</div>

		<!-- In / Out -->
		<div class="mb-10">
			<p class="mb-3 text-[11px] tracking-[0.18em] text-stone-500 uppercase">Type</p>

			<div class="grid grid-cols-2 gap-2 rounded-md bg-stone-100 p-1">
				<button
					type="button"
					onclick={() => (type = 'in')}
					class={`rounded py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:outline-none ${
						type === 'in'
							? 'bg-white text-teal-700 shadow-sm'
							: 'text-stone-500 hover:text-stone-900'
					}`}
				>
					In
				</button>

				<button
					type="button"
					onclick={() => (type = 'out')}
					class={`rounded py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:outline-none ${
						type === 'out'
							? 'bg-white text-stone-900 shadow-sm'
							: 'text-stone-500 hover:text-stone-900'
					}`}
				>
					Out
				</button>
			</div>
		</div>

		<!-- Category -->
		<div class="mb-10">
			<p class="mb-3 text-[11px] tracking-[0.18em] text-stone-500 uppercase">Category</p>

			<div class="flex flex-wrap gap-2">
				{#each data.categories as category (category.category_id)}
					<button
						type="button"
						onclick={() => {
							selectedCategoryId = category.category_id;
							selectedSubCategoryId = null;
						}}
						class={`rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:outline-none ${
							selectedCategoryId === category.category_id
								? 'bg-stone-900 text-white'
								: 'text-stone-700 ring-1 ring-stone-200 hover:bg-stone-100'
						}`}
					>
						{category.c_name}
					</button>
				{/each}
			</div>
		</div>

		<!-- Sub-category -->
		<div class="mb-10">
			<p class="mb-3 text-[11px] tracking-[0.18em] text-stone-500 uppercase">Sub-category</p>

			<div class="flex flex-wrap gap-2">
				{#if selectedCategoryId}
					{#each availableSubCategories as subCategory (subCategory.subcategory_id)}
						<button
							type="button"
							onclick={() => (selectedSubCategoryId = subCategory.subcategory_id)}
							class={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:outline-none ${
								selectedSubCategoryId === subCategory.subcategory_id
									? 'bg-stone-900 text-white'
									: 'text-stone-700 ring-1 ring-stone-200 hover:bg-stone-100'
							}`}
						>
							{subCategory.sc_name}
							<PriorityBadge
								priority={subCategory.priority ?? 2}
								onDark={selectedSubCategoryId === subCategory.subcategory_id}
							/>
						</button>
					{/each}
				{:else}
					<p class="text-sm text-stone-400">Select a category first</p>
				{/if}
			</div>
		</div>

		{#if form?.error}
			<p class="mb-6 text-sm text-red-700">{form.error}</p>
		{/if}

		<button
			type="submit"
			class="w-full rounded-md bg-stone-900 py-3.5 text-sm font-medium text-white transition-colors hover:bg-stone-700 focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 focus-visible:outline-none"
		>
			Add entry
		</button>
	</form>
</div>
