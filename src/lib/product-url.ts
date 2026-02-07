import type { Product } from '../types/product';
import { categoryToSlug } from '../data/shop-content';
import { stripMitLizenz } from '../data/shop-content';

/** Produkt-URL mit Namen im Pfad: /produkt/porsche-911-ruf--ET5810 (alt: /produkt/ET5810 wird weiterhin erkannt). */
export function getProductUrl(product: Product): string {
	const nameSlug = categoryToSlug(stripMitLizenz(product.name));
	return nameSlug ? `/produkt/${nameSlug}--${product.id}` : `/produkt/${product.id}`;
}

/** ID aus Slug-Parameter holen (neu: name--ID, alt: nur ID). */
export function extractProductIdFromSlug(slug: string): string {
	if (slug.includes('--')) {
		const id = slug.split('--').pop();
		return id ?? slug;
	}
	return slug;
}
