import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../lib/supabase';

interface Props {
	supabaseUrl: string;
	supabaseKey: string;
}

export default function AuthButton({ supabaseUrl, supabaseKey }: Props) {
	const [loggedIn, setLoggedIn] = useState(false);
	const [checked, setChecked] = useState(false);

	useEffect(() => {
		const supabase = getSupabaseClient({ PUBLIC_SUPABASE_URL: supabaseUrl, PUBLIC_SUPABASE_ANON_KEY: supabaseKey });
		if (!supabase) {
			setChecked(true);
			return;
		}
		supabase.auth.getUser().then(({ data }) => {
			setLoggedIn(!!data.user);
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
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
					<path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
				</svg>
			) : (
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
					<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
				</svg>
			)}
		</a>
	);
}
