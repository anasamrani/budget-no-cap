import { redirect } from '@sveltejs/kit';
import { getEntries } from '$lib/server/balance';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) redirect(303, '/login');

	return { entries: await getEntries(supabase) };
};
