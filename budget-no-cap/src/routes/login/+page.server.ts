import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

// Already signed in? nothing to do here.
export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (user) redirect(303, '/');
};

export const actions: Actions = {
	login: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '');
		const password = String(formData.get('password') ?? '');

		const { error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) {
			return fail(400, { email, error: error.message });
		}

		redirect(303, '/');
	},

	signup: async ({ request, url, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '');
		const password = String(formData.get('password') ?? '');
		const name = String(formData.get('name') ?? '');

		if (!name.trim()) {
			return fail(400, { email, name, error: 'Name is required.' });
		}

		// `data.name` here lands in raw_user_meta_data, which the
		// handle_new_user() trigger (step 1) reads to seed public.users.name.
		// `emailRedirectTo` only matters when email confirmation is switched back
		// on — without it the emailed link resolves against the project's Site
		// URL rather than our own /auth/confirm route.
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: { data: { name }, emailRedirectTo: `${url.origin}/auth/confirm` }
		});
		if (error) {
			return fail(400, { email, name, error: error.message });
		}

		// Confirmation is off in this project, so signUp() already returns a
		// live session — nothing left to confirm by email.
		if (data.session) {
			redirect(303, '/');
		}

		return { signedUp: true, email };
	}
};
