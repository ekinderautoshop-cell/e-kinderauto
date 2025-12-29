import { useState } from 'react';
import type { Product } from '../types/product';

interface ProductDetailProps {
	product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
	const [quantity, setQuantity] = useState(1);

	const addToCart = () => {
		const cart = JSON.parse(localStorage.getItem('cart') || '[]');
		const existingItem = cart.find((item: { product: Product; quantity: number }) => 
			item.product.id === product.id
		);

		if (existingItem) {
			existingItem.quantity += quantity;
		} else {
			cart.push({ product, quantity });
		}

		localStorage.setItem('cart', JSON.stringify(cart));
		window.dispatchEvent(new Event('cartUpdated'));

		// Show notification
		const notification = document.createElement('div');
		notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
		notification.textContent = `${quantity} x ${product.name} zum Warenkorb hinzugefügt!`;
		document.body.appendChild(notification);
		setTimeout(() => notification.remove(), 3000);
	};

	return (
		<div className="max-w-6xl mx-auto">
			<a href="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
				← Zurück zur Übersicht
			</a>
			<div className="grid md:grid-cols-2 gap-8 bg-white rounded-lg shadow-lg p-8">
				<div>
					<img
						src={product.image}
						alt={product.name}
						className="w-full h-auto rounded-lg"
					/>
				</div>
				<div>
					<h1 className="text-3xl font-bold mb-4">{product.name}</h1>
					<div className="mb-4">
						{product.rating && (
							<div className="flex items-center gap-2 mb-2">
								<span className="text-yellow-400">⭐</span>
								<span className="font-semibold">{product.rating} / 5.0</span>
							</div>
						)}
						<span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
							{product.category}
						</span>
					</div>
					<p className="text-4xl font-bold text-blue-600 mb-6">
						{product.price.toFixed(2)} €
					</p>
					<p className="text-gray-700 mb-6 leading-relaxed">
						{product.description}
					</p>
					<div className="mb-6">
						<label className="block text-sm font-medium mb-2">Menge:</label>
						<div className="flex items-center gap-4">
							<button
								onClick={() => setQuantity(Math.max(1, quantity - 1))}
								className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
							>
								-
							</button>
							<span className="text-xl font-semibold w-12 text-center">{quantity}</span>
							<button
								onClick={() => setQuantity(quantity + 1)}
								className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
							>
								+
							</button>
						</div>
					</div>
					<button
						onClick={addToCart}
						disabled={!product.inStock}
						className={`w-full py-3 rounded-lg font-semibold text-lg transition-colors ${
							product.inStock
								? 'bg-blue-600 text-white hover:bg-blue-700'
								: 'bg-gray-300 text-gray-500 cursor-not-allowed'
						}`}
					>
						{product.inStock ? 'In den Warenkorb' : 'Ausverkauft'}
					</button>
					{product.inStock && (
						<p className="text-green-600 mt-2 text-sm">✓ Auf Lager</p>
					)}
				</div>
			</div>
		</div>
	);
}

