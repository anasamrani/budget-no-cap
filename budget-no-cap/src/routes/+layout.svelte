<script lang="ts">
	import './layout.css';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	let { children, data } = $props();
	let { session, supabase, user } = $derived(data);

	// Keeps the app in sync when Supabase's auth state changes underneath it
	// (login, logout, token refresh) — re-runs the +layout.ts/+layout.server.ts
	// loads so `data.session`/`data.user` update everywhere without a full reload.
	onMount(() => {
		const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => authListener.subscription.unsubscribe();
	});
</script>

<div class="mx-auto min-h-screen px-4 py-6">
	{#if user}
		<header class="mb-6 flex items-center justify-between border-b border-neutral-200 pb-4">
			<span class="text-sm text-neutral-600">Signed in as {user.email}</span>
			<form method="POST" action="/logout">
				<button type="submit" class="text-sm text-neutral-600 underline hover:text-neutral-900">
					Log out
				</button>
			</form>
		</header>
	{/if}

	{@render children()}
</div>
