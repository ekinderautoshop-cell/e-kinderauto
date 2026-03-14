import { useEffect, useState } from 'react';
import { getSupabaseClient } from '../lib/supabase';

interface Props {
	orderNumber: string;
}

interface OrderItem {
	name: string;
	quantity: number;
	totalAmount: number;
}

interface Order {
	orderNumber: string;
	status: string;
	currency: string;
	totalAmount: number;
	items: OrderItem[];
	createdAt: number;
}

function statusLabel(status: string): string {
	switch (status) {
		case 'paid':
			return 'Bezahlt';
		case 'payment_failed':
			return 'Zahlung fehlgeschlagen';
		case 'refunded':
			return 'Erstattet';
		case 'in_bearbeitung':
			return 'In Bearbeitung';
		case 'sendung_aufgegeben':
			return 'Sendung aufgegeben';
		default:
			return status.replace(/_/g, ' ');
	}
}

export default function OrderStatusView({ orderNumber }: Props) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [order, setOrder] = useState<Order | null>(null);

	useEffect(() => {
		const supabase = getSupabaseClient();
		if (!supabase) {
			setError('Authentifizierung ist nicht verfuegbar.');
			setLoading(false);
			return;
		}

		supabase.auth.getSession().then(async ({ data }) => {
			const token = data.session?.access_token;
			if (!token) {
				window.location.href = '/anmelden';
				return;
			}
			try {
				const res = await fetch(`/api/order-status/${encodeURIComponent(orderNumber)}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				const json = await res.json();
				if (!res.ok) {
					throw new Error(json.error || 'Bestellung konnte nicht geladen werden.');
				}
				setOrder(json.order as Order);
			} catch (err: any) {
				setError(err.message || 'Bestellung konnte nicht geladen werden.');
			} finally {
				setLoading(false);
			}
		});
	}, [orderNumber]);

	if (loading) {
		return <div className="text-sm text-gray-500 text-center py-10">Status wird geladen...</div>;
	}

	if (error || !order) {
		return (
			<div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-100 p-6 text-center">
				<p className="text-red-600 text-sm">{error || 'Bestellung nicht gefunden.'}</p>
				<a href="/konto" className="inline-block mt-4 text-sm font-medium text-black hover:underline">
					Zurueck zu meinem Konto
				</a>
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-100 p-6 md:p-8">
			<div className="flex items-center justify-between gap-3 mb-4">
				<div>
					<p className="text-xs uppercase tracking-wide text-gray-400">Bestellung</p>
					<h1 className="text-xl font-bold text-gray-900">{order.orderNumber}</h1>
				</div>
				<span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700 uppercase">
					{statusLabel(order.status)}
				</span>
			</div>

			<p className="text-sm text-gray-500 mb-5">
				Bestelldatum:{' '}
				{new Date(order.createdAt).toLocaleDateString('de-DE', {
					year: 'numeric',
					month: 'long',
					day: 'numeric',
				})}
			</p>

			<div className="space-y-2 mb-5">
				{order.items.map((item, idx) => (
					<div key={`${idx}-${item.name}`} className="flex items-center justify-between text-sm gap-4">
						<span className="text-gray-700 truncate">
							{item.quantity} x {item.name}
						</span>
						<span className="font-medium shrink-0">
							{item.totalAmount.toFixed(2)} {order.currency}
						</span>
					</div>
				))}
			</div>

			<div className="border-t border-gray-100 pt-4 flex items-center justify-between">
				<span className="font-medium text-gray-700">Gesamt</span>
				<span className="text-lg font-bold">
					{order.totalAmount.toFixed(2)} {order.currency}
				</span>
			</div>

			<div className="mt-6">
				<a href="/konto" className="text-sm text-gray-500 hover:text-black transition-colors">
					← Zurueck zu meinem Konto
				</a>
			</div>
		</div>
	);
}
