import type { APIRoute } from 'astro';
import Stripe from 'stripe';

export const prerender = false;

interface CartItem {
	product: {
		id: string;
		name: string;
		price: number;
		image?: string;
	};
	quantity: number;
}

export const POST: APIRoute = async ({ request, locals, url }) => {
	const runtime = (locals as any).runtime;
	const stripeKey = runtime?.env?.STRIPE_SECRET_KEY ?? import.meta.env.STRIPE_SECRET_KEY ?? '';

	if (!stripeKey) {
		return new Response(JSON.stringify({ error: 'Stripe ist nicht konfiguriert.' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const stripe = new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' as any });

	let body: { items: CartItem[] };
	try {
		body = await request.json();
	} catch {
		return new Response(JSON.stringify({ error: 'Ungültige Anfrage.' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const { items } = body;
	if (!items?.length) {
		return new Response(JSON.stringify({ error: 'Warenkorb ist leer.' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const origin = url.origin;

	try {
		const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
			price_data: {
				currency: 'eur',
				product_data: {
					name: item.product.name,
					...(item.product.image ? { images: [item.product.image] } : {}),
				},
				unit_amount: Math.round(item.product.price * 100),
			},
			quantity: item.quantity,
		}));

		const session = await stripe.checkout.sessions.create({
			mode: 'payment',
			payment_method_types: ['card', 'klarna', 'giropay'],
			line_items: lineItems,
			shipping_address_collection: {
				allowed_countries: ['DE', 'AT', 'CH'],
			},
			locale: 'de',
			success_url: `${origin}/bestellung-erfolgreich?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${origin}/checkout`,
		});

		return new Response(JSON.stringify({ url: session.url }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err: any) {
		console.error('Stripe checkout error:', err);
		return new Response(JSON.stringify({ error: err.message || 'Fehler beim Erstellen der Checkout-Session.' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
