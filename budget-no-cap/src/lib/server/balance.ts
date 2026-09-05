import type { SupabaseClient } from '@supabase/supabase-js';

export async function addBalanceEntry(
	supabase: SupabaseClient,
	params: { subcategoryId: string; amount: number; isIncoming: boolean; accountId: string }
): Promise<{ error: string } | undefined> {
	const { error } = await supabase.from('balance').insert({
		ammount: params.amount,
		in_out: params.isIncoming,
		subcategory_id: params.subcategoryId,
		account_id: params.accountId
	});
	if (error) return { error: error.message };
}

export interface MonthlySpend {
	chartLabels: string[];
	chartValues: number[];
	spentThisMonth: number;
}

export async function getMonthlySpend(
	supabase: SupabaseClient,
	range: { from: string; to: string }
): Promise<MonthlySpend> {
	const { data: entries } = await supabase
		.from('balance')
		.select('ammount, in_out, subcategory(category(c_name))')
		.gte('time', range.from)
		.lt('time', range.to);

	// supabase-js embeds a to-one relation as an object, but returns an array
	// if it can't infer cardinality from the FK — normalize both shapes.
	const first = <T>(value: T | T[] | null | undefined): T | undefined =>
		Array.isArray(value) ? value[0] : (value ?? undefined);

	const spendByCategory = new Map<string, number>();
	for (const entry of entries ?? []) {
		if (entry.in_out) continue; // only spending ("out") feeds the chart
		const category = first(first(entry.subcategory)?.category);
		const cName = category?.c_name ?? 'Other';
		spendByCategory.set(cName, (spendByCategory.get(cName) ?? 0) + entry.ammount);
	}

	const chartLabels = [...spendByCategory.keys()];
	const chartValues = [...spendByCategory.values()];
	const spentThisMonth = chartValues.reduce((sum, value) => sum + value, 0);

	return { chartLabels, chartValues, spentThisMonth };
}
