import type { APIRoute } from 'astro';
import { getOrdersForUser, type D1Database } from '../../lib/orders';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
	const runtime = (locals as { runtime?: { env?: Record<string, unknown> } }).runtime;
	const db = runtime?.env?.DB as D1Database | undefined;
	if (!db) {
		return new Response(JSON.stringify({ orders: [] }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const userId = url.searchParams.get('userId') ?? undefined;
	const email = url.searchParams.get('email') ?? undefined;
	if (!userId && !email) {
		return new Response(JSON.stringify({ orders: [] }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
		const orders = await getOrdersForUser(db, { userId, email, limit: 50 });
		return new Response(JSON.stringify({ orders }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err) {
		console.error('Failed to load orders:', err);
		return new Response(JSON.stringify({ error: 'Bestellungen konnten nicht geladen werden.' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
