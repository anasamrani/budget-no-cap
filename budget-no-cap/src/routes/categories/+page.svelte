<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let editingCategoryId = $state<string | null>(null);
	let editingSubCategoryId = $state<string | null>(null);
	let selectedCategoryId = $state<string | null>(data.categories[0]?.category_id ?? null);

	const selectedCategory = $derived(
		data.categories.find((category) => category.category_id === selectedCategoryId)
	);

	function focusAndSelect(node: HTMLInputElement) {
		node.focus();
		node.select();
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

					<form
						method="POST"
						action="?/addCategory"
						use:enhance={() => {
							return async ({ result, update }) => {
								await update();
								if (result.type === 'success') {
									const created = data.categories.at(-1);
									if (created) {
										selectedCategoryId = created.category_id;
										editingCategoryId = created.category_id;
									}
								}
							};
						}}
					>
						<button
							type="submit"
							class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xl font-medium text-white transition hover:bg-blue-700"
						>
							+
						</button>
					</form>
				</div>

				<div class="space-y-2">
					{#each data.categories as category (category.category_id)}
						<div class="flex items-center gap-1">
							{#if editingCategoryId === category.category_id}
								<form
									method="POST"
									action="?/renameCategory"
									use:enhance
									class="flex-1"
								>
									<input type="hidden" name="category_id" value={category.category_id} />
									<input
										use:focusAndSelect
										name="c_name"
										value={category.c_name}
										onblur={(event) => {
											if (event.currentTarget.value.trim() !== '') {
												editingCategoryId = null;
												event.currentTarget.form?.requestSubmit();
											}
										}}
										onkeydown={(event) => {
											if (event.key === 'Enter' && event.currentTarget.value.trim() !== '') {
												editingCategoryId = null;
												event.currentTarget.form?.requestSubmit();
											}
										}}
										placeholder="Category name"
										class="w-full rounded-xl border border-blue-500 px-4 py-3 font-medium ring-2 ring-blue-100 outline-none"
									/>
								</form>
							{:else}
								<button
									onclick={() => (selectedCategoryId = category.category_id)}
									ondblclick={() => (editingCategoryId = category.category_id)}
									class={`flex-1 rounded-xl px-4 py-3 text-left font-medium transition ${
										selectedCategoryId === category.category_id
											? 'bg-blue-600 text-white'
											: 'text-gray-700 hover:bg-gray-100'
									}`}
								>
									{category.c_name}
								</button>
								<form method="POST" action="?/deleteCategory" use:enhance>
									<input type="hidden" name="category_id" value={category.category_id} />
									<button
										type="submit"
										aria-label="Delete category"
										class="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-600"
									>
										×
									</button>
								</form>
							{/if}
						</div>
					{/each}
				</div>
			</section>

			<!-- Sub-categories -->
			<section class="rounded-2xl bg-white p-6 shadow-sm">
				<div class="mb-5 flex items-center justify-between">
					<h2 class="text-xl font-bold text-gray-900">Sub-Categories</h2>

					{#if selectedCategory}
						<form
							method="POST"
							action="?/addSubCategory"
							use:enhance={() => {
								return async ({ result, update }) => {
									await update();
									if (result.type === 'success') {
										const created = selectedCategory?.subcategory.at(-1);
										if (created) editingSubCategoryId = created.subcategory_id;
									}
								};
							}}
						>
							<input type="hidden" name="category_id" value={selectedCategory.category_id} />
							<button
								type="submit"
								class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xl font-medium text-white transition hover:bg-blue-700"
							>
								+
							</button>
						</form>
					{/if}
				</div>

				{#if selectedCategory}
					<p class="mb-4 text-sm text-gray-500">
						{selectedCategory.c_name}
					</p>

					<div class="space-y-2">
						{#each selectedCategory.subcategory as subCategory (subCategory.subcategory_id)}
							<div class="flex items-center gap-1">
								{#if editingSubCategoryId === subCategory.subcategory_id}
									<form method="POST" action="?/renameSubCategory" use:enhance class="flex-1">
										<input
											type="hidden"
											name="subcategory_id"
											value={subCategory.subcategory_id}
										/>
										<input
											use:focusAndSelect
											name="sc_name"
											value={subCategory.sc_name}
											onblur={(event) => {
												if (event.currentTarget.value.trim() !== '') {
													editingSubCategoryId = null;
													event.currentTarget.form?.requestSubmit();
												}
											}}
											onkeydown={(event) => {
												if (event.key === 'Enter' && event.currentTarget.value.trim() !== '') {
													editingSubCategoryId = null;
													event.currentTarget.form?.requestSubmit();
												}
											}}
											placeholder="Sub-category name"
											class="w-full rounded-xl border border-blue-500 px-4 py-3 font-medium ring-2 ring-blue-100 outline-none"
										/>
									</form>
								{:else}
									<button
										ondblclick={() => (editingSubCategoryId = subCategory.subcategory_id)}
										class="flex-1 rounded-xl px-4 py-3 text-left text-gray-700 hover:bg-gray-100"
									>
										{subCategory.sc_name}
									</button>
									<form method="POST" action="?/deleteSubCategory" use:enhance>
										<input
											type="hidden"
											name="subcategory_id"
											value={subCategory.subcategory_id}
										/>
										<button
											type="submit"
											aria-label="Delete sub-category"
											class="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-600"
										>
											×
										</button>
									</form>
								{/if}
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-gray-400">Select a category</p>
				{/if}
			</section>
		</div>
	</main>
</div>
