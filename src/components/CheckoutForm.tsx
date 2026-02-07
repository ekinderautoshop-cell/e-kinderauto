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
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		address: '',
		city: '',
		zip: '',
		country: 'Deutschland',
	});

	useEffect(() => {
		const savedCart = localStorage.getItem('cart');
		if (savedCart) {
			setCart(JSON.parse(savedCart));
		}
	}, []);

	const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// In a real app, you would send this to a Cloudflare Worker or API
		alert('Bestellung erfolgreich! (Dies ist eine Demo)');
		localStorage.removeItem('cart');
		window.dispatchEvent(new Event('cartUpdated'));
		window.location.href = '/';
	};

	if (cart.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-xl text-gray-600 mb-4">Ihr Warenkorb ist leer</p>
				<a href="/" className="text-blue-600 hover:text-blue-700">
					Zurück zum Shop
				</a>
			</div>
		);
	}

	return (
		<div className="grid md:grid-cols-2 gap-8">
			<div className="bg-white rounded-lg shadow-md p-6">
				<h2 className="text-2xl font-bold mb-6">Bestellübersicht</h2>
				<div className="space-y-4 mb-6">
					{cart.map((item) => (
						<div key={item.product.id} className="flex gap-4 border-b pb-4">
							<img
								src={item.product.image}
								alt={getShortProductName(stripMitLizenz(item.product.name))}
								className="w-20 h-20 object-cover rounded"
							/>
							<div className="flex-1">
								<h3 className="font-semibold">{getShortProductName(stripMitLizenz(item.product.name))}</h3>
								<p className="text-gray-600 text-sm">
									Menge: {item.quantity} × {item.product.price.toFixed(2)} €
								</p>
								<p className="font-semibold">
									{(item.product.price * item.quantity).toFixed(2)} €
								</p>
							</div>
						</div>
					))}
				</div>
				<div className="border-t pt-4">
					<div className="flex justify-between text-xl font-bold">
						<span>Gesamt:</span>
						<span>{totalPrice.toFixed(2)} €</span>
					</div>
				</div>
			</div>

			<div className="bg-white rounded-lg shadow-md p-6">
				<h2 className="text-2xl font-bold mb-6">Lieferadresse</h2>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-1">Name</label>
						<input
							type="text"
							required
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">E-Mail</label>
						<input
							type="email"
							required
							value={formData.email}
							onChange={(e) => setFormData({ ...formData, email: e.target.value })}
							className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Straße & Hausnummer</label>
						<input
							type="text"
							required
							value={formData.address}
							onChange={(e) => setFormData({ ...formData, address: e.target.value })}
							className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium mb-1">PLZ</label>
							<input
								type="text"
								required
								value={formData.zip}
								onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
								className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Stadt</label>
							<input
								type="text"
								required
								value={formData.city}
								onChange={(e) => setFormData({ ...formData, city: e.target.value })}
								className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Land</label>
						<select
							value={formData.country}
							onChange={(e) => setFormData({ ...formData, country: e.target.value })}
							className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						>
							<option>Deutschland</option>
							<option>Österreich</option>
							<option>Schweiz</option>
						</select>
					</div>
					<button
						type="submit"
						className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
					>
						Bestellung abschicken
					</button>
				</form>
			</div>
		</div>
	);
}

