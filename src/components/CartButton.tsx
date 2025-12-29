import { useState, useEffect } from 'react';
import type { Product } from '../types/product';

interface CartItem {
	product: Product;
	quantity: number;
}

export default function CartButton() {
	const [cart, setCart] = useState<CartItem[]>([]);
	const [isOpen, setIsOpen] = useState(false);
    const [progress, setProgress] = useState(0);
    const FREE_SHIPPING_THRESHOLD = 50;

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

    useEffect(() => {
        const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        const percentage = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);
        setProgress(percentage);
    }, [cart]);

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
				className="text-gray-600 hover:text-black transition-colors relative p-1 group"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 group-hover:scale-110 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
				{totalItems > 0 && (
					<span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-bounce-in">
						{totalItems}
					</span>
				)}
			</button>

			{/* Backdrop */}
			{isOpen && (
				<div 
					className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
					onClick={() => setIsOpen(false)}
				/>
			)}

			{/* Slide-over Cart */}
			<div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
				<div className="flex flex-col h-full">
					<div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-4">
						    <h2 className="text-xl font-bold tracking-tight">Warenkorb ({totalItems})</h2>
						    <button 
							    onClick={() => setIsOpen(false)}
							    className="text-gray-400 hover:text-black p-2 hover:bg-gray-100 rounded-full transition-colors"
						    >
							    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
								    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
							    </svg>
						    </button>
                        </div>
                        
                        {/* Free Shipping Progress */}
                        <div className="mb-2">
                            {totalPrice >= FREE_SHIPPING_THRESHOLD ? (
                                <p className="text-sm text-green-600 font-medium mb-2 flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                                    </svg>
                                    Du hast <b>KOSTENLOSEN VERSAND</b> erreicht!
                                </p>
                            ) : (
                                <p className="text-sm text-gray-600 mb-2">
                                    Noch <b>{(FREE_SHIPPING_THRESHOLD - totalPrice).toFixed(2)} €</b> bis zum kostenlosen Versand
                                </p>
                            )}
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div 
                                    className="bg-black h-full transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
					</div>

					<div className="flex-1 overflow-y-auto p-6">
						{cart.length === 0 ? (
							<div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                    </svg>
                                </div>
								<p className="text-gray-900 font-medium text-lg">Dein Warenkorb ist leer</p>
                                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                    Sieht aus, als hättest du noch keine Produkte hinzugefügt.
                                </p>
								<button 
									onClick={() => setIsOpen(false)}
									className="mt-4 btn-primary w-full"
								>
									Jetzt einkaufen
								</button>
							</div>
						) : (
							<div className="space-y-6">
								{cart.map((item) => (
									<div key={item.product.id} className="flex gap-4 group">
										<div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
											<img
												src={item.product.image}
												alt={item.product.name}
												className="w-full h-full object-cover transition-transform group-hover:scale-105"
											/>
										</div>
										<div className="flex-1 flex flex-col justify-between py-1">
											<div>
                                                <div className="flex justify-between items-start">
												    <h3 className="font-bold text-sm text-gray-900 line-clamp-2">{item.product.name}</h3>
                                                    <button
														onClick={() => removeFromCart(item.product.id)}
														className="text-gray-400 hover:text-red-500 transition-colors ml-2"
													>
														<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                                                        </svg>
													</button>
                                                </div>
												<p className="text-gray-500 text-xs mt-1">{item.product.category}</p>
											</div>
											<div className="flex items-center justify-between mt-2">
												<div className="flex items-center border border-gray-200 rounded-lg h-8">
													<button
														onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
														className="w-8 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 rounded-l-lg"
													>
														-
													</button>
													<span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
													<button
														onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
														className="w-8 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 rounded-r-lg"
													>
														+
													</button>
												</div>
												<p className="font-bold text-sm">{(item.product.price * item.quantity).toFixed(2)} €</p>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

                    {/* Footer / Checkout */}
					{cart.length > 0 && (
						<div className="p-6 border-t border-gray-100 bg-gray-50">
                            {/* Upsell (Mock) */}
                            <div className="mb-6 bg-white p-3 rounded-lg border border-blue-100 shadow-sm flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                                     <img src="https://images.unsplash.com/photo-1623998021446-45cd96e318cf?w=200&auto=format&fit=crop" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-900">Premium Schutzhülle</p>
                                    <p className="text-[10px] text-gray-500">Nur +19,99€</p>
                                </div>
                                <button className="text-[10px] font-bold bg-gray-900 text-white px-2 py-1 rounded hover:bg-black transition-colors">
                                    + Add
                                </button>
                            </div>

							<div className="space-y-2 mb-4">
                                <div className="flex justify-between items-center text-sm">
								    <span className="text-gray-500">Zwischensumme</span>
								    <span className="font-bold text-gray-900">{totalPrice.toFixed(2)} €</span>
							    </div>
                                <div className="flex justify-between items-center text-sm">
								    <span className="text-gray-500">Versand</span>
								    <span className="font-bold text-green-600">{totalPrice >= FREE_SHIPPING_THRESHOLD ? 'Kostenlos' : '4,95 €'}</span>
							    </div>
                            </div>

							<a
								href="/checkout"
								className="block w-full bg-black text-white text-center py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 rounded-lg"
							>
								Zur Kasse
							</a>
                            
                            <div className="flex justify-center gap-2 mt-4 opacity-50 grayscale">
                                <span className="text-xs">🔒 Sichere Bezahlung mit SSL</span>
                            </div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
