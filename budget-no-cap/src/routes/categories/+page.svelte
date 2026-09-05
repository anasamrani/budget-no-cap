<script lang="ts">
	let editingCategoryId = $state<number | null>(null);
	let editingSubCategoryIndex = $state<number | null>(null);
	let editingSubCategory = $state<string | null>(null);
	let categories = $state([
		{
			id: 1,
			name: 'Food',
			subCategories: ['Groceries', 'Restaurants', 'Takeaway']
		},
		{
			id: 2,
			name: 'Transport',
			subCategories: ['Fuel', 'Public Transport', 'Parking']
		},
		{
			id: 3,
			name: 'Entertainment',
			subCategories: ['Movies', 'Games', 'Subscriptions']
		},
		{
			id: 4,
			name: 'Shopping',
			subCategories: ['Clothes', 'Electronics']
		}
	]);

	let selectedCategoryId = $state(1);

	const selectedCategory = $derived(
		categories.find((category) => category.id === selectedCategoryId)
	);

	function addCategory() {
		const newId = categories.length + 1;

		categories.push({
			id: newId,
			name: '',
			subCategories: []
		});

		selectedCategoryId = newId;
		editingCategoryId = newId;
	}
	function addSubCategory() {
		const categoryIndex = categories.findIndex((category) => category.id === selectedCategoryId);

		if (categoryIndex === -1) return;

		categories[categoryIndex].subCategories.push('');

		editingSubCategoryIndex = categories[categoryIndex].subCategories.length - 1;
	}
</script>

<svelte:head>
	<title>Categories</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="border-b border-gray-200 bg-white px-8 py-6 text-center">
		<h1 class="text-3xl font-bold text-gray-900">Categories</h1>
	</header>

	<!-- Content -->
	<main class="mx-auto max-w-4xl px-6 py-10">
		<div class="grid grid-cols-2 gap-8">
			<!-- Categories -->
			<section class="rounded-2xl bg-white p-6 shadow-sm">
				<div class="mb-5 flex items-center justify-between">
					<h2 class="text-xl font-bold text-gray-900">Categories</h2>

					<button
						onclick={addCategory}
						class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xl font-medium text-white transition hover:bg-blue-700"
					>
						+
					</button>
				</div>

				<div class="space-y-2">
					{#each categories as category}
						{#if editingCategoryId === category.id}
							<input
								autofocus
								value={category.name}
								oninput={(event) => {
									category.name = event.currentTarget.value;
								}}
								onblur={() => {
									if (category.name.trim() !== '') {
										editingCategoryId = null;
									}
								}}
								onkeydown={(event) => {
									if (event.key === 'Enter' && category.name.trim() !== '') {
										editingCategoryId = null;
									}
								}}
								placeholder="Category name"
								class="w-full rounded-xl border border-blue-500 px-4 py-3 font-medium ring-2 ring-blue-100 outline-none"
							/>
						{:else}
							<button
								onclick={() => (selectedCategoryId = category.id)}
								class={`w-full rounded-xl px-4 py-3 text-left font-medium transition ${
									selectedCategoryId === category.id
										? 'bg-blue-600 text-white'
										: 'text-gray-700 hover:bg-gray-100'
								}`}
							>
								{category.name}
							</button>
						{/if}
					{/each}
				</div>
			</section>

			<!-- Sub-categories -->
			<section class="rounded-2xl bg-white p-6 shadow-sm">
				<div class="mb-5 flex items-center justify-between">
					<h2 class="text-xl font-bold text-gray-900">Sub-Categories</h2>

					<button
						onclick={addSubCategory}
						class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xl font-medium text-white transition hover:bg-blue-700"
					>
						+
					</button>
				</div>

				{#if selectedCategory}
					<p class="mb-4 text-sm text-gray-500">
						{selectedCategory.name}
					</p>

					<div class="space-y-2">
						{#each selectedCategory.subCategories as subCategory, index}
							{#if editingSubCategoryIndex === index}
								<input
									autofocus
									value={subCategory}
									oninput={(event) => {
										categories.find(
											(category) => category.id === selectedCategoryId
										)!.subCategories[index] = event.currentTarget.value;
									}}
									onblur={() => {
										if (subCategory.trim() !== '') {
											editingSubCategoryIndex = null;
										}
									}}
									onkeydown={(event) => {
										if (event.key === 'Enter' && subCategory.trim() !== '') {
											editingSubCategoryIndex = null;
										}
									}}
									placeholder="Sub-category name"
									class="w-full rounded-xl border border-blue-500 px-4 py-3 font-medium ring-2 ring-blue-100 outline-none"
								/>
							{:else}
								<div class="rounded-xl px-4 py-3 text-gray-700 hover:bg-gray-100">
									{subCategory}
								</div>
							{/if}
						{/each}
					</div>
				{:else}
					<p class="text-gray-400">Select a category</p>
				{/if}
			</section>
		</div>
	</main>
</div>
