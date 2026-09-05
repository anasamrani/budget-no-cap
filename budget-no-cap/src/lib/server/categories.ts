import type { SupabaseClient } from '@supabase/supabase-js';
import type { Category } from '$lib/types/category';

// Shared by /categories and /add-entry — both need the same category ->
// subcategory tree for the current user (scoped by RLS, no explicit filter).
export async function getCategoriesWithSubcategories(
	supabase: SupabaseClient
): Promise<Category[]> {
	const { data } = await supabase
		.from('category')
		.select('category_id, c_name, subcategory(subcategory_id, sc_name, priority)')
		.order('category_id');

	return (data as Category[] | null) ?? [];
}
