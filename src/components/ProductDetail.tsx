import { useState, useEffect } from 'react';
import type { Product } from '../types/product';

interface ProductDetailProps {
	product: Product;
}

/** Lieferzeit-String aus DB lesbar machen (z. B. "1-bis-3-tage" → "1–3 Werktage"). */
function formatShippingTime(shippingTime: string | undefined): string {
	if (!shippingTime) return '2–5 Werktage';
	const t = shippingTime.toLowerCase().replace(/_/g, ' ');
	if (t.includes('1') && t.includes('3')) return '1–3 Werktage';
	if (t.includes('2') && t.includes('5')) return '2–5 Werktage';
	if (t.includes('1') && t.includes('2')) return '1–2 Werktage';
	if (t === 'sofort' || t.includes('sofort')) return 'Sofort versandfertig';
	return t.replace(/-/g, ' ');
}

export default function ProductDetail({ product }: ProductDetailProps) {
	const [quantity, setQuantity] = useState(1);
	const [activeTab, setActiveTab] = useState('details');
	const [timeLeft, setTimeLeft] = useState('');
	const [viewers, setViewers] = useState(12);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const displayImages = product.images?.length ? product.images : [product.image];
	const mainImageUrl = displayImages[selectedImageIndex] ?? product.image;

    // Countdown Timer Logic
    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const endOfDay = new Date();
            endOfDay.setHours(14, 0, 0, 0); // Shipping deadline 14:00

            if (now > endOfDay) {
                endOfDay.setDate(endOfDay.getDate() + 1);
            }

            const diff = endOfDay.getTime() - now.getTime();
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            
            setTimeLeft(`${hours} Std. ${minutes} Min.`);
        };
        
        updateTimer();
        const interval = setInterval(updateTimer, 60000);
        
        // Random viewers fluctuation
        const viewersInterval = setInterval(() => {
            setViewers(prev => Math.max(5, Math.min(25, prev + Math.floor(Math.random() * 3) - 1)));
        }, 5000);

        return () => {
            clearInterval(interval);
            clearInterval(viewersInterval);
        };
    }, []);

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

        // Feedback Animation
        const btn = document.getElementById('add-to-cart-btn');
        const stickyBtn = document.getElementById('sticky-add-to-cart-btn');
        
        [btn, stickyBtn].forEach(b => {
            if (b) {
                const originalText = b.innerText;
                b.innerText = 'Hinzugefügt ✓';
                b.classList.add('bg-green-700', 'hover:bg-green-800');
                setTimeout(() => {
                    b.innerText = originalText;
                    b.classList.remove('bg-green-700', 'hover:bg-green-800');
                }, 2000);
            }
        });
	};

	return (
		<div className="relative">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 pb-20">
                {/* Gallery Section – klickbare Bildauswahl */}
                <div className="space-y-4">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group">
                        <img
                            src={mainImageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {product.price > 0 && product.inStock && (
                            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm">
                                -20% Sale
                            </div>
                        )}
                    </div>
                    {displayImages.length > 1 && (
                        <div className="grid grid-cols-4 gap-4">
                            {displayImages.slice(0, 8).map((src, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setSelectedImageIndex(i)}
                                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selectedImageIndex === i ? 'border-black ring-1 ring-black' : 'border-transparent hover:border-gray-300'}`}
                                >
                                    <img src={src} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info Section */}
                <div className="flex flex-col justify-start pt-2">
                    {/* Breadcrumbs */}
                    <nav className="flex text-xs text-gray-500 mb-4">
                        <a href="/" className="hover:text-black">Home</a>
                        <span className="mx-2">/</span>
                        <span className="capitalize">{product.category}</span>
                    </nav>

                    <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 tracking-tight">{product.name}</h1>
                    
                    {/* Rating & Reviews */}
                    <div className="flex items-center gap-2 mb-6">
                        <div className="flex text-yellow-400 text-sm">
                            ★★★★★
                        </div>
                        <span className="text-sm text-gray-500 underline decoration-gray-300 underline-offset-4 cursor-pointer hover:text-black">
                            {product.rating || 124} Bewertungen lesen
                        </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-end gap-3 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <p className="text-3xl font-bold text-gray-900">
                            {product.price.toFixed(2)} €
                        </p>
                         <p className="text-lg text-gray-400 line-through mb-1">
                            {(product.price * 1.2).toFixed(2)} €
                        </p>
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded mb-1 ml-auto">
                            Du sparst {(product.price * 0.2).toFixed(2)} €
                        </span>
                    </div>

                    {/* Scarcity / Viewers */}
                    <div className="flex items-center gap-2 text-sm text-orange-600 font-medium mb-6 animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                            <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
                        </svg>
                        {viewers} Personen schauen sich dieses Produkt gerade an
                    </div>

                    <div className="border-t border-gray-100 py-6 mb-6">
                        <div
                            className="product-description text-gray-600 leading-relaxed text-sm md:text-base"
                            dangerouslySetInnerHTML={{ __html: product.description || '' }}
                        />
                    </div>

                    {/* Farbe nur anzeigen, wenn aus Name/DB vorhanden */}
                    {product.color && (
                        <div className="mb-6">
                            <span className="text-sm font-bold text-gray-900 mb-2 block">
                                Farbe: <span className="font-normal text-gray-600">{product.color}</span>
                            </span>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Quantity & Add to Cart */}
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex items-center border border-gray-300 w-32 h-12 rounded-lg">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 rounded-l-lg"
                                    >
                                        -
                                    </button>
                                    <input 
                                        type="text" 
                                        value={quantity} 
                                        readOnly 
                                        className="flex-1 w-full text-center font-medium border-none focus:ring-0 p-0 bg-transparent"
                                    />
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 rounded-r-lg"
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    id="add-to-cart-btn"
                                    onClick={addToCart}
                                    disabled={!product.inStock}
                                    className={`flex-1 h-12 text-sm uppercase font-bold tracking-widest transition-all rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                                        product.inStock
                                            ? 'bg-black text-white hover:bg-gray-800'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {product.inStock ? 'In den Warenkorb' : 'Ausverkauft'}
                                </button>
                            </div>
                            
                            {/* Shipping Timer */}
                            <div className="bg-blue-50 text-blue-800 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
                                </svg>
                                <span>Bestelle innerhalb von <b>{timeLeft}</b> für Versand <b>HEUTE</b></span>
                            </div>
                        </div>
                        
                        {/* Accordion / Tabs */}
                        <div className="border rounded-lg overflow-hidden mt-8">
                             <div className="flex border-b bg-gray-50">
                                 <button 
                                    onClick={() => setActiveTab('details')}
                                    className={`flex-1 py-3 text-sm font-medium ${activeTab === 'details' ? 'bg-white border-b-2 border-black text-black' : 'text-gray-500 hover:text-gray-700'}`}
                                 >
                                     Details
                                 </button>
                                 <button 
                                    onClick={() => setActiveTab('shipping')}
                                    className={`flex-1 py-3 text-sm font-medium ${activeTab === 'shipping' ? 'bg-white border-b-2 border-black text-black' : 'text-gray-500 hover:text-gray-700'}`}
                                 >
                                     Versand
                                 </button>
                             </div>
                             <div className="p-4 text-sm text-gray-600 leading-relaxed min-h-[150px]">
                                {activeTab === 'details' ? (
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>Altersempfehlung: 3-6 Jahre</li>
                                        <li>Geschwindigkeit: 3-6 km/h</li>
                                        <li>Akku: 12V 7Ah (inklusive)</li>
                                        <li>Max. Zuladung: 30kg</li>
                                        <li>Features: LED-Licht, MP3-Player, Soft-Start</li>
                                    </ul>
                                ) : (
                                    <div>
                                        <p className="mb-2">
                                            <strong>Lieferzeit:</strong> {formatShippingTime(product.shippingTime)} (innerhalb Deutschlands).
                                        </p>
                                        <p className="mb-2">
                                            {product.shippingCost != null && product.shippingCost > 0
                                                ? `Versandkosten: ${product.shippingCost.toFixed(2)} €`
                                                : 'Kostenloser Versand mit DHL/DPD ab 50 € Bestellwert.'}
                                        </p>
                                        <p className="mt-2">30 Tage Rückgaberecht. Kostenloser Rückversand.</p>
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Mobile Add to Cart */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl md:hidden z-40 flex items-center gap-4 animate-slide-up">
                 <div className="hidden sm:block">
                     <p className="font-bold text-sm truncate max-w-[150px]">{product.name}</p>
                     <p className="text-sm font-medium">{product.price.toFixed(2)} €</p>
                 </div>
                 <button
                    id="sticky-add-to-cart-btn"
                    onClick={addToCart}
                    disabled={!product.inStock}
                    className={`flex-1 h-12 text-sm uppercase font-bold tracking-widest rounded-lg ${
                        product.inStock
                            ? 'bg-black text-white hover:bg-gray-800'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    In den Warenkorb
                </button>
            </div>
        </div>
	);
}
