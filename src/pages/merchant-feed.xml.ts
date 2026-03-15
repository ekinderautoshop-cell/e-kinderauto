import type { APIRoute } from 'astro';
import { ALLOWED_CATEGORY_NAMES } from '../data/shop-content';
import { products as staticProducts } from '../data/products';
import {
	getProductsFromD1,
	isErsatzteilProduct,
	isZusatzartikelProduct,
	getShortProductName,
} from '../lib/d1-products';
import { getProductUrl } from '../lib/product-url';
import { stripMitLizenz } from '../data/shop-content';

export const prerender = false;

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function stripHtml(input: string): string {
	return input.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatPrice(price: number): string {
	return `${price.toFixed(2)} EUR`;
}

export const GET: APIRoute = async ({ locals }) => {
	const runtime = (locals as { runtime?: { env?: Record<string, unknown> } }).runtime;
	const db = runtime?.env?.DB as import('../lib/d1-products').D1Database | undefined;
	const site = 'https://e-kinderauto.de';
	const allowedSet = new Set(ALLOWED_CATEGORY_NAMES);

	let allProducts = staticProducts;
	try {
		if (db) allProducts = await getProductsFromD1(db);
	} catch (error) {
		console.error('Merchant feed fallback to static products:', error);
	}

	const products = allProducts.filter(
		(p) =>
			p.category &&
			allowedSet.has(p.category) &&
			!isErsatzteilProduct(p.name) &&
			!isZusatzartikelProduct(p.name) &&
			p.image &&
			p.price > 0
	);

	const itemsXml = products
		.map((product) => {
			const title = getShortProductName(stripMitLizenz(product.name), 120);
			const descriptionSource = stripHtml(product.description || '');
			const description = descriptionSource
				? descriptionSource.slice(0, 5000)
				: `${title} im E-Kinderauto Shop.`;
			const link = new URL(getProductUrl(product), site).toString();
			const image = new URL(product.image, site).toString();
			const availability = product.inStock ? 'in stock' : 'out of stock';
			const condition = 'new';
			const brand = 'E-Kinderauto';
			const additionalImages = (product.images ?? [])
				.filter((img) => img && img !== product.image)
				.slice(0, 10)
				.map((img) => `<g:additional_image_link>${escapeXml(new URL(img, site).toString())}</g:additional_image_link>`)
				.join('');

			return `<item>
<g:id>${escapeXml(product.id)}</g:id>
<g:title>${escapeXml(title)}</g:title>
<g:description>${escapeXml(description)}</g:description>
<g:link>${escapeXml(link)}</g:link>
<g:image_link>${escapeXml(image)}</g:image_link>
${additionalImages}
<g:availability>${availability}</g:availability>
<g:price>${formatPrice(product.price)}</g:price>
<g:condition>${condition}</g:condition>
<g:brand>${escapeXml(brand)}</g:brand>
<g:identifier_exists>no</g:identifier_exists>
</item>`;
		})
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>E-Kinderauto Produktfeed</title>
<link>${site}</link>
<description>Google Merchant Center Produktfeed fuer E-Kinderauto</description>
${itemsXml}
</channel>
</rss>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=900',
		},
	});
};
