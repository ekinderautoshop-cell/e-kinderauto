import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { getOrderByOrderNumberForUser, type D1Database } from '../../../lib/orders';

export const prerender = false;

function getBearerToken(headerValue: string | null): string | null {
	if (!headerValue) return null;
	if (!headerValue.toLowerCase().startsWith('bearer ')) return null;
	return headerValue.slice(7).trim() || null;
}

export const GET: APIRoute = async ({ params, request, locals }) => {
	const orderNumber = params.orderNumber;
	if (!orderNumber) {
		return new Response(JSON.stringify({ error: 'Bestellnummer fehlt.' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const runtime = (locals as { runtime?: { env?: Record<string, unknown> } }).runtime;
	const db = runtime?.env?.DB as D1Database | undefined;
	const supabaseUrl = (runtime?.env?.PUBLIC_SUPABASE_URL as string | undefined) ?? '';
	const supabaseKey = (runtime?.env?.PUBLIC_SUPABASE_ANON_KEY as string | undefined) ?? '';
	if (!db || !supabaseUrl || !supabaseKey) {
		return new Response(JSON.stringify({ error: 'Server-Konfiguration unvollstaendig.' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const token = getBearerToken(request.headers.get('authorization'));
	if (!token) {
		return new Response(JSON.stringify({ error: 'Nicht eingeloggt.' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const supabase = createClient(supabaseUrl, supabaseKey);
	const { data, error } = await supabase.auth.getUser(token);
	if (error || !data.user) {
		return new Response(JSON.stringify({ error: 'Ungueltige Sitzung.' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const order = await getOrderByOrderNumberForUser(db, {
		orderNumber,
		userId: data.user.id,
		email: data.user.email ?? undefined,
	});
	if (!order) {
		return new Response(JSON.stringify({ error: 'Bestellung nicht gefunden.' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	return new Response(JSON.stringify({ order }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
};
