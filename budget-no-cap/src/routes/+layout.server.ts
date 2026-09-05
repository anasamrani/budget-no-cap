import { getProfile } from '$lib/server/users';
import type { LayoutServerLoad } from './$types';

// Root server load — runs once per request for every route under it.
// Hands the session/user down to every page as `data`, plus the raw
// cookies so +layout.ts can seed a matching browser-side client.
export const load: LayoutServerLoad = async ({ locals: { supabase, safeGetSession }, cookies }) => {
	const { session, user } = await safeGetSession();

	const profile = user ? await getProfile(supabase) : null;

	return {
		session,
		user,
		displayName: profile?.name ?? null,
		cookies: cookies.getAll()
	};
};
