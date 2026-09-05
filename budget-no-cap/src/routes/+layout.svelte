<script lang="ts">
	import './layout.css';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	let { children, data } = $props();
	let { session, supabase, user } = $derived(data);

	let showUserMenu = $state(false);

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

<div class="min-h-screen bg-gray-50">
	{#if user}
		<header class="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
			<a href="/" class="text-lg font-bold text-gray-900">Balance</a>

			<div class="relative">
				<button
					onclick={() => (showUserMenu = !showUserMenu)}
					class="flex items-center gap-2 text-sm text-gray-600 transition hover:text-gray-900"
				>
					{user.email}
					<span class="text-xs">{showUserMenu ? '▲' : '▼'}</span>
				</button>

				{#if showUserMenu}
					<div
						class="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
					>
						<a href="/history" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100">
							History
						</a>
						<a href="/categories" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100">
							Categories
						</a>
						<form method="POST" action="/logout">
							<button
								type="submit"
								class="block w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100"
							>
								Log out
							</button>
						</form>
					</div>
				{/if}
			</div>
		</header>
	{/if}

	{@render children()}
</div>
