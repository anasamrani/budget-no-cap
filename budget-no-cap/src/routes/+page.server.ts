import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Placeholder home page — replaced by the actual budget viewer later.
// For now it just proves the whole chain works: the auth guard, the
// handle_new_user() trigger (step 1) that seeded this profile row, and the
// RLS "own profile" select policy that lets a user read only their own row.
export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) redirect(303, '/login');

	const { data: profile } = await supabase.from('users').select('name').single();

	return { name: profile?.name ?? null, email: user.email ?? null };
};
