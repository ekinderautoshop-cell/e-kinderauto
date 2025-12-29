import { useState, useEffect } from 'react';
import type { Product } from '../types/product';

interface CartItem {
	product: Product;
	quantity: number;
}

export default function CartButton() {
	const [cart, setCart] = useState<CartItem[]>([]);
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		// Load cart from localStorage
		const savedCart = localStorage.getItem('cart');
		if (savedCart) {
			setCart(JSON.parse(savedCart));
		}

		// Listen for cart updates
		const handleCartUpdate = () => {
			const updatedCart = localStorage.getItem('cart');
			if (updatedCart) {
				setCart(JSON.parse(updatedCart));
			}
		};

		window.addEventListener('cartUpdated', handleCartUpdate);
		return () => window.removeEventListener('cartUpdated', handleCartUpdate);
	}, []);

	const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
	const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

	const removeFromCart = (productId: string) => {
		const updatedCart = cart.filter(item => item.product.id !== productId);
		setCart(updatedCart);
		localStorage.setItem('cart', JSON.stringify(updatedCart));
		window.dispatchEvent(new Event('cartUpdated'));
	};

	const updateQuantity = (productId: string, quantity: number) => {
		if (quantity <= 0) {
			removeFromCart(productId);
			return;
		}
		const updatedCart = cart.map(item =>
			item.product.id === productId ? { ...item, quantity } : item
		);
		setCart(updatedCart);
		localStorage.setItem('cart', JSON.stringify(updatedCart));
		window.dispatchEvent(new Event('cartUpdated'));
	};

	return (
		<div className="relative">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="relative bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
			>
				🛒 Warenkorb
				{totalItems > 0 && (
					<span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
						{totalItems}
					</span>
				)}
			</button>

			{isOpen && (
				<>
					<div
						className="fixed inset-0 z-40"
						onClick={() => setIsOpen(false)}
					/>
					<div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 max-h-[80vh] overflow-y-auto">
						<div className="p-4 border-b">
							<h3 className="text-lg font-bold">Warenkorb</h3>
						</div>
						{cart.length === 0 ? (
							<div className="p-8 text-center text-gray-500">
								Ihr Warenkorb ist leer
							</div>
						) : (
							<>
								<div className="p-4 space-y-4">
									{cart.map((item) => (
										<div key={item.product.id} className="flex gap-4 border-b pb-4">
											<img
												src={item.product.image}
												alt={item.product.name}
												className="w-20 h-20 object-cover rounded"
											/>
											<div className="flex-1">
												<h4 className="font-semibold">{item.product.name}</h4>
												<p className="text-gray-600 text-sm">
													{(item.product.price * item.quantity).toFixed(2)} €
												</p>
												<div className="flex items-center gap-2 mt-2">
													<button
														onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
														className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
													>
														-
													</button>
													<span className="w-8 text-center">{item.quantity}</span>
													<button
														onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
														className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
													>
														+
													</button>
													<button
														onClick={() => removeFromCart(item.product.id)}
														className="ml-auto text-red-500 hover:text-red-700 text-sm"
													>
														Entfernen
													</button>
												</div>
											</div>
										</div>
									))}
								</div>
								<div className="p-4 border-t bg-gray-50">
									<div className="flex justify-between items-center mb-4">
										<span className="font-bold text-lg">Gesamt:</span>
										<span className="font-bold text-lg">{totalPrice.toFixed(2)} €</span>
									</div>
									<a
										href="/checkout"
										onClick={() => setIsOpen(false)}
										className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors"
									>
										Zur Kasse
									</a>
								</div>
							</>
						)}
					</div>
				</>
			)}
		</div>
	);
}

