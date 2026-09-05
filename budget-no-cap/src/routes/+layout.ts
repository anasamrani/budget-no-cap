import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';
import type { LayoutLoad } from './$types';

// Universal load — runs in the browser AND (on first navigation / no-JS) on
// the server. Builds whichever Supabase client fits where it's executing,
// both exposed the same way as `data.supabase` so components don't care.
export const load: LayoutLoad = async ({ data, depends, fetch }) => {
	// Tag this load so `invalidate('supabase:auth')` (called from +layout.svelte
	// on auth state changes) forces it, and everything depending on it, to re-run.
	depends('supabase:auth');

	const supabase = isBrowser()
		? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
				global: { fetch }
			})
		: createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
				global: { fetch },
				cookies: {
					getAll: () => data.cookies
				}
			});

	// Re-derive session/user through the client we just built rather than trusting
	// the ones passed down from +layout.server.ts — same getUser()-over-getSession()
	// reasoning as in hooks.server.ts.
	const {
		data: { session }
	} = await supabase.auth.getSession();
	const {
		data: { user }
	} = await supabase.auth.getUser();

	return { supabase, session, user, displayName: data.displayName };
};
