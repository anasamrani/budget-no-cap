<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>budget-no-cap</title>
</svelte:head>

<h1 class="text-xl font-semibold">Welcome{data.name ? `, ${data.name}` : ''}</h1>
<p class="mt-2 text-sm text-neutral-600">Signed in as {data.email}.</p>
<p class="mt-4 text-sm text-neutral-500">The budget viewer lands here next.</p>
