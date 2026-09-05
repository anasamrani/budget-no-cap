<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	// Toggle between the login form and the signup form — no separate route
	// needed, since both actions live on this same +page.server.ts.
	let mode = $state<'login' | 'signup'>('login');

	// /auth/confirm redirects failed confirmation links here as ?error=...
	let confirmError = $derived(page.url.searchParams.get('error'));
</script>

<svelte:head>
	<title>{mode === 'login' ? 'Log in' : 'Sign up'} — budget-no-cap</title>
</svelte:head>

<div class="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-4 py-16">
	<p class="text-[11px] tracking-[0.18em] text-stone-500 uppercase">budget-no-cap</p>
	<h1 class="mt-2 mb-8 text-3xl font-light tracking-tight text-stone-900">
		{mode === 'login' ? 'Log in' : 'Create an account'}
	</h1>

	{#if form?.signedUp}
		<p class="border-t border-stone-200 pt-6 text-sm text-stone-700">
			Check <span class="font-medium text-stone-900">{form.email}</span> for a confirmation link before
			logging in.
		</p>
	{:else}
		<form
			method="POST"
			action={mode === 'login' ? '?/login' : '?/signup'}
			use:enhance
			class="flex flex-col gap-5"
		>
			{#if mode === 'signup'}
				<label class="flex flex-col gap-1.5 text-sm">
					<span class="text-[11px] font-medium tracking-[0.1em] text-stone-500 uppercase">
						Name
					</span>
					<input
						name="name"
						type="text"
						required
						value={form?.name ?? ''}
						class="border-b border-stone-300 bg-transparent py-2 text-stone-900 outline-none focus:border-stone-900"
					/>
				</label>
			{/if}

			<label class="flex flex-col gap-1.5 text-sm">
				<span class="text-[11px] font-medium tracking-[0.1em] text-stone-500 uppercase">
					Email
				</span>
				<input
					name="email"
					type="email"
					required
					value={form?.email ?? ''}
					class="border-b border-stone-300 bg-transparent py-2 text-stone-900 outline-none focus:border-stone-900"
				/>
			</label>

			<label class="flex flex-col gap-1.5 text-sm">
				<span class="text-[11px] font-medium tracking-[0.1em] text-stone-500 uppercase">
					Password
				</span>
				<input
					name="password"
					type="password"
					required
					minlength="6"
					class="border-b border-stone-300 bg-transparent py-2 text-stone-900 outline-none focus:border-stone-900"
				/>
			</label>

			{#if form?.error}
				<p class="text-sm text-red-700">{form.error}</p>
			{:else if confirmError}
				<p class="text-sm text-red-700">{confirmError}</p>
			{/if}

			<button
				type="submit"
				class="mt-3 rounded-md bg-stone-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700 focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 focus-visible:outline-none"
			>
				{mode === 'login' ? 'Log in' : 'Sign up'}
			</button>
		</form>

		<button
			type="button"
			onclick={() => (mode = mode === 'login' ? 'signup' : 'login')}
			class="mt-6 text-left text-sm text-stone-500 underline underline-offset-4 transition-colors hover:text-stone-900 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:outline-none"
		>
			{mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
		</button>
	{/if}
</div>
