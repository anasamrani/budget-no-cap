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

<div class="mx-auto w-full max-w-4xl px-4 py-10 sm:px-8">
	<h1 class="text-3xl font-light tracking-tight text-stone-900">Categories</h1>
	<p class="mt-2 mb-10 text-sm text-stone-500">
		Double-click a name to rename it. Sub-category priority runs P1 (highest) to P3 (lowest).
	</p>

	<div class="grid grid-cols-1 gap-10 sm:grid-cols-2">
		<!-- Categories -->
		<section>
			<div class="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
				<h2 class="text-[11px] tracking-[0.18em] text-stone-500 uppercase">Categories</h2>

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
						aria-label="Add category"
						class="flex h-7 w-7 items-center justify-center rounded-full text-lg leading-none text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:outline-none"
					>
						+
					</button>
				</form>
			</div>

			<div class="divide-y divide-stone-100">
				{#each data.categories as category (category.category_id)}
					<div class="flex items-center gap-1">
						{#if editingCategoryId === category.category_id}
							<form method="POST" action="?/renameCategory" use:enhance class="flex-1">
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
									class="w-full rounded-md px-3 py-3 font-medium text-stone-900 ring-2 ring-stone-900 outline-none"
								/>
							</form>
						{:else}
							<button
								onclick={() => (selectedCategoryId = category.category_id)}
								ondblclick={() => (editingCategoryId = category.category_id)}
								class={`flex-1 rounded-md px-3 py-3 text-left text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:outline-none ${
									selectedCategoryId === category.category_id
										? 'text-stone-900'
										: 'text-stone-500 hover:text-stone-900'
								}`}
							>
								{category.c_name}
							</button>
							<form method="POST" action="?/deleteCategory" use:enhance>
								<input type="hidden" name="category_id" value={category.category_id} />
								<button
									type="submit"
									aria-label="Delete category"
									class="flex h-10 w-10 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:outline-none"
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
		<section>
			<div class="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
				<h2 class="text-[11px] tracking-[0.18em] text-stone-500 uppercase">Sub-categories</h2>

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
							aria-label="Add sub-category"
							class="flex h-7 w-7 items-center justify-center rounded-full text-lg leading-none text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:outline-none"
						>
							+
						</button>
					</form>
				{/if}
			</div>

			{#if selectedCategory}
				<p class="mb-4 text-sm text-stone-500">{selectedCategory.c_name}</p>

				<div class="divide-y divide-stone-100">
					{#each selectedCategory.subcategory as subCategory (subCategory.subcategory_id)}
						<div class="flex items-center gap-1">
							{#if editingSubCategoryId === subCategory.subcategory_id}
								<form method="POST" action="?/renameSubCategory" use:enhance class="flex-1">
									<input type="hidden" name="subcategory_id" value={subCategory.subcategory_id} />
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
										class="w-full rounded-md px-3 py-3 font-medium text-stone-900 ring-2 ring-stone-900 outline-none"
									/>
								</form>
							{:else}
								<button
									ondblclick={() => (editingSubCategoryId = subCategory.subcategory_id)}
									class="flex-1 rounded-md px-3 py-3 text-left text-sm text-stone-700 transition-colors hover:text-stone-900 focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:outline-none"
								>
									{subCategory.sc_name}
								</button>
								<form method="POST" action="?/setSubCategoryPriority" use:enhance>
									<input type="hidden" name="subcategory_id" value={subCategory.subcategory_id} />
									<select
										name="priority"
										value={subCategory.priority ?? 2}
										onchange={(event) => event.currentTarget.form?.requestSubmit()}
										aria-label={`Priority for ${subCategory.sc_name}`}
										class="cursor-pointer rounded-md bg-white px-2 py-1.5 text-[11px] tracking-[0.08em] text-stone-500 tabular-nums ring-1 ring-stone-200 transition-colors hover:text-stone-900 focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:outline-none"
									>
										<option value={1}>P1</option>
										<option value={2}>P2</option>
										<option value={3}>P3</option>
									</select>
								</form>
								<form method="POST" action="?/deleteSubCategory" use:enhance>
									<input type="hidden" name="subcategory_id" value={subCategory.subcategory_id} />
									<button
										type="submit"
										aria-label="Delete sub-category"
										class="flex h-10 w-10 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:outline-none"
									>
										×
									</button>
								</form>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-stone-400">Select a category</p>
			{/if}
		</section>
	</div>
</div>
