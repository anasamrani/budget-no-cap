import type { SupabaseClient } from '@supabase/supabase-js';

// balance.account_id has no default and isn't creatable through the signup
// trigger, so every user needs an account row created lazily before their
// first entry (the "own account" insert policy lets them create just theirs).
export async function getOrCreateAccount(
	supabase: SupabaseClient,
	userId: string
): Promise<{ accountId: string } | { error: string }> {
	const { data: account } = await supabase.from('account').select('account_id').maybeSingle();
	if (account) return { accountId: account.account_id };

	const { data: created, error } = await supabase
		.from('account')
		.insert({ user_id: userId, a_name: 'Main' })
		.select('account_id')
		.single();
	if (error) return { error: error.message };

	return { accountId: created.account_id };
}
