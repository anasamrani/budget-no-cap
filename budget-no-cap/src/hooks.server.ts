import { createServerClient } from '@supabase/ssr';
import { type Handle } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';

// Runs before every server request. Builds a request-scoped Supabase client
// that reads/writes the session via cookies, and hangs it on `event.locals`
// so any +page.server.ts / +server.ts down the line can just do
// `const { supabase } = event.locals` instead of re-creating a client.
export const handle: Handle = async ({ event, resolve }) => {
	console.log('REQUEST URL:', event.request.url);
	console.log('REQUEST COOKIE:', event.request.headers.get('cookie'));
	console.log('PLATFORM COOKIE:', event.platform?.req?.headers?.cookie);
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet, headers) => {
				console.log('SETTING COOKIES:', cookiesToSet.map((c) => c.name));

				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, {
						...options,
						path: '/',
						secure: false
					});
				});

				if (Object.keys(headers).length > 0) {
					event.setHeaders(headers);
				}
			}
		}
	});

	// getSession() just reads the cookie's claims without checking them against
	// Supabase — a forged/expired cookie would pass. getUser() re-validates the
	// JWT against Supabase's servers, so this is the version safe to gate access on.
	event.locals.safeGetSession = async () => {
		console.log('RAW COOKIE HEADER:', event.request.headers.get('cookie'));
		console.log('SVELTEKIT COOKIES:', event.cookies.getAll().map((c) => c.name));

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();

		console.log('GET USER:', user?.email ?? 'NO USER', error?.message ?? '');

		if (error || !user) {
			return { session: null, user: null };
		}

		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();

		return { session, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};
