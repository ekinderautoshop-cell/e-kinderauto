import { useState } from 'react';
import { getSupabaseClient } from '../lib/supabase';

interface Props {
	mode: 'login' | 'register' | 'forgot';
	supabaseUrl: string;
	supabaseKey: string;
}

export default function AuthForm({ mode, supabaseUrl, supabaseKey }: Props) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const supabase = getSupabaseClient({ PUBLIC_SUPABASE_URL: supabaseUrl, PUBLIC_SUPABASE_ANON_KEY: supabaseKey });

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!supabase) {
			setError('Authentifizierung ist aktuell nicht verfügbar.');
			return;
		}

		setLoading(true);
		setError('');
		setSuccess('');

		try {
			if (mode === 'login') {
				const { error: err } = await supabase.auth.signInWithPassword({ email, password });
				if (err) throw err;
				window.location.href = '/konto';
			} else if (mode === 'register') {
				const { error: err } = await supabase.auth.signUp({
					email,
					password,
					options: { data: { full_name: name } },
				});
				if (err) throw err;
				setSuccess('Registrierung erfolgreich! Bitte bestätige deine E-Mail-Adresse.');
			} else if (mode === 'forgot') {
				const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
					redirectTo: `${window.location.origin}/konto`,
				});
				if (err) throw err;
				setSuccess('Falls ein Konto mit dieser E-Mail existiert, erhältst du einen Link zum Zurücksetzen.');
			}
		} catch (err: any) {
			const msg = err?.message ?? 'Ein Fehler ist aufgetreten.';
			if (msg.includes('Invalid login')) {
				setError('E-Mail oder Passwort ist falsch.');
			} else if (msg.includes('already registered')) {
				setError('Diese E-Mail ist bereits registriert.');
			} else if (msg.includes('least 6')) {
				setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
			} else {
				setError(msg);
			}
		} finally {
			setLoading(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
					{error}
				</div>
			)}
			{success && (
				<div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
					{success}
				</div>
			)}

			{mode === 'register' && (
				<div>
					<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
						Name
					</label>
					<input
						id="name"
						type="text"
						required
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Max Mustermann"
						className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
					/>
				</div>
			)}

			<div>
				<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
					E-Mail
				</label>
				<input
					id="email"
					type="email"
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="name@beispiel.de"
					className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
				/>
			</div>

			{mode !== 'forgot' && (
				<div>
					<div className="flex items-center justify-between mb-1.5">
						<label htmlFor="password" className="block text-sm font-medium text-gray-700">
							Passwort
						</label>
						{mode === 'login' && (
							<a href="/passwort-vergessen" className="text-xs text-gray-500 hover:text-black transition-colors">
								Vergessen?
							</a>
						)}
					</div>
					<input
						id="password"
						type="password"
						required
						minLength={6}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Mindestens 6 Zeichen"
						className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
					/>
				</div>
			)}

			<button
				type="submit"
				disabled={loading}
				className="w-full bg-black text-white py-3 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{loading
					? 'Bitte warten...'
					: mode === 'login'
						? 'Anmelden'
						: mode === 'register'
							? 'Konto erstellen'
							: 'Link senden'}
			</button>
		</form>
	);
}
