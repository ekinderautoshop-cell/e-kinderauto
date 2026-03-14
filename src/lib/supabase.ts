import { createClient } from '@supabase/supabase-js';

let clientInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient(env?: { PUBLIC_SUPABASE_URL?: string; PUBLIC_SUPABASE_ANON_KEY?: string }) {
	if (clientInstance) return clientInstance;

	const url = env?.PUBLIC_SUPABASE_URL ?? import.meta.env.PUBLIC_SUPABASE_URL ?? '';
	const key = env?.PUBLIC_SUPABASE_ANON_KEY ?? import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';

	if (!url || !key) return null;

	clientInstance = createClient(url, key, {
		auth: {
			flowType: 'pkce',
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: true,
		},
	});

	return clientInstance;
}

export function createServerClient(url: string, key: string) {
	return createClient(url, key, {
		auth: {
			flowType: 'pkce',
			autoRefreshToken: false,
			persistSession: false,
		},
	});
}
