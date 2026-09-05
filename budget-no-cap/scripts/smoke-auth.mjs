// Re-runnable smoke test for the auth flow. Run with:
//   node --env-file=.env scripts/smoke-auth.mjs
// (needs the dev server already running at BASE_URL, `bun run dev`)
//
// Phase 1 drives the app itself (cookies, redirects) against the dev server.
// Phase 2 drives the Supabase REST API directly with two users' access
// tokens, to prove the RLS policies actually isolate rows between accounts —
// that's the part most likely to be silently wrong, since balance/subcategory
// policies join up through category rather than checking a user_id column
// directly.

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173';
const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
	console.error(
		'Missing PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_PUBLISHABLE_KEY in the environment.'
	);
	console.error('Run with: node --env-file=.env scripts/smoke-auth.mjs');
	process.exit(1);
}

const USER_A = { email: 'smoke-a@example.com', password: 'smoke-password-1', name: 'Smoke A' };
const USER_B = { email: 'smoke-b@example.com', password: 'smoke-password-2', name: 'Smoke B' };

let passed = 0;
let failed = 0;

function check(step, condition, detail) {
	if (condition) {
		passed++;
		console.log(`  ok   ${step}`);
	} else {
		failed++;
		console.log(`  FAIL ${step}${detail ? ` — ${detail}` : ''}`);
	}
}

// --- tiny cookie jar --------------------------------------------------

class Jar {
	/** @type {Map<string, string>} */
	cookies = new Map();

	// Supabase's session cookie is often split into sb-<ref>-auth-token.0 / .1
	// chunks once the JWT is long enough to exceed a single cookie's size, so
	// matching must be on name prefix, never on the exact cookie name.
	absorb(response) {
		const setCookies = response.headers.getSetCookie?.() ?? [];
		for (const raw of setCookies) {
			const [pair] = raw.split(';');
			const eq = pair.indexOf('=');
			const name = pair.slice(0, eq);
			const value = pair.slice(eq + 1);
			// An empty/"deleted" value (Max-Age=0, used by signOut) removes the cookie.
			if (raw.includes('Max-Age=0') || value === '') {
				this.cookies.delete(name);
			} else {
				this.cookies.set(name, value);
			}
		}
	}

	header() {
		return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
	}

	hasAuthCookie() {
		return [...this.cookies.keys()].some(
			(name) => name.startsWith('sb-') && name.includes('auth-token')
		);
	}
}

async function request(jar, method, path, body) {
	const headers = { Cookie: jar.header() };
	let payload;
	if (body) {
		headers['Content-Type'] = 'application/x-www-form-urlencoded';
		payload = new URLSearchParams(body).toString();
	}
	const response = await fetch(`${BASE_URL}${path}`, {
		method,
		headers,
		body: payload,
		redirect: 'manual'
	});
	jar.absorb(response);
	return response;
}

// SvelteKit only sends a literal HTTP redirect to requests that look like a
// real browser form submission (Accept: text/html). A plain fetch() without
// that header — which is what this script sends, and what use:enhance also
// sends from JS — gets a 200 with a JSON envelope describing the redirect
// instead. Both are the app behaving correctly; this normalizes the check.
async function redirectsTo(response, path) {
	if (response.status === 303 && response.headers.get('location') === path) {
		return true;
	}
	if (
		response.status === 200 &&
		response.headers.get('content-type')?.includes('application/json')
	) {
		try {
			const body = await response.clone().json();
			return body.type === 'redirect' && body.location === path;
		} catch {
			return false;
		}
	}
	return false;
}

// --- phase 1: app flow --------------------------------------------------

