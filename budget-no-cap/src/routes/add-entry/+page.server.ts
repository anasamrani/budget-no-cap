import { fail, redirect } from '@sveltejs/kit';
import { getCategoriesWithSubcategories } from '$lib/server/categories';
import { getOrCreateAccount } from '$lib/server/account';
import { addBalanceEntry } from '$lib/server/balance';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) redirect(303, '/login');

	return { categories: await getCategoriesWithSubcategories(supabase) };
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

		const account = await getOrCreateAccount(supabase, user.id);
		if ('error' in account) return fail(400, { error: account.error });

		const result = await addBalanceEntry(supabase, {
			subcategoryId,
			amount,
			isIncoming: type === 'in',
			accountId: account.accountId
		});
		if (result?.error) return fail(400, { error: result.error });

		redirect(303, '/');
	}
};
