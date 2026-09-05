import { redirect } from '@sveltejs/kit';
import { getMonthlyTotals } from '$lib/server/balance';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) redirect(303, '/login');

	return { months: await getMonthlyTotals(supabase, 6) };
};
