import type { Product } from '../types/product';
import { categoryToSlug } from '../data/shop-content';
import { stripMitLizenz } from '../data/shop-content';

/** Slug nur aus dem angezeigten Produktnamen (wie Kunden ihn sehen). */
export function getProductSlug(product: Product): string {
	return categoryToSlug(stripMitLizenz(product.name));
}

/** Produkt-URL nur mit Namen: /produkt/porsche-911-ruf */
export function getProductUrl(product: Product): string {
	const slug = getProductSlug(product);
	return slug ? `/produkt/${slug}` : `/produkt/${product.id}`;
}
