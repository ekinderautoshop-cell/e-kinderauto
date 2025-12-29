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

		// Show notification (simple alert for now or a toast)
        const btn = document.getElementById('add-to-cart-btn');
        if (btn) {
            const originalText = btn.innerText;
            btn.innerText = 'Hinzugefügt ✓';
            btn.classList.add('bg-green-700', 'hover:bg-green-800');
            setTimeout(() => {
                btn.innerText = originalText;
                btn.classList.remove('bg-green-700', 'hover:bg-green-800');
            }, 2000);
        }
	};

	return (
		<div className="grid md:grid-cols-2 gap-12 lg:gap-16">
            {/* Gallery Section */}
			<div className="space-y-4">
                <div className="aspect-square bg-gray-100 rounded-sm overflow-hidden">
				    <img
					    src={product.image}
					    alt={product.name}
					    className="w-full h-full object-cover"
				    />
                </div>
                <div className="grid grid-cols-4 gap-4">
                    {/* Placeholder thumbnails */}
                     <div className="aspect-square bg-gray-100 rounded-sm overflow-hidden cursor-pointer opacity-100 border-2 border-black">
				        <img src={product.image} alt="" className="w-full h-full object-cover" />
                     </div>
                     <div className="aspect-square bg-gray-100 rounded-sm overflow-hidden cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
				        <img src={product.image} alt="" className="w-full h-full object-cover" />
                     </div>
                </div>
			</div>

            {/* Product Info Section */}
			<div className="flex flex-col justify-start pt-4">
                <div className="mb-2 text-sm text-gray-500 uppercase tracking-widest font-medium">
                    {product.category}
                </div>
				<h1 className="text-4xl font-bold mb-4 text-gray-900 tracking-tight">{product.name}</h1>
				
                <div className="flex items-end gap-4 mb-8">
				    <p className="text-2xl font-medium text-gray-900">
					    {product.price.toFixed(2)} €
				    </p>
                    {product.rating && (
                        <div className="flex items-center gap-1 mb-1 text-sm text-gray-600">
                            <span className="text-yellow-400">★★★★★</span>
                            <span className="ml-1">({product.rating} Bewertungen)</span>
                        </div>
                    )}
                </div>

                <div className="border-t border-b border-gray-100 py-6 mb-8">
				    <p className="text-gray-600 leading-relaxed">
					    {product.description}
				    </p>
                </div>

				<div className="space-y-6">
                    {/* Quantity & Add to Cart */}
                    <div className="space-y-4">
					    <label className="block text-xs font-bold uppercase tracking-wide text-gray-900">Menge</label>
                        <div className="flex gap-4">
                            <div className="flex items-center border border-gray-300 w-32 h-12">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600"
                                >
                                    -
                                </button>
                                <input 
                                    type="text" 
                                    value={quantity} 
                                    readOnly 
                                    className="flex-1 w-full text-center font-medium border-none focus:ring-0 p-0"
                                />
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600"
                                >
                                    +
                                </button>
                            </div>
                            <button
                                id="add-to-cart-btn"
                                onClick={addToCart}
                                disabled={!product.inStock}
                                className={`flex-1 h-12 text-sm uppercase font-bold tracking-widest transition-colors ${
                                    product.inStock
                                        ? 'bg-black text-white hover:bg-gray-800'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {product.inStock ? 'In den Warenkorb' : 'Ausverkauft'}
                            </button>
                        </div>
                    </div>
                    
                    {/* Trust Badges */}
                    <div className="grid grid-cols-2 gap-4 pt-6">
                         <div className="flex items-center gap-3">
                             <div className="bg-gray-100 p-2 rounded-full">
                                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
                             </div>
                             <span className="text-sm text-gray-600">Auf Lager & Lieferbar</span>
                         </div>
                         <div className="flex items-center gap-3">
                             <div className="bg-gray-100 p-2 rounded-full">
                                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                             </div>
                             <span className="text-sm text-gray-600">Kostenloser Versand</span>
                         </div>
                    </div>
				</div>
			</div>
		</div>
	);
}
