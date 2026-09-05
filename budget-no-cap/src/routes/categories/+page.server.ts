import { fail, redirect } from '@sveltejs/kit';
import { getCategoriesWithSubcategories } from '$lib/server/categories';
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

		const { error } = await supabase.from('category').delete().eq('category_id', categoryId);
		if (error) return fail(400, { error: error.message });
	},

	addSubCategory: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const categoryId = String(formData.get('category_id') ?? '');

		const { error } = await supabase
			.from('subcategory')
			.insert({ category_id: categoryId, sc_name: 'New sub-category' });
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

	deleteSubCategory: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const subcategoryId = String(formData.get('subcategory_id') ?? '');

		const { error } = await supabase
			.from('subcategory')
			.delete()
			.eq('subcategory_id', subcategoryId);
		if (error) return fail(400, { error: error.message });
	}
};
