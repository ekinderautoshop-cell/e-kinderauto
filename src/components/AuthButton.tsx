import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../lib/supabase';

interface Props {
	supabaseUrl: string;
	supabaseKey: string;
}

export default function AuthButton({ supabaseUrl, supabaseKey }: Props) {
	const [loggedIn, setLoggedIn] = useState(false);
	const [checked, setChecked] = useState(false);
	const [initials, setInitials] = useState('');

	useEffect(() => {
		const supabase = getSupabaseClient({ PUBLIC_SUPABASE_URL: supabaseUrl, PUBLIC_SUPABASE_ANON_KEY: supabaseKey });
		if (!supabase) {
			setChecked(true);
			return;
		}
		supabase.auth.getUser().then(({ data }) => {
			setLoggedIn(!!data.user);
			if (data.user) {
				const name = data.user.user_metadata?.full_name || data.user.email || '';
				const parts = name.trim().split(/\s+/);
				setInitials(
					parts.length >= 2
						? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
						: name.slice(0, 2).toUpperCase()
				);
			}
			setChecked(true);
		});
	}, []);

	if (!checked) return null;

	return (
		<a
			href={loggedIn ? '/konto' : '/anmelden'}
			className="text-gray-600 hover:text-black transition-colors"
			aria-label={loggedIn ? 'Mein Konto' : 'Anmelden'}
		>
			{loggedIn ? (
				<span className="w-8 h-8 rounded-full bg-black text-white text-xs font-semibold flex items-center justify-center">
					{initials || '?'}
				</span>
			) : (
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
					<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
				</svg>
			)}
		</a>
	);
}
