import type { SupabaseClient } from '@supabase/supabase-js';
import type { BalanceEntry, MonthlyTotal } from '$lib/types/balance';

// supabase-js embeds a to-one relation as an object, but returns an array
// if it can't infer cardinality from the FK — normalize both shapes.
const first = <T>(value: T | T[] | null | undefined): T | undefined =>
	Array.isArray(value) ? value[0] : (value ?? undefined);

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

export async function deleteBalanceEntry(
	supabase: SupabaseClient,
	entryId: string
): Promise<{ error: string } | undefined> {
	const { error } = await supabase.from('balance').delete().eq('balance_id', entryId);
	if (error) return { error: error.message };
}

// Used to cascade-delete a category/sub-category's entries before the
// category/sub-category itself is removed.
export async function deleteEntriesForSubcategories(
	supabase: SupabaseClient,
	subcategoryIds: string[]
): Promise<{ error: string } | undefined> {
	if (subcategoryIds.length === 0) return;

	const { error } = await supabase.from('balance').delete().in('subcategory_id', subcategoryIds);
	if (error) return { error: error.message };
}

export interface MonthlySpend {
	chartLabels: string[];
	chartValues: number[];
	spentThisMonth: number;
	incomeThisMonth: number;
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

	const spendByCategory = new Map<string, number>();
	let incomeThisMonth = 0;
	for (const entry of entries ?? []) {
		if (entry.in_out) {
			incomeThisMonth += entry.ammount;
			continue; // only spending ("out") feeds the chart
		}
		const category = first(first(entry.subcategory)?.category);
		const cName = category?.c_name ?? 'Other';
		spendByCategory.set(cName, (spendByCategory.get(cName) ?? 0) + entry.ammount);
	}

	const chartLabels = [...spendByCategory.keys()];
	const chartValues = [...spendByCategory.values()];
	const spentThisMonth = chartValues.reduce((sum, value) => sum + value, 0);

	return { chartLabels, chartValues, spentThisMonth, incomeThisMonth };
}

// All-time balance: every "in" entry minus every "out" entry.
export async function getCurrentBalance(supabase: SupabaseClient): Promise<number> {
	const { data: entries } = await supabase.from('balance').select('ammount, in_out');

	return (entries ?? []).reduce(
		(total, entry) => total + (entry.in_out ? entry.ammount : -entry.ammount),
		0
	);
}

// Returns one bucket per month in the trailing window (oldest -> newest),
// including months with no entries, so the history chart always shows a
// fixed number of bars.
export async function getMonthlyTotals(
	supabase: SupabaseClient,
	months = 6
): Promise<MonthlyTotal[]> {
	const now = new Date();
	const from = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
	const to = new Date(now.getFullYear(), now.getMonth() + 1, 1);

	const { data: entries } = await supabase
		.from('balance')
		.select('ammount, in_out, time')
		.gte('time', from.toISOString())
		.lt('time', to.toISOString());

	const buckets = new Map<string, { label: string; amount: number }>();
	for (let i = 0; i < months; i++) {
		const monthDate = new Date(now.getFullYear(), now.getMonth() - (months - 1) + i, 1);
		const key = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
		buckets.set(key, {
			label: monthDate.toLocaleDateString('en-GB', { month: 'short' }),
			amount: 0
		});
	}

	for (const entry of entries ?? []) {
		if (entry.in_out) continue; // spending only
		const entryDate = new Date(entry.time);
		const key = `${entryDate.getFullYear()}-${entryDate.getMonth()}`;
		const bucket = buckets.get(key);
		if (bucket) bucket.amount += entry.ammount;
	}

	return [...buckets.values()];
}

export async function getEntries(
	supabase: SupabaseClient,
	range?: { from?: string; to?: string }
): Promise<BalanceEntry[]> {
	let query = supabase
		.from('balance')
		.select('balance_id, ammount, in_out, time, subcategory(sc_name, category(c_name))')
		.order('time', { ascending: false });

	if (range?.from) query = query.gte('time', range.from);
	if (range?.to) query = query.lt('time', range.to);

	const { data: entries } = await query;

	return (entries ?? []).map((entry) => {
		const subcategory = first(entry.subcategory);
		const category = first(subcategory?.category);

		return {
			id: entry.balance_id,
			date: entry.time.slice(0, 10),
			subcategory: subcategory?.sc_name ?? 'Uncategorised',
			category: category?.c_name ?? 'Other',
			amount: entry.ammount,
			isIncoming: entry.in_out
		};
	});
}
