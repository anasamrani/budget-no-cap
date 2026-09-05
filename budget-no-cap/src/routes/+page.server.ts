import { redirect } from '@sveltejs/kit';
import { getCurrentBalance, getMonthlySpend } from '$lib/server/balance';
import { getProfile } from '$lib/server/users';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) redirect(303, '/login');

	const profile = await getProfile(supabase);

	const now = new Date();
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
	const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

	const { chartLabels, chartValues, spentThisMonth, incomeThisMonth } = await getMonthlySpend(
		supabase,
		{ from: monthStart, to: nextMonthStart }
	);
	const balance = await getCurrentBalance(supabase);

	return {
		name: profile?.name ?? null,
		email: user.email ?? null,
		chartLabels,
		chartValues,
		spentThisMonth,
		incomeThisMonth,
		balance
	};
};
