<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const hasSpending = $derived(data.months.some((month) => month.amount > 0));

	// Round the tallest bar up to a "nice" ceiling (1/2/2.5/5 x a power of ten)
	// so the y-axis never lands on an awkward number.
	const maxAmount = $derived(
		(() => {
			const highest = Math.max(0, ...data.months.map((month) => month.amount));
			if (highest <= 0) return 100;

			const magnitude = 10 ** Math.floor(Math.log10(highest));
			const steps = [1, 2, 2.5, 5, 10];
			const step = steps.find((s) => s * magnitude >= highest) ?? 10;
			return step * magnitude;
		})()
	);

	const formatTick = (value: number) =>
		value >= 1000 ? `${(value / 1000).toLocaleString('de-CH')}k` : `${value}`;

	const yAxisTicks = $derived(
		[4, 3, 2, 1, 0].map((fraction) => formatTick(Math.round((maxAmount * fraction) / 4)))
	);
</script>

<svelte:head>
	<title>History</title>
</svelte:head>

<div class="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8">
	<div class="mb-7">
		<h1 class="text-3xl font-bold text-gray-900">History</h1>
		<p class="mt-2 text-[15px] text-gray-500">See how your expenses have changed over time.</p>
	</div>

	<section class="w-full rounded-xl border border-gray-200 bg-white p-6">
		<div class="mb-8">
			<h2 class="text-lg font-semibold text-gray-900">Monthly expenses</h2>
			<p class="mt-1.5 text-sm text-gray-500">Your expenses over the last 6 months</p>
		</div>

		{#if hasSpending}
			<div class="flex h-[360px]">
				<div
					class="flex w-11 flex-col justify-between pr-2.5 pb-[30px] text-right text-xs text-gray-400"
				>
					{#each yAxisTicks as tick, i (i)}
						<span>{tick}</span>
					{/each}
				</div>

				<div class="relative flex-1">
					<div class="absolute inset-0 bottom-[30px] flex flex-col justify-between">
						<div></div>
						<div></div>
						<div></div>
						<div></div>
						<div class="border-t border-gray-100"></div>
					</div>

					<div
						class="absolute inset-0 flex items-stretch justify-around gap-2.5 px-1.5 sm:gap-6 sm:px-5"
					>
						{#each data.months as month (month.label)}
							<div class="flex max-w-[60px] flex-1 flex-col items-center sm:max-w-[90px]">
								<div class="flex w-full flex-1 items-end pb-[30px]">
									<div
										class="min-h-1 w-full cursor-pointer rounded-t-md bg-gray-900 transition-opacity hover:opacity-75"
										style={`height: ${(month.amount / maxAmount) * 100}%`}
										title={`CHF ${month.amount.toLocaleString()}`}
									></div>
								</div>

								<span class="flex h-[30px] items-center text-[13px] text-gray-500"
									>{month.label}</span
								>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{:else}
			<div class="flex h-[200px] items-center justify-center text-sm text-gray-500">
				No expenses recorded yet.
			</div>
		{/if}
	</section>

	<div class="mt-6 flex justify-center">
		<button
			onclick={() => goto(resolve('/history/entries'))}
			class="rounded-lg border border-gray-300 bg-white px-4.5 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
		>
			Show all entries
		</button>
	</div>
</div>
