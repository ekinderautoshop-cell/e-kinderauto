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
		const savedCart = localStorage.getItem('cart');
		if (savedCart) {
			setCart(JSON.parse(savedCart));
		}

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
				onClick={() => setIsOpen(true)}
				className="text-gray-600 hover:text-black transition-colors relative p-1"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
				{totalItems > 0 && (
					<span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
						{totalItems}
					</span>
				)}
			</button>

			{/* Backdrop */}
			{isOpen && (
				<div 
					className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity"
					onClick={() => setIsOpen(false)}
				/>
			)}

			{/* Slide-over Cart */}
			<div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
				<div className="flex flex-col h-full">
					<div className="p-6 border-b border-gray-100 flex items-center justify-between">
						<h2 className="text-xl font-bold tracking-tight">Warenkorb</h2>
						<button 
							onClick={() => setIsOpen(false)}
							className="text-gray-400 hover:text-black p-2"
						>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
								<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					<div className="flex-1 overflow-y-auto p-6">
						{cart.length === 0 ? (
							<div className="h-full flex flex-col items-center justify-center text-center space-y-4">
								<p className="text-gray-500">Dein Warenkorb ist noch leer.</p>
								<button 
									onClick={() => setIsOpen(false)}
									className="text-black underline font-medium hover:text-gray-600"
								>
									Weiter einkaufen
								</button>
							</div>
						) : (
							<div className="space-y-6">
								{cart.map((item) => (
									<div key={item.product.id} className="flex gap-4">
										<div className="w-24 h-24 bg-gray-50 rounded-md overflow-hidden flex-shrink-0 border border-gray-100">
											<img
												src={item.product.image}
												alt={item.product.name}
												className="w-full h-full object-cover"
											/>
										</div>
										<div className="flex-1 flex flex-col justify-between">
											<div>
												<h3 className="font-medium text-sm text-gray-900">{item.product.name}</h3>
												<p className="text-gray-500 text-sm mt-1">{item.product.category}</p>
											</div>
											<div className="flex items-center justify-between">
												<div className="flex items-center border border-gray-200 rounded-sm">
													<button
														onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
														className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600"
													>
														-
													</button>
													<span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
													<button
														onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
														className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600"
													>
														+
													</button>
												</div>
												<p className="font-medium text-sm">{(item.product.price * item.quantity).toFixed(2)} €</p>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					{cart.length > 0 && (
						<div className="p-6 border-t border-gray-100 bg-gray-50">
							<div className="flex justify-between items-center mb-4">
								<span className="text-sm font-medium text-gray-500">Zwischensumme</span>
								<span className="text-lg font-bold">{totalPrice.toFixed(2)} €</span>
							</div>
							<p className="text-xs text-gray-400 mb-4 text-center">Steuern und Versand werden beim Checkout berechnet.</p>
							<a
								href="/checkout"
								className="block w-full bg-black text-white text-center py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
							>
								Zur Kasse
							</a>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