async function phase1() {
	console.log('\nPhase 1 — app flow (cookies + redirects)');
	const jar = new Jar();

	let r = await request(jar, 'GET', '/');
	check(
		'1. GET / with no session redirects to /login',
		r.status === 303 && r.headers.get('location') === '/login',
		`got ${r.status} ${r.headers.get('location')}`
	);

	r = await request(jar, 'GET', '/login');
	check('2. GET /login', r.status === 200, `got ${r.status}`);

	r = await request(jar, 'POST', '/login?/signup', {
		name: USER_A.name,
		email: USER_A.email,
		password: USER_A.password
	});
	// A fresh signup redirects straight to / (confirmation is off). A repeat
	// run hits "already registered" instead, which is a 400 from the action —
	// that's fine, the script falls through to logging in normally below.
	let signupOk = await redirectsTo(r, '/');
	if (!signupOk) {
		r = await request(jar, 'POST', '/login?/login', {
			email: USER_A.email,
			password: USER_A.password
		});
	}
	check(
		'3. Signup (or fallback login) establishes a session',
		(await redirectsTo(r, '/')) && jar.hasAuthCookie(),
		`got ${r.status}, cookie present: ${jar.hasAuthCookie()}`
	);

	r = await request(jar, 'GET', '/');
	const bodyLoggedIn = await r.text();
	check(
		'4. GET / with session shows the signed-in user',
		r.status === 200 && bodyLoggedIn.includes(USER_A.email),
		`got ${r.status}, body included email: ${bodyLoggedIn.includes(USER_A.email)}`
	);

	r = await request(jar, 'POST', '/logout');
	check(
		'5. POST /logout redirects to /login and clears the cookie',
		r.status === 303 && r.headers.get('location') === '/login' && !jar.hasAuthCookie(),
		`got ${r.status}, cookie still present: ${jar.hasAuthCookie()}`
	);

	r = await request(jar, 'GET', '/');
	check(
		'6. GET / after logout redirects to /login again',
		r.status === 303 && r.headers.get('location') === '/login',
		`got ${r.status}`
	);

	r = await request(jar, 'POST', '/login?/login', {
		email: USER_A.email,
		password: USER_A.password
	});
	check(
		'7. Login with the right password redirects to / and sets a cookie',
		(await redirectsTo(r, '/')) && jar.hasAuthCookie(),
		`got ${r.status}, cookie present: ${jar.hasAuthCookie()}`
	);

	const wrongJar = new Jar();
	r = await request(wrongJar, 'POST', '/login?/login', {
		email: USER_A.email,
		password: 'definitely-wrong'
	});
	check(
		'8. Login with the wrong password does not establish a session',
		!(await redirectsTo(r, '/')) && !wrongJar.hasAuthCookie(),
		`got ${r.status}, cookie present: ${wrongJar.hasAuthCookie()}`
	);
}

// --- phase 2: RLS isolation, straight against the REST API --------------

async function getAccessToken(user) {
	const signUpRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
		method: 'POST',
		headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
		body: JSON.stringify({ email: user.email, password: user.password, data: { name: user.name } })
	});
	const signUpBody = await signUpRes.json();
	if (signUpBody.access_token)
		return { token: signUpBody.access_token, userId: signUpBody.user.id };

	// Already registered — log in instead.
	const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
		method: 'POST',
		headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
		body: JSON.stringify({ email: user.email, password: user.password })
	});
	const loginBody = await loginRes.json();
	if (!loginBody.access_token) {
		throw new Error(`could not authenticate ${user.email}: ${JSON.stringify(loginBody)}`);
	}
	return { token: loginBody.access_token, userId: loginBody.user.id };
}

async function restGet(path, token) {
	const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
		headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token ?? SUPABASE_KEY}` }
	});
	return res.json();
}

async function phase2() {
	console.log('\nPhase 2 — RLS isolation (direct REST API)');

	const a = await getAccessToken(USER_A);
	const b = await getAccessToken(USER_B);

	// Idempotent: reuse a fixed category name instead of inserting a fresh
	// row every run, which would otherwise pile up across repeated runs.
	const existing = await restGet(
		`category?c_name=eq.__smoke_category__&select=category_id`,
		a.token
	);
	let category = existing[0];
	if (!category) {
		// user_id must be set explicitly to satisfy the "own categories" RLS
		// insert policy (with check (auth.uid() = user_id)) — Postgres has no
		// default for this column, so an omitted user_id is NULL and the
		// check always fails.
		const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/category`, {
			method: 'POST',
			headers: {
				apikey: SUPABASE_KEY,
				Authorization: `Bearer ${a.token}`,
				'Content-Type': 'application/json',
				Prefer: 'return=representation'
			},
			body: JSON.stringify({ c_name: '__smoke_category__', user_id: a.userId })
		});
		const inserted = await insertRes.json();
		category = Array.isArray(inserted) ? inserted[0] : undefined;
	}
	check(
		'1. User A can insert/see their own category',
		!!category?.category_id,
		JSON.stringify(category)
	);

	const bSees = await restGet('category?c_name=eq.__smoke_category__&select=category_id', b.token);
	check(
		"2. User B cannot see user A's category",
		Array.isArray(bSees) && bSees.length === 0,
		JSON.stringify(bSees)
	);

	const anonSees = await restGet('category?c_name=eq.__smoke_category__&select=category_id', null);
	check(
		'3. An anonymous request cannot see it either',
		Array.isArray(anonSees) && anonSees.length === 0,
		JSON.stringify(anonSees)
	);
}

// --- run ------------------------------------------------------------------

try {
	await phase1();
	await phase2();
} catch (err) {
	console.error('\nSmoke test crashed:', err);
	process.exit(1);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
