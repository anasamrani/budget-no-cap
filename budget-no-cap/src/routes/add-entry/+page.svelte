<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let selectedCategoryId = $state<string | null>(null);
	let selectedSubCategoryId = $state<string | null>(null);
	let amount = $state('');
	let type = $state<'in' | 'out'>('out');

	const availableSubCategories = $derived(
		data.categories.find((category) => category.category_id === selectedCategoryId)
			?.subcategory ?? []
	);
</script>

<svelte:head>
	<title>Add Entry</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="border-b border-gray-200 bg-white px-8 py-6 text-center">
		<h1 class="text-3xl font-bold text-gray-900">Add Entry</h1>
	</header>

	<!-- Form -->
	<main class="mx-auto max-w-2xl px-6 py-10">
		<form method="POST" action="?/add" use:enhance>
			<input type="hidden" name="subcategory_id" value={selectedSubCategoryId ?? ''} />
			<input type="hidden" name="type" value={type} />

			<!-- Category -->
			<div class="mb-8">
				<h2 class="mb-4 text-lg font-semibold text-gray-800">Category:</h2>

				<div class="flex flex-wrap gap-3">
					{#each data.categories as category (category.category_id)}
						<button
							type="button"
							onclick={() => {
								selectedCategoryId = category.category_id;
								selectedSubCategoryId = null;
							}}
							class={`rounded-xl px-5 py-3 font-medium transition ${
								selectedCategoryId === category.category_id
									? 'bg-blue-600 text-white'
									: 'bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-100'
							}`}
						>
							{category.c_name}
						</button>
					{/each}
				</div>
			</div>

			<!-- Sub-category -->
			<div class="mb-8">
				<h2 class="mb-4 text-lg font-semibold text-gray-800">Sub-Category:</h2>

				<div class="flex flex-wrap gap-3">
					{#if selectedCategoryId}
						{#each availableSubCategories as subCategory (subCategory.subcategory_id)}
							<button
								type="button"
								onclick={() => (selectedSubCategoryId = subCategory.subcategory_id)}
								class={`rounded-xl px-5 py-3 font-medium transition ${
									selectedSubCategoryId === subCategory.subcategory_id
										? 'bg-blue-600 text-white'
										: 'bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-100'
								}`}
							>
								{subCategory.sc_name}
							</button>
						{/each}
					{:else}
						<p class="text-sm text-gray-400">Select a category first</p>
					{/if}
				</div>
			</div>

			<!-- Amount -->
			<div class="mb-8">
				<label for="amount" class="mb-3 block text-lg font-semibold text-gray-800">
					Amount:
				</label>

				<div class="relative">
					<span class="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500"> CHF </span>

					<input
						id="amount"
						name="amount"
						type="number"
						min="0"
						bind:value={amount}
						placeholder="0.00"
						class="w-full rounded-xl border border-gray-200 bg-white py-3 pr-4 pl-14 text-lg transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
					/>
				</div>
			</div>

			<!-- In / Out -->
			<div class="mb-10">
				<h2 class="mb-4 text-lg font-semibold text-gray-800">Type:</h2>

				<div class="grid grid-cols-2 gap-3">
					<button
						type="button"
						onclick={() => (type = 'in')}
						class={`rounded-xl py-3 font-semibold transition ${
							type === 'in'
								? 'bg-green-600 text-white'
								: 'bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-100'
						}`}
					>
						In
					</button>

					<button
						type="button"
						onclick={() => (type = 'out')}
						class={`rounded-xl py-3 font-semibold transition ${
							type === 'out'
								? 'bg-red-600 text-white'
								: 'bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-100'
						}`}
					>
						Out
					</button>
				</div>
			</div>

			{#if form?.error}
				<p class="mb-6 text-center text-sm text-red-600">{form.error}</p>
			{/if}

			<!-- Add -->
			<div class="flex justify-center">
				<button
					type="submit"
					class="rounded-xl bg-blue-600 px-10 py-3 text-lg font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800"
				>
					Add
				</button>
			</div>
		</form>
	</main>
</div>
