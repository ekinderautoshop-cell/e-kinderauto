import { useState, useEffect } from 'react';
import type { Product } from '../types/product';

interface ProductCardProps {
	product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
	const addToCart = () => {
		const cart = JSON.parse(localStorage.getItem('cart') || '[]');
		const existingItem = cart.find((item: { product: Product; quantity: number }) => 
			item.product.id === product.id
		);

		if (existingItem) {
			existingItem.quantity += 1;
		} else {
			cart.push({ product, quantity: 1 });
		}

		localStorage.setItem('cart', JSON.stringify(cart));
		window.dispatchEvent(new Event('cartUpdated'));

		// Show notification
		const notification = document.createElement('div');
		notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
		notification.textContent = 'Produkt zum Warenkorb hinzugefügt!';
		document.body.appendChild(notification);
		setTimeout(() => notification.remove(), 3000);
	};

	return (
		<div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
			<a href={`/produkt/${product.id}`}>
				<img
					src={product.image}
					alt={product.name}
					className="w-full h-64 object-cover"
				/>
			</a>
			<div className="p-4">
				<a href={`/produkt/${product.id}`}>
					<h3 className="text-xl font-semibold mb-2 hover:text-blue-600">
						{product.name}
					</h3>
				</a>
				<p className="text-gray-600 text-sm mb-3 line-clamp-2">
					{product.description}
				</p>
				<div className="flex items-center justify-between">
					<div>
						<p className="text-2xl font-bold text-blue-600">
							{product.price.toFixed(2)} €
						</p>
						{product.rating && (
							<p className="text-sm text-gray-500">
								⭐ {product.rating} / 5.0
							</p>
						)}
					</div>
					<button
						onClick={addToCart}
						disabled={!product.inStock}
						className={`px-4 py-2 rounded-lg font-medium transition-colors ${
							product.inStock
								? 'bg-blue-600 text-white hover:bg-blue-700'
								: 'bg-gray-300 text-gray-500 cursor-not-allowed'
						}`}
					>
						{product.inStock ? 'In den Warenkorb' : 'Ausverkauft'}
					</button>
				</div>
			</div>
		</div>
	);
}

