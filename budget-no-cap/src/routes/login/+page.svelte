<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	// Toggle between the login form and the signup form — no separate route
	// needed, since both actions live on this same +page.server.ts.
	let mode = $state<'login' | 'signup'>('login');
</script>

<svelte:head>
	<title>{mode === 'login' ? 'Log in' : 'Sign up'} — budget-no-cap</title>
</svelte:head>

<div class="mx-auto mt-16 max-w-sm">
	<h1 class="mb-6 text-xl font-semibold">
		{mode === 'login' ? 'Log in' : 'Create an account'}
	</h1>

	{#if form?.signedUp}
		<p class="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">
			Check <strong>{form.email}</strong> for a confirmation link before logging in.
		</p>
	{:else}
		<form
			method="POST"
			action={mode === 'login' ? '?/login' : '?/signup'}
			use:enhance
			class="flex flex-col gap-3"
		>
			{#if mode === 'signup'}
				<label class="flex flex-col gap-1 text-sm">
					Name
					<input
						name="name"
						type="text"
						required
						value={form?.name ?? ''}
						class="rounded border border-neutral-300 px-3 py-2"
					/>
				</label>
			{/if}

			<label class="flex flex-col gap-1 text-sm">
				Email
				<input
					name="email"
					type="email"
					required
					value={form?.email ?? ''}
					class="rounded border border-neutral-300 px-3 py-2"
				/>
			</label>

			<label class="flex flex-col gap-1 text-sm">
				Password
				<input
					name="password"
					type="password"
					required
					minlength="6"
					class="rounded border border-neutral-300 px-3 py-2"
				/>
			</label>

			{#if form?.error}
				<p class="text-sm text-red-600">{form.error}</p>
			{/if}

			<button type="submit" class="mt-2 rounded bg-neutral-900 px-3 py-2 text-sm text-white">
				{mode === 'login' ? 'Log in' : 'Sign up'}
			</button>
		</form>

		<button
			type="button"
			onclick={() => (mode = mode === 'login' ? 'signup' : 'login')}
			class="mt-4 text-sm text-neutral-600 underline"
		>
			{mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
		</button>
	{/if}
</div>
