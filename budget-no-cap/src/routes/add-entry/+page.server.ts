import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) redirect(303, '/login');

	const { data: categories } = await supabase
		.from('category')
		.select('category_id, c_name, subcategory(subcategory_id, sc_name)')
		.order('category_id');

	return { categories: categories ?? [] };
};

export const actions: Actions = {
	add: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const subcategoryId = String(formData.get('subcategory_id') ?? '');
		const amount = Number(formData.get('amount'));
		const type = String(formData.get('type') ?? '');

		if (!subcategoryId) return fail(400, { error: 'Select a sub-category.' });
		if (!Number.isFinite(amount) || amount <= 0) {
			return fail(400, { error: 'Enter an amount greater than 0.' });
		}

		// balance.account_id has no default and isn't creatable through the
		// signup trigger, so ensure the user has an account before their first
		// entry (the "own account" insert policy lets them create just theirs).
		let { data: account } = await supabase
			.from('account')
			.select('account_id')
			.maybeSingle();

		if (!account) {
			const { data: created, error: accountError } = await supabase
				.from('account')
				.insert({ user_id: user.id, a_name: 'Main' })
				.select('account_id')
				.single();
			if (accountError) return fail(400, { error: accountError.message });
			account = created;
		}

		const { error } = await supabase.from('balance').insert({
			ammount: amount,
			in_out: type === 'in',
			subcategory_id: subcategoryId,
			account_id: account?.account_id
		});
		if (error) return fail(400, { error: error.message });

		redirect(303, '/');
	}
};
