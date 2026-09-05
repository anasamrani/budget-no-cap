import { fail, redirect } from '@sveltejs/kit';
import { deleteBalanceEntry, getEntries } from '$lib/server/balance';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) redirect(303, '/login');

	return { entries: await getEntries(supabase) };
};

export const actions: Actions = {
	deleteEntry: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const entryId = String(formData.get('entry_id') ?? '');

		const error = await deleteBalanceEntry(supabase, entryId);
		if (error) return fail(400, error);
	}
};
