import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// The +layout.svelte header posts here (form method="POST" action="/logout").
export const POST: RequestHandler = async ({ locals: { supabase } }) => {
	await supabase.auth.signOut();
	redirect(303, '/login');
};
