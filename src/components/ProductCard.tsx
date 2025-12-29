import type { Product } from '../types/product';

interface ProductCardProps {
	product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
	return (
		<div className="group">
            {/* Image Container */}
			<div className="relative aspect-square bg-gray-100 mb-4 overflow-hidden rounded-sm">
				<a href={`/produkt/${product.id}`} className="block w-full h-full">
					<img
						src={product.image}
						alt={product.name}
						className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
					/>
				</a>
                {/* Badges */}
                {!product.inStock && (
                    <div className="absolute top-2 left-2 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-900">
                        Ausverkauft
                    </div>
                )}
                {product.price < 200 && product.inStock && (
                     <div className="absolute top-2 left-2 bg-black text-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                        Sale
                    </div>
                )}
			</div>

            {/* Product Info */}
			<div>
				<h3 className="text-sm font-medium text-gray-900 group-hover:underline decoration-1 underline-offset-4">
                    <a href={`/produkt/${product.id}`}>
					    {product.name}
                    </a>
				</h3>
				<div className="flex items-center gap-2 mt-1">
					<p className="text-sm font-semibold text-gray-900">
						{product.price.toFixed(2)} €
					</p>
                    {product.price < 200 && (
                        <p className="text-sm text-gray-400 line-through">
                            {(product.price * 1.2).toFixed(2)} €
                        </p>
                    )}
				</div>
			</div>
		</div>
	);
}
