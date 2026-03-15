import type { APIRoute } from 'astro';
import { categoriesWithImages, ALLOWED_CATEGORY_NAMES } from '../data/shop-content';
import { products as staticProducts } from '../data/products';
import { getProductsFromD1, isErsatzteilProduct, isZusatzartikelProduct } from '../lib/d1-products';
import { getProductUrl } from '../lib/product-url';

export const prerender = false;

function toAbsoluteUrl(baseUrl: string, path: string): string {
	return new URL(path, baseUrl).toString();
}

function xmlEscape(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ locals, url }) => {
	const runtime = (locals as { runtime?: { env?: Record<string, unknown> } }).runtime;
	const db = runtime?.env?.DB as import('../lib/d1-products').D1Database | undefined;
	const site = 'https://e-kinderauto.de';

	const publicPages = [
		'/',
		'/produkte',
		'/kategorien',
		'/zusatzartikel',
		'/kontakt',
		'/impressum',
		'/datenschutz',
		'/agb',
		'/widerruf',
		'/unsere-geschichte',
		'/nachhaltigkeit',
		'/karriere',
	];

	const categoryPages = categoriesWithImages.map((c) => c.url);
	const allowedSet = new Set(ALLOWED_CATEGORY_NAMES);
	const allRaw = db ? await getProductsFromD1(db) : staticProducts;
	const productPages = allRaw
		.filter(
			(p) =>
				p.category &&
				allowedSet.has(p.category) &&
				!isErsatzteilProduct(p.name) &&
				!isZusatzartikelProduct(p.name)
		)
		.map((p) => getProductUrl(p));

	const allPaths = [...publicPages, ...categoryPages, ...productPages];
	const uniquePaths = [...new Set(allPaths)];
	const lastmod = new Date().toISOString();

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniquePaths
	.map((path) => {
		const loc = xmlEscape(toAbsoluteUrl(site || url.origin, path));
		return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
	})
	.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=900',
		},
	});
};
