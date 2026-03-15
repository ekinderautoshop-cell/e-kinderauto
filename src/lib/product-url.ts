import type { Product } from '../types/product';
import { categoryToSlug } from '../data/shop-content';
import { stripMitLizenz } from '../data/shop-content';

/** Slug nur aus dem angezeigten Produktnamen (wie Kunden ihn sehen). */
export function getBaseProductSlug(product: Product): string {
	return categoryToSlug(stripMitLizenz(product.name));
}

function shortSkuHash(sku: string): string {
	let h = 0;
	for (let i = 0; i < sku.length; i += 1) h = (h * 31 + sku.charCodeAt(i)) >>> 0;
	return h.toString(36).slice(0, 4);
}

/**
 * Kollisionssicherer Produkt-Slug:
 * - Primär Name
 * - Ergänzt kurze SKU-Hash-Suffix, damit jedes Produkt eine eindeutige URL bekommt
 */
export function getProductSlug(product: Product): string {
	const base = getBaseProductSlug(product);
	if (!base) return product.id.toLowerCase();
	const suffix = shortSkuHash(product.id);
	return `${base}-${suffix}`;
}

/** Produkt-URL mit stabiler, eindeutiger Slug-Form */
export function getProductUrl(product: Product): string {
	const slug = getProductSlug(product);
	return slug ? `/produkt/${slug}` : `/produkt/${product.id}`;
}
