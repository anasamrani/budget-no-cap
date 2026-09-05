import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) redirect(303, '/login');

	const { data: profile } = await supabase.from('users').select('name').single();

	const now = new Date();
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
	const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

	const { data: entries } = await supabase
		.from('balance')
		.select('ammount, in_out, subcategory(category(c_name))')
		.gte('time', monthStart)
		.lt('time', nextMonthStart);

	// supabase-js embeds a to-one relation as an object, but returns an array
	// if it can't infer cardinality from the FK — normalize both shapes.
	const first = <T>(value: T | T[] | null | undefined): T | undefined =>
		Array.isArray(value) ? value[0] : (value ?? undefined);

	const spendByCategory = new Map<string, number>();
	for (const entry of entries ?? []) {
		if (entry.in_out) continue; // only spending ("out") feeds the chart
		const category = first(first(entry.subcategory)?.category);
		spendByCategory.set(
			category?.c_name ?? 'Other',
			(spendByCategory.get(category?.c_name ?? 'Other') ?? 0) + entry.ammount
		);
	}

	const chartLabels = [...spendByCategory.keys()];
	const chartValues = [...spendByCategory.values()];
	const spentThisMonth = chartValues.reduce((sum, value) => sum + value, 0);

	return {
		name: profile?.name ?? null,
		email: user.email ?? null,
		chartLabels,
		chartValues,
		spentThisMonth
	};
};
