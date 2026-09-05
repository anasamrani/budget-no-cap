<script lang="ts">
	let selectedCategory = $state('');
	let selectedSubCategory = $state('');
	let amount = $state('');
	let type = $state('out');

	const categories = ['Food', 'Transport', 'Entertainment', 'Shopping'];

	const subCategories = {
		Food: ['Groceries', 'Restaurants', 'Takeaway'],
		Transport: ['Fuel', 'Public Transport', 'Parking'],
		Entertainment: ['Movies', 'Games', 'Subscriptions'],
		Shopping: ['Clothes', 'Electronics', 'Other']
	};

	const availableSubCategories = $derived(
		selectedCategory ? subCategories[selectedCategory as keyof typeof subCategories] : []
	);

	function addEntry() {
		console.log({
			category: selectedCategory,
			subCategory: selectedSubCategory,
			amount,
			type
		});
	}
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
		<!-- Category -->
		<div class="mb-8">
			<h2 class="mb-4 text-lg font-semibold text-gray-800">Category:</h2>

			<div class="flex flex-wrap gap-3">
				{#each categories as category}
					<button
						onclick={() => {
							selectedCategory = category;
							selectedSubCategory = '';
						}}
						class={`rounded-xl px-5 py-3 font-medium transition ${
							selectedCategory === category
								? 'bg-blue-600 text-white'
								: 'bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-100'
						}`}
					>
						{category}
					</button>
				{/each}
			</div>
		</div>

		<!-- Sub-category -->
		<div class="mb-8">
			<h2 class="mb-4 text-lg font-semibold text-gray-800">Sub-Category:</h2>

			<div class="flex flex-wrap gap-3">
				{#if selectedCategory}
					{#each availableSubCategories as subCategory}
						<button
							onclick={() => (selectedSubCategory = subCategory)}
							class={`rounded-xl px-5 py-3 font-medium transition ${
								selectedSubCategory === subCategory
									? 'bg-blue-600 text-white'
									: 'bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-100'
							}`}
						>
							{subCategory}
						</button>
					{/each}
				{:else}
					<p class="text-sm text-gray-400">Select a category first</p>
				{/if}
			</div>
		</div>

		<!-- Amount -->
		<div class="mb-8">
			<label for="amount" class="mb-3 block text-lg font-semibold text-gray-800"> Amount: </label>

			<div class="relative">
				<span class="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500"> CHF </span>

				<input
					id="amount"
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

		<!-- Add -->
		<div class="flex justify-center">
			<button
				onclick={addEntry}
				class="rounded-xl bg-blue-600 px-10 py-3 text-lg font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800"
			>
				Add
			</button>
		</div>
	</main>
</div>
