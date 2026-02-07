import { useState, useEffect } from 'react';
import type { Product } from '../types/product';
import { getBaseSku, getShortProductName, formatShippingTime } from '../lib/d1-products';
import { getCategoryDisplayName, stripMitLizenz } from '../data/shop-content';

interface ProductDetailProps {
	product: Product;
	/** Alle Varianten (z. B. Farben) – wenn gesetzt, wird Farbauswahl angezeigt und nur ein Produkt repräsentiert. */
	variants?: Product[];
}

export default function ProductDetail({ product, variants }: ProductDetailProps) {
	const [quantity, setQuantity] = useState(1);
	const [activeTab, setActiveTab] = useState('details');
	const [timeLeft, setTimeLeft] = useState('');
	const [viewers, setViewers] = useState(12);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [selectedVariant, setSelectedVariant] = useState<Product>(product);
	const [scrolledPastHero, setScrolledPastHero] = useState(false);
	const displayProduct = variants && variants.length > 1 ? selectedVariant : product;
	const displayName = getShortProductName(stripMitLizenz(displayProduct.name), 60);
	// Galerie: immer Hauptbild zuerst, dann restliche Bilder der Variante; falls nur ein Bild, Basis-Galerie als Fallback
	const variantImages = displayProduct.images?.length
		? displayProduct.images
		: displayProduct.image
			? [displayProduct.image]
			: [];
	const hasMultipleVariantImages = variantImages.length > 1;
	const baseImages = product.images?.length ? product.images : product.image ? [product.image] : [];
	const displayImages =
		hasMultipleVariantImages
			? variantImages
			: displayProduct.image
				? [
						displayProduct.image,
						...(baseImages.filter((url) => url !== displayProduct.image)),
					]
				: baseImages;
	const mainImageUrl = displayImages[selectedImageIndex] ?? displayProduct.image ?? product.image;

	const baseSku = variants?.length ? getBaseSku(variants[0]!) : product.id;
	const colorVariantsOnly = variants?.filter((v) => v.id !== baseSku) ?? [];

	const handleVariantSelect = (v: Product) => {
		setSelectedVariant(v);
		setSelectedImageIndex(0);
		if (typeof window !== 'undefined') window.history.replaceState({}, '', `/produkt/${v.id}`);
	};

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

    useEffect(() => {
        setSelectedVariant(product);
        setSelectedImageIndex(0);
    }, [product.id]);

	// Beim Runterscrollen Hero + Schwebe-Kästchen ausblenden
	useEffect(() => {
		const onScroll = () => {
			const threshold = typeof window !== 'undefined' ? window.innerHeight * 0.85 : 800;
			setScrolledPastHero(typeof window !== 'undefined' ? window.scrollY > threshold : false);
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	const addToCart = () => {
		const cart = JSON.parse(localStorage.getItem('cart') || '[]');
		const existingItem = cart.find((item: { product: Product; quantity: number }) => 
			item.product.id === displayProduct.id
		);

		if (existingItem) {
			existingItem.quantity += quantity;
		} else {
			cart.push({ product: displayProduct, quantity });
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
            {/* Hero: volle Bildschirmhöhe, Bild bedeckt alles */}
            <section className="relative w-full min-h-screen -mx-4 sm:mx-0 overflow-hidden mb-0">
                <div className="absolute inset-0 bg-gray-100">
                    <img
                        src={mainImageUrl}
                        alt={displayName}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                </div>
                {displayProduct.price > 0 && displayProduct.inStock && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm z-10">
                        -20% Sale
                    </div>
                )}
                {displayImages.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 z-10 px-4">
                        <div className="flex gap-3 overflow-x-auto pb-2 justify-center">
                            {displayImages.slice(0, 8).map((src, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setSelectedImageIndex(i)}
                                    className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 bg-white/90 backdrop-blur rounded-lg overflow-hidden cursor-pointer border-2 transition-all shadow ${selectedImageIndex === i ? 'border-black ring-1 ring-black' : 'border-white hover:border-gray-300'}`}
                                >
                                    <img src={src} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Schwebe-Kästchen Direkt kaufen (nur Desktop, verschwindet beim Runterscrollen) */}
                <div
                    className={`hidden lg:block fixed right-6 top-1/2 -translate-y-1/2 z-20 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 p-5 transition-all duration-300 ${
                        scrolledPastHero ? 'opacity-0 pointer-events-none translate-x-4' : 'opacity-100'
                    }`}
                >
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Direkt kaufen</p>
                    <p className="text-2xl font-bold text-gray-900 mb-3">{displayProduct.price.toFixed(2)} €</p>
                    {colorVariantsOnly.length > 0 && (
                        <div className="mb-3">
                            <span className="text-xs font-bold text-gray-700 block mb-1">Farbe</span>
                            <div className="flex flex-wrap gap-1">
                                {colorVariantsOnly.slice(0, 4).map((v) => (
                                    <button
                                        key={v.id}
                                        type="button"
                                        onClick={() => handleVariantSelect(v)}
                                        className={`px-2 py-1 rounded text-xs font-medium border transition-all ${selectedVariant.id === v.id ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'}`}
                                    >
                                        {(v.color ?? v.id.split('-').slice(1).join('-')) || v.id}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="flex gap-2 mb-3">
                        <div className="flex items-center border border-gray-300 w-24 h-10 rounded-lg flex-shrink-0">
                            <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 rounded-l-lg">−</button>
                            <span className="flex-1 text-center text-sm font-medium">{quantity}</span>
                            <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-8 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 rounded-r-lg">+</button>
                        </div>
                        <button
                            type="button"
                            onClick={addToCart}
                            disabled={!displayProduct.inStock}
                            className={`flex-1 h-10 text-xs uppercase font-bold tracking-widest rounded-lg ${
                                displayProduct.inStock ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {displayProduct.inStock ? 'In den Warenkorb' : 'Ausverkauft'}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500">Kostenloser Versand ab 50 €</p>
                </div>
            </section>

            {/* Zwei Spalten: erscheinen beim Runterscrollen */}
            <div className="max-w-6xl mx-auto px-4 pt-10 md:pt-12 pb-24 md:pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12">
                    {/* Links: Beschreibung, Titel, Bewertung, Text, Details/Versand-Tabs */}
                    <div className="lg:col-span-3 order-2 lg:order-1">
                        <nav className="flex text-xs text-gray-500 mb-4">
                            <a href="/" className="hover:text-black">Home</a>
                            <span className="mx-2">/</span>
                            <span className="capitalize">{getCategoryDisplayName(displayProduct.category)}</span>
                        </nav>

                        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 tracking-tight">{displayName}</h1>

                        <div className="flex items-center gap-2 mb-6">
                            <div className="flex text-yellow-400 text-sm">★★★★★</div>
                            <span className="text-sm text-gray-500 underline decoration-gray-300 underline-offset-4 cursor-pointer hover:text-black">
                                {product.rating || 124} Bewertungen lesen
                            </span>
                        </div>

                        <div className="border-t border-gray-100 pt-6 pb-6">
                            <div
                                className="product-description text-gray-600 leading-relaxed text-sm md:text-base"
                                dangerouslySetInnerHTML={{ __html: displayProduct.description || '' }}
                            />
                        </div>

                        <div className="border rounded-lg overflow-hidden">
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
                            <div className="p-4 text-sm text-gray-600 leading-relaxed min-h-[120px]">
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
                                            <strong>Lieferzeit:</strong> {formatShippingTime(displayProduct.shippingTime)} (innerhalb Deutschlands).
                                        </p>
                                        <p className="mb-2">
                                            {displayProduct.shippingCost != null && displayProduct.shippingCost > 0
                                                ? `Versandkosten: ${displayProduct.shippingCost.toFixed(2)} €`
                                                : 'Kostenloser Versand mit DHL/DPD ab 50 € Bestellwert.'}
                                        </p>
                                        <p className="mt-2">30 Tage Rückgaberecht. Kostenloser Rückversand.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Rechts: Kaufbereich (Preis, Farbe, Menge, Warenkorb) */}
                    <div className="lg:col-span-2 order-1 lg:order-2">
                        <div className="lg:sticky lg:top-24 space-y-6">
                            <div className="flex flex-wrap items-end gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <p className="text-3xl font-bold text-gray-900">
                                    {displayProduct.price.toFixed(2)} €
                                </p>
                                <p className="text-lg text-gray-400 line-through mb-1">
                                    {(displayProduct.price * 1.2).toFixed(2)} €
                                </p>
                                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded mb-1 ml-auto">
                                    Du sparst {(displayProduct.price * 0.2).toFixed(2)} €
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-orange-600 font-medium animate-pulse">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                                    <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
                                </svg>
                                <span>{viewers} Personen schauen sich dieses Produkt gerade an</span>
                            </div>

                            {colorVariantsOnly.length > 0 && (
                                <div>
                                    <span className="text-sm font-bold text-gray-900 mb-2 block">Farbe: <span className="font-normal text-gray-600">{stripMitLizenz(displayProduct.color ?? displayProduct.name.split(' - ').pop() ?? '')}</span></span>
                                    <div className="flex flex-wrap gap-2">
                                        {colorVariantsOnly.map((v) => (
                                            <button
                                                key={v.id}
                                                type="button"
                                                onClick={() => handleVariantSelect(v)}
                                                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${selectedVariant.id === v.id ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400 text-gray-700'}`}
                                            >
                                                {(v.color ?? v.id.split('-').slice(1).join('-')) || v.id}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {!variants?.length && displayProduct.color && (
                                <div>
                                    <span className="text-sm font-bold text-gray-900 mb-2 block">Farbe: <span className="font-normal text-gray-600">{displayProduct.color}</span></span>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <div className="flex items-center border border-gray-300 w-32 h-12 rounded-lg flex-shrink-0">
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
                                    disabled={!displayProduct.inStock}
                                    className={`flex-1 h-12 text-sm uppercase font-bold tracking-widest transition-all rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                                        displayProduct.inStock
                                            ? 'bg-black text-white hover:bg-gray-800'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {displayProduct.inStock ? 'In den Warenkorb' : 'Ausverkauft'}
                                </button>
                            </div>

                            <div className="bg-blue-50 text-blue-800 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
                                </svg>
                                <span>Bestelle innerhalb von <b>{timeLeft}</b> für Versand <b>HEUTE</b></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Mobile Add to Cart */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl md:hidden z-40 flex items-center gap-4 animate-slide-up">
                 <div className="hidden sm:block">
                     <p className="font-bold text-sm truncate max-w-[150px]">{displayName}</p>
                     <p className="text-sm font-medium">{displayProduct.price.toFixed(2)} €</p>
                 </div>
                 <button
                    id="sticky-add-to-cart-btn"
                    onClick={addToCart}
                    disabled={!displayProduct.inStock}
                    className={`flex-1 h-12 text-sm uppercase font-bold tracking-widest rounded-lg ${
                        displayProduct.inStock
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
