import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { formatOrderNumber } from '../lib/order-number';

interface Props {
	supabaseUrl: string;
	supabaseKey: string;
}

interface OrderItem {
	name: string;
	quantity: number;
	unitAmount: number;
	totalAmount: number;
	currency: string;
}

interface Order {
	id: number;
	stripeSessionId: string;
	status: string;
	currency: string;
	totalAmount: number;
	items: OrderItem[];
	createdAt: number;
}

export default function AccountDashboard({ supabaseUrl, supabaseKey }: Props) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [savingName, setSavingName] = useState(false);
	const [name, setName] = useState('');
	const [nameSuccess, setNameSuccess] = useState('');
	const [orders, setOrders] = useState<Order[]>([]);
	const [ordersLoading, setOrdersLoading] = useState(true);

	const supabase = getSupabaseClient({ PUBLIC_SUPABASE_URL: supabaseUrl, PUBLIC_SUPABASE_ANON_KEY: supabaseKey });

	useEffect(() => {
		if (!supabase) {
			setLoading(false);
			return;
		}
		supabase.auth.getUser().then(({ data }) => {
			if (data.user) {
				setUser(data.user);
				setName(data.user.user_metadata?.full_name ?? '');
			} else {
				window.location.href = '/anmelden';
			}
			setLoading(false);
		});
	}, []);

	useEffect(() => {
		if (!user) return;
		const params = new URLSearchParams();
		params.set('userId', user.id);
		if (user.email) params.set('email', user.email);
		fetch(`/api/orders?${params.toString()}`)
			.then((res) => res.json())
			.then((data) => {
				setOrders(Array.isArray(data.orders) ? data.orders : []);
				setOrdersLoading(false);
			})
			.catch(() => {
				setOrders([]);
				setOrdersLoading(false);
			});
	}, [user]);

	async function handleLogout() {
		if (!supabase) return;
		await supabase.auth.signOut();
		window.location.href = '/';
	}

	async function handleSaveName(e: React.FormEvent) {
		e.preventDefault();
		if (!supabase) return;
		setSavingName(true);
		setNameSuccess('');
		await supabase.auth.updateUser({ data: { full_name: name } });
		setNameSuccess('Name gespeichert.');
		setSavingName(false);
		setTimeout(() => setNameSuccess(''), 3000);
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
			</div>
		);
	}

	if (!user) return null;

	const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Kunde';
	const memberSince = new Date(user.created_at).toLocaleDateString('de-DE', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	return (
		<div className="max-w-4xl mx-auto">
			{/* Welcome */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
				<div className="flex items-center justify-between flex-wrap gap-4">
					<div className="flex items-center gap-4">
						<span className="w-14 h-14 rounded-full bg-black text-white text-lg font-semibold flex items-center justify-center shrink-0">
							{displayName.split(/\s+/).length >= 2
								? (displayName[0] + displayName.split(/\s+/).pop()![0]).toUpperCase()
								: displayName.slice(0, 2).toUpperCase()}
						</span>
						<div>
							<h1 className="text-2xl font-bold text-gray-900">
								Hallo, {displayName}!
							</h1>
							<p className="text-gray-500 text-sm mt-1">
								Mitglied seit {memberSince}
							</p>
						</div>
					</div>
					<button
						onClick={handleLogout}
						className="text-sm text-gray-500 hover:text-black border border-gray-200 rounded-lg px-4 py-2 transition-colors"
					>
						Abmelden
					</button>
				</div>
			</div>

			<div className="grid md:grid-cols-2 gap-6">
				{/* Profile */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
					<h2 className="text-lg font-bold text-gray-900 mb-4">Profil</h2>
					<form onSubmit={handleSaveName} className="space-y-4">
						<div>
							<label htmlFor="acc-name" className="block text-sm font-medium text-gray-700 mb-1.5">
								Name
							</label>
							<input
								id="acc-name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">
								E-Mail
							</label>
							<input
								type="email"
								value={user.email ?? ''}
								disabled
								className="w-full px-4 py-3 border border-gray-100 rounded-lg text-sm bg-gray-50 text-gray-500"
							/>
						</div>
						<div className="flex items-center gap-3">
							<button
								type="submit"
								disabled={savingName}
								className="bg-black text-white text-sm px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
							>
								{savingName ? 'Speichern...' : 'Speichern'}
							</button>
							{nameSuccess && (
								<span className="text-green-600 text-sm">{nameSuccess}</span>
							)}
						</div>
					</form>
				</div>

				{/* Orders placeholder */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
					<h2 className="text-lg font-bold text-gray-900 mb-4">Bestellungen</h2>
					{ordersLoading ? (
						<div className="text-center py-6 text-sm text-gray-500">Bestellungen werden geladen...</div>
					) : orders.length === 0 ? (
						<div className="text-center py-8">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-300 mx-auto mb-3">
								<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
							</svg>
							<p className="text-gray-500 text-sm">Noch keine Bestellungen vorhanden.</p>
							<a href="/produkte" className="inline-block mt-4 text-sm font-medium text-black hover:underline">
								Jetzt shoppen →
							</a>
						</div>
					) : (
						<div className="space-y-4">
							{orders.map((order) => (
								<div key={order.id} className="border border-gray-200 rounded-lg p-4">
									<div className="flex items-center justify-between gap-2 mb-2">
										<p className="text-xs text-gray-500">
											{formatOrderNumber({
												stripeSessionId: order.stripeSessionId,
												createdAtMs: order.createdAt,
											})}
										</p>
										<span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-700 uppercase">
											{order.status}
										</span>
									</div>
									<p className="text-sm text-gray-500 mb-2">
										{new Date(order.createdAt).toLocaleDateString('de-DE', {
											year: 'numeric',
											month: 'short',
											day: 'numeric',
										})}
									</p>
									<div className="space-y-1 mb-3">
										{order.items.map((item, index) => (
											<div key={`${order.id}-${index}`} className="text-sm text-gray-700 flex items-center justify-between gap-3">
												<span className="truncate">
													{item.quantity} x {item.name}
												</span>
												<span className="font-medium shrink-0">
													{item.totalAmount.toFixed(2)} {order.currency}
												</span>
											</div>
										))}
									</div>
									<div className="pt-2 border-t border-gray-100 flex items-center justify-between text-sm">
										<span className="font-medium text-gray-700">Gesamt</span>
										<span className="font-bold">
											{order.totalAmount.toFixed(2)} {order.currency}
										</span>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Addresses placeholder */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
					<h2 className="text-lg font-bold text-gray-900 mb-4">Adressen</h2>
					<div className="text-center py-8">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-300 mx-auto mb-3">
							<path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
							<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
						</svg>
						<p className="text-gray-500 text-sm">Keine gespeicherten Adressen.</p>
					</div>
				</div>

				{/* Security */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
					<h2 className="text-lg font-bold text-gray-900 mb-4">Sicherheit</h2>
					<div className="space-y-3">
						<a
							href="/passwort-vergessen"
							className="block w-full text-left text-sm text-gray-700 hover:text-black border border-gray-200 rounded-lg px-4 py-3 transition-colors"
						>
							Passwort ändern →
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
