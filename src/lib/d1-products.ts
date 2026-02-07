import type { Product } from '../types/product';

/** Zeile aus der D1-Tabelle `products` */
export interface D1ProductRow {
	sku: string;
	name: string | null;
	description: string | null;
	main_image: string | null;
	images: string | null; // JSON-Array als String
	category: string | null;
	manufacturer: string | null;
	parent_sku: string | null;
	price_b2b: number | null;
	uvp: number | null;
	quantity: number | null;
	tax: number | null;
	ean: string | null;
	status: string | null;
	shipping_time: string | null;
	shipping_cost: number | null;
	updated_at: number | null;
}

/** D1-Datenbank-Binding (Cloudflare) */
export interface D1Database {
	prepare(query: string): D1PreparedStatement;
}

export interface D1PreparedStatement {
	bind(...values: unknown[]): D1PreparedStatement;
	all<T = unknown>(): Promise<{ results: T[] }>;
	first<T = unknown>(): Promise<T | null>;
}

/**
 * Mappt eine D1-Zeile auf das Frontend-Product-Format.
 */
export function mapD1RowToProduct(row: D1ProductRow): Product {
	const imagesJson = row.images ? tryParseImages(row.images) : [];
	const mainImage = row.main_image ?? (imagesJson.length > 0 ? imagesJson[0] : '');
	const price = row.uvp ?? row.price_b2b ?? 0;
	const qty = row.quantity ?? 0;
	const inStock = qty > 0 || (row.status?.toLowerCase() === 'instock');

	return {
		id: row.sku,
		name: row.name ?? 'Unbekannt',
		description: row.description ?? '',
		price: Math.round(price * 100) / 100,
		image: mainImage,
		category: row.category ?? '',
		inStock,
	};
}

function tryParseImages(images: string): string[] {
	try {
		const parsed = JSON.parse(images);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

/**
 * Lädt alle Produkte aus D1 (mit Lagerbestand bevorzugt).
 */
export async function getProductsFromD1(db: D1Database, limit = 100): Promise<Product[]> {
	const stmt = db
		.prepare(
			'SELECT * FROM products WHERE (quantity IS NULL OR quantity > 0) ORDER BY updated_at DESC LIMIT ?'
		)
		.bind(limit);
	const { results } = await stmt.all<D1ProductRow>();
	return (results ?? []).map(mapD1RowToProduct);
}

/**
 * Lädt ein Produkt anhand der SKU aus D1.
 */
export async function getProductBySkuFromD1(db: D1Database, sku: string): Promise<Product | null> {
	const stmt = db.prepare('SELECT * FROM products WHERE sku = ? LIMIT 1').bind(sku);
	const row = await stmt.first<D1ProductRow>();
	return row ? mapD1RowToProduct(row as D1ProductRow) : null;
}
