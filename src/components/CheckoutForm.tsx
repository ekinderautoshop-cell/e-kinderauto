import { useState, useEffect } from 'react';
import type { Product } from '../types/product';
import { getShortProductName } from '../lib/d1-products';
import { stripMitLizenz } from '../data/shop-content';

interface CartItem {
	product: Product;
	quantity: number;
}

export default function CheckoutForm() {
	const [cart, setCart] = useState<CartItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		const savedCart = localStorage.getItem('cart');
		if (savedCart) {
			setCart(JSON.parse(savedCart));
		}
	}, []);

	const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

	function updateQuantity(productId: string, delta: number) {
		setCart((prev) => {
			const updated = prev
				.map((item) =>
					item.product.id === productId
						? { ...item, quantity: Math.max(0, item.quantity + delta) }
						: item
				)
				.filter((item) => item.quantity > 0);
			localStorage.setItem('cart', JSON.stringify(updated));
			window.dispatchEvent(new Event('cartUpdated'));
			return updated;
		});
	}

	function removeItem(productId: string) {
		setCart((prev) => {
			const updated = prev.filter((item) => item.product.id !== productId);
			localStorage.setItem('cart', JSON.stringify(updated));
			window.dispatchEvent(new Event('cartUpdated'));
			return updated;
		});
	}

	async function handleCheckout() {
		setLoading(true);
		setError('');

		try {
			const res = await fetch('/api/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					items: cart.map((item) => ({
						product: {
							id: item.product.id,
							name: getShortProductName(stripMitLizenz(item.product.name)),
							price: item.product.price,
							image: item.product.image,
						},
						quantity: item.quantity,
					})),
				}),
			});

			const data = await res.json();

			if (!res.ok || !data.url) {
				throw new Error(data.error || 'Fehler beim Starten der Zahlung.');
			}

			window.location.href = data.url;
		} catch (err: any) {
			setError(err.message || 'Etwas ist schiefgelaufen. Bitte versuche es erneut.');
			setLoading(false);
		}
	}

	if (cart.length === 0) {
		return (
			<div className="text-center py-20">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-300 mx-auto mb-4">
					<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
				</svg>
				<p className="text-lg text-gray-500 mb-2">Dein Warenkorb ist leer</p>
				<a href="/produkte" className="text-sm font-medium text-black hover:underline">
					Weiter einkaufen →
				</a>
			</div>
		);
	}

	return (
		<div className="max-w-3xl mx-auto">
			<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
				{/* Cart items */}
				<div className="divide-y divide-gray-100">
					{cart.map((item) => {
						const displayName = getShortProductName(stripMitLizenz(item.product.name));
						return (
							<div key={item.product.id} className="flex items-center gap-4 p-5">
								<img
									src={item.product.image}
									alt={displayName}
									className="w-20 h-20 object-cover rounded-lg shrink-0"
								/>
								<div className="flex-1 min-w-0">
									<h3 className="font-medium text-gray-900 text-sm truncate">{displayName}</h3>
									<p className="text-gray-500 text-sm mt-0.5">
										{item.product.price.toFixed(2)} €
									</p>
								</div>
								<div className="flex items-center gap-2">
									<button
										onClick={() => updateQuantity(item.product.id, -1)}
										className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm"
									>
										−
									</button>
									<span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
									<button
										onClick={() => updateQuantity(item.product.id, 1)}
										className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm"
									>
										+
									</button>
								</div>
								<p className="font-semibold text-sm w-24 text-right">
									{(item.product.price * item.quantity).toFixed(2)} €
								</p>
								<button
									onClick={() => removeItem(item.product.id)}
									className="text-gray-400 hover:text-red-500 transition-colors ml-2"
									aria-label="Entfernen"
								>
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
										<path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						);
					})}
				</div>

				{/* Summary */}
				<div className="border-t border-gray-100 bg-gray-50 p-5">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm text-gray-500">Zwischensumme</span>
						<span className="text-sm font-medium">{totalPrice.toFixed(2)} €</span>
					</div>
					<div className="flex items-center justify-between mb-1">
						<span className="text-sm text-gray-500">Versand</span>
						<span className="text-sm text-green-600 font-medium">Kostenlos</span>
					</div>
					<div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-3">
						<span className="text-base font-bold">Gesamt</span>
						<span className="text-lg font-bold">{totalPrice.toFixed(2)} €</span>
					</div>
				</div>

				{/* Error */}
				{error && (
					<div className="px-5 pb-4">
						<div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
							{error}
						</div>
					</div>
				)}

				{/* Checkout button */}
				<div className="p-5 pt-0">
					<button
						onClick={handleCheckout}
						disabled={loading}
						className="w-full bg-black text-white py-3.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
					>
						{loading ? (
							<span className="flex items-center justify-center gap-2">
								<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
								Weiterleitung zu Stripe...
							</span>
						) : (
							'Zur Kasse – sicher bezahlen'
						)}
					</button>
					<p className="text-center text-xs text-gray-400 mt-3">
						Sichere Zahlung über Stripe · Kreditkarte · Klarna · Giropay
					</p>
				</div>
			</div>

			<div className="text-center mt-6">
				<a href="/produkte" className="text-sm text-gray-500 hover:text-black transition-colors">
					← Weiter einkaufen
				</a>
			</div>
		</div>
	);
}
