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
 * Berücksichtigt DB-Format: images als JSON (evtl. mit ""-Escaping), description mit HTML.
 */
export function mapD1RowToProduct(row: D1ProductRow): Product {
	const imagesArr = row.images ? tryParseImages(row.images) : [];
	const mainImage = row.main_image ?? (imagesArr.length > 0 ? imagesArr[0] : '');
	const allImages =
		mainImage && !imagesArr.includes(mainImage)
			? [mainImage, ...imagesArr]
			: imagesArr.length > 0
				? imagesArr
				: mainImage
					? [mainImage]
					: [];
	const price = row.uvp ?? row.price_b2b ?? 0;
	const qty = row.quantity ?? 0;
	const status = row.status?.toLowerCase();
	const inStock = qty > 0 || status === 'instock';

	const name = row.name ?? 'Unbekannt';
	const shippingCost =
		row.shipping_cost != null ? Math.round(row.shipping_cost * 100) / 100 : undefined;

	return {
		id: row.sku,
		name,
		description: normalizeDescriptionHtml(row.description ?? ''),
		price: Math.round(price * 100) / 100,
		image: mainImage,
		images: allImages.length > 0 ? allImages : undefined,
		category: row.category ?? '',
		inStock,
		shippingTime: row.shipping_time ?? undefined,
		shippingCost,
		color: parseColorFromName(name),
	};
}

/** Versucht, die Farbe aus dem Produktnamen zu lesen (z. B. "... - Grau"). */
function parseColorFromName(name: string): string | undefined {
	const match = name.match(/\s+-\s+([A-Za-zäöüÄÖÜß0-9\s]+)$/);
	if (!match) return undefined;
	const part = match[1].trim();
	if (!part) return undefined;
	const lower = part.toLowerCase();
	if (lower === 'l/r' || lower === 'l' || lower === 'r' || /^\d+$/.test(part)) return undefined;
	return part;
}

/** JSON-Array von Bild-URLs parsen; verträgt ""-Escaping wie aus CSV/Export. */
function tryParseImages(images: string): string[] {
	let str = images.trim();
	try {
		let parsed = JSON.parse(str);
		if (Array.isArray(parsed)) return parsed.filter((u): u is string => typeof u === 'string');
		return [];
	} catch {
		if (str.includes('""')) {
			try {
				const fixed = str.replace(/""/g, '"');
				const parsed = JSON.parse(fixed);
				if (Array.isArray(parsed)) return parsed.filter((u): u is string => typeof u === 'string');
			} catch {
				// ignore
			}
		}
		return [];
	}
}

/** HTML in Beschreibungen normalisieren (z. B. "" -> " für gültige style-Attribute). */
function normalizeDescriptionHtml(html: string): string {
	if (!html) return '';
	return html.replace(/""/g, '"');
}

/**
 * Lädt alle Produkte aus D1 (ohne Filter, für Anzeige aller Artikel).
 */
export async function getProductsFromD1(db: D1Database, limit = 1000): Promise<Product[]> {
	const stmt = db
		.prepare('SELECT * FROM products ORDER BY updated_at DESC LIMIT ?')
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

/** Basis-SKU für Gruppierung (z. B. ET5771-Grau → ET5771, ET471 → ET471). */
export function getBaseSku(product: Product): string {
	return product.id.includes('-') ? product.id.split('-')[0]! : product.id;
}

/** Entfernt Farb-/Varianten-Suffix aus dem Namen für die Gruppenanzeige. */
export function getBaseProductName(product: Product): string {
	if (!product.color) return product.name;
	const suffix = ` - ${product.color}`;
	return product.name.endsWith(suffix) ? product.name.slice(0, -suffix.length) : product.name;
}

/**
 * Kürzt Produktnamen für die Anzeige in Karten/Listen.
 * - Nutzt Modell in Anführungszeichen (z. B. "Lamborghini Huracan STO Drift") als Kurzname
 * - Sonst: erster Teil vor " - " (z. B. "Elektro Kindermotorrad 888")
 * - Entfernt Farb-Suffix, begrenzt Länge
 */
export function getShortProductName(fullName: string, maxLength = 52): string {
	if (!fullName.trim()) return fullName;
	let name = fullName.trim();
	const colorSuffix = name.match(/\s+-\s*[A-Za-zäöüÄÖÜß0-9\s]+$/);
	if (colorSuffix) name = name.slice(0, -colorSuffix[0].length).trim();
	const quoted = name.match(/"([^"]+)"/);
	if (quoted) {
		name = quoted[1]!.trim();
	} else {
		const firstPart = name.split(/\s+-\s+/)[0];
		name = (firstPart ?? name).trim();
	}
	if (name.length > maxLength) name = name.slice(0, maxLength - 1).trim() + '…';
	return name;
}

/**
 * Gruppiert Produkte nach Basis-SKU (ein Eintrag pro Modell, Varianten zusammengefasst).
 * Gibt ein Repräsentanten-Produkt pro Gruppe zurück (Basis-SKU bevorzugt, sonst erste Variante).
 */
export function groupProductsByBase(products: Product[]): Product[] {
	const byBase = new Map<string, Product[]>();
	for (const p of products) {
		const base = getBaseSku(p);
		if (!byBase.has(base)) byBase.set(base, []);
		byBase.get(base)!.push(p);
	}
	const result: Product[] = [];
	for (const variants of byBase.values()) {
		const baseSku = getBaseSku(variants[0]!);
		const main = variants.find((v) => v.id === baseSku) ?? variants[0]!;
		result.push({
			...main,
			id: baseSku,
			name: getBaseProductName(main),
			inStock: variants.some((v) => v.inStock),
			price: Math.min(...variants.map((v) => v.price)),
		});
	}
	return result;
}

/**
 * Lädt alle Varianten eines Produkts (Basis-SKU + alle SKU-Farbvarianten).
 */
export async function getProductVariantsByBaseSku(
	db: D1Database,
	baseSku: string
): Promise<Product[]> {
	const pattern = `${baseSku}-%`;
	const stmt = db
		.prepare('SELECT * FROM products WHERE sku = ? OR sku LIKE ? ORDER BY sku')
		.bind(baseSku, pattern);
	const { results } = await stmt.all<D1ProductRow>();
	return (results ?? []).map((row) => mapD1RowToProduct(row as D1ProductRow));
}
