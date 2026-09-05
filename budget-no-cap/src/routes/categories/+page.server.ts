import { fail, redirect } from '@sveltejs/kit';
import { getCategoriesWithSubcategories } from '$lib/server/categories';
import { deleteEntriesForSubcategories } from '$lib/server/balance';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) redirect(303, '/login');

	return { categories: await getCategoriesWithSubcategories(supabase) };
};

export const actions: Actions = {
	addCategory: async ({ locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) redirect(303, '/login');

		const { error } = await supabase
			.from('category')
			.insert({ c_name: 'New category', user_id: user.id });
		if (error) return fail(400, { error: error.message });
	},

	renameCategory: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const categoryId = String(formData.get('category_id') ?? '');
		const cName = String(formData.get('c_name') ?? '');

		const { error } = await supabase
			.from('category')
			.update({ c_name: cName })
			.eq('category_id', categoryId);
		if (error) return fail(400, { error: error.message });
	},

	deleteCategory: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const categoryId = String(formData.get('category_id') ?? '');

		// Cascade: entries -> subcategories -> category, since the DB has no
		// ON DELETE CASCADE for these relations.
		const { data: subcategories, error: fetchError } = await supabase
			.from('subcategory')
			.select('subcategory_id')
			.eq('category_id', categoryId);
		if (fetchError) return fail(400, { error: fetchError.message });

		const entriesError = await deleteEntriesForSubcategories(
			supabase,
			(subcategories ?? []).map((subcategory) => subcategory.subcategory_id)
		);
		if (entriesError) return fail(400, entriesError);

		const { error: subcategoryError } = await supabase
			.from('subcategory')
			.delete()
			.eq('category_id', categoryId);
		if (subcategoryError) return fail(400, { error: subcategoryError.message });

		const { error } = await supabase.from('category').delete().eq('category_id', categoryId);
		if (error) return fail(400, { error: error.message });
	},

	addSubCategory: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const categoryId = String(formData.get('category_id') ?? '');

		const { error } = await supabase
			.from('subcategory')
			.insert({ category_id: categoryId, sc_name: 'New sub-category', priority: 2 });
		if (error) return fail(400, { error: error.message });
	},

	renameSubCategory: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const subcategoryId = String(formData.get('subcategory_id') ?? '');
		const scName = String(formData.get('sc_name') ?? '');

		const { error } = await supabase
			.from('subcategory')
			.update({ sc_name: scName })
			.eq('subcategory_id', subcategoryId);
		if (error) return fail(400, { error: error.message });
	},

	setSubCategoryPriority: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const subcategoryId = String(formData.get('subcategory_id') ?? '');
		const priority = Number(formData.get('priority'));

		if (![1, 2, 3].includes(priority)) return fail(400, { error: 'Priority must be 1, 2 or 3.' });

		const { error } = await supabase
			.from('subcategory')
			.update({ priority })
			.eq('subcategory_id', subcategoryId);
		if (error) return fail(400, { error: error.message });
	},

	deleteSubCategory: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const subcategoryId = String(formData.get('subcategory_id') ?? '');

		// Cascade: entries -> sub-category.
		const entriesError = await deleteEntriesForSubcategories(supabase, [subcategoryId]);
		if (entriesError) return fail(400, entriesError);

		const { error } = await supabase
			.from('subcategory')
			.delete()
			.eq('subcategory_id', subcategoryId);
		if (error) return fail(400, { error: error.message });
	}
};
