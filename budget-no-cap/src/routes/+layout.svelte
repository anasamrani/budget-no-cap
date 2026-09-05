<script lang="ts">
	import './layout.css';
	import { invalidate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	let { children, data } = $props();
	let { session, supabase, user, displayName } = $derived(data);

	const navLinks = [
		{ href: resolve('/'), label: 'Overview' },
		{ href: resolve('/history'), label: 'History' },
		{ href: resolve('/categories'), label: 'Categories' }
	];

	const isActive = (href: string) =>
		href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);

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

<div class="min-h-screen bg-stone-50">
	{#if user}
		<header class="border-b border-stone-200 bg-stone-50">
			<div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-8">
				<nav class="flex items-center gap-6">
					{#each navLinks as link (link.href)}
						<a
							href={link.href}
							class={`text-sm font-medium transition-colors focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:outline-none ${
								isActive(link.href)
									? 'text-stone-900 underline decoration-1 underline-offset-8'
									: 'text-stone-500 hover:text-stone-900'
							}`}
						>
							{link.label}
						</a>
					{/each}
				</nav>

				<div class="flex items-center gap-4">
					<span class="hidden text-sm text-stone-500 sm:inline">{displayName ?? user.email}</span>
					<form method="POST" action="/logout">
						<button
							type="submit"
							aria-label="Log out"
							title="Log out"
							class="flex h-8 w-8 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:outline-none"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.75"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="h-[18px] w-[18px]"
							>
								<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
								<path d="M16 17l5-5-5-5" />
								<path d="M21 12H9" />
							</svg>
						</button>
					</form>
				</div>
			</div>
		</header>
	{/if}

	{@render children()}
</div>
