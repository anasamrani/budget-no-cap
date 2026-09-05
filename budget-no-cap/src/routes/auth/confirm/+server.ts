import { redirect } from '@sveltejs/kit';
import type { EmailOtpType } from '@supabase/supabase-js';
import type { RequestHandler } from './$types';

// Supabase's confirmation email links here with `?token_hash=...&type=signup`
// (mailer_autoconfirm is off, so this is the only way a new session actually
// gets established after signup — signUp() alone doesn't sign the user in).
export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type') as EmailOtpType | null;
	const next = url.searchParams.get('next') ?? '/';

	if (token_hash && type) {
		const { error } = await supabase.auth.verifyOtp({ type, token_hash });
		if (!error) {
			redirect(303, next);
		}
	}

	redirect(303, '/login?error=Confirmation link is invalid or has expired.');
};
