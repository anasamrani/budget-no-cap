# budget-no-cap

A small SvelteKit app with Supabase Auth and a per-user budget balance viewer.

## Developing

```sh
bun install
bun run dev
```

Copy `.env.example` to `.env` and fill in `PUBLIC_SUPABASE_URL` /
`PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the Supabase project settings first.

### Corporate TLS proxy (Zscaler etc.)

If `bun run dev` fails on signup/login with `fetch failed` /
`unable to get local issuer certificate`, this machine's network is intercepting HTTPS
(commonly a corporate proxy like Zscaler) with a certificate Bun/Node don't trust by default —
even though `curl` and the browser work fine, since they use the OS trust store.

Export the intercepting root CA to a PEM file and point `NODE_EXTRA_CA_CERTS` at it for anything
that runs Bun/Node and talks to Supabase:

```sh
NODE_EXTRA_CA_CERTS=/path/to/root-ca.pem bun run dev
NODE_EXTRA_CA_CERTS=/path/to/root-ca.pem bun run test:auth
```

This is machine-specific, not project config — don't bake it into `package.json` scripts, since
it would break the app for anyone not behind the same proxy.

## Testing auth

```sh
bun run dev            # in one terminal
bun run test:auth       # in another
```

Runs [scripts/smoke-auth.mjs](scripts/smoke-auth.mjs): drives the login/signup/logout flow against
the running dev server, then verifies RLS actually isolates data between two accounts by hitting
the Supabase REST API directly. Safe to re-run — it reuses fixed test accounts/rows instead of
piling up new ones.

## Building

```sh
bun run build
```

Preview the production build with `bun run preview`. You'll need to add an
[adapter](https://svelte.dev/docs/kit/adapters) for your target deployment environment.
