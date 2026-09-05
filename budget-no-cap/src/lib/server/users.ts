import type { SupabaseClient } from '@supabase/supabase-js';
import type { Profile } from '$lib/types/user';

export async function getProfile(supabase: SupabaseClient): Promise<Profile | null> {
	const { data } = await supabase.from('users').select('name').single();
	return data;
}
