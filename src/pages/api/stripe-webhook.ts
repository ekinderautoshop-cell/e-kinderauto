import type { APIRoute } from 'astro';
import type Stripe from 'stripe';
import { trackBrevoEvent, upsertBrevoContact } from '../../lib/brevo';

export const prerender = false;

function parseStripeSignature(signatureHeader: string): { timestamp: string; signatures: string[] } | null {
	const parts = signatureHeader.split(',');
	const timestamp = parts.find((p) => p.startsWith('t='))?.slice(2) ?? '';
	const signatures = parts.filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
	if (!timestamp || signatures.length === 0) return null;
	return { timestamp, signatures };
}

function hexToBytes(hex: string): Uint8Array {
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < hex.length; i += 2) {
		bytes[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16);
	}
	return bytes;
}

function timingSafeEqualHex(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	const aBytes = hexToBytes(a);
	const bBytes = hexToBytes(b);
	let out = 0;
	for (let i = 0; i < aBytes.length; i += 1) out |= aBytes[i] ^ bBytes[i];
	return out === 0;
}

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
	const enc = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		enc.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const signature = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
	const bytes = new Uint8Array(signature);
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

async function verifyStripeWebhookSignature(rawBody: string, signatureHeader: string, secret: string): Promise<boolean> {
	const parsed = parseStripeSignature(signatureHeader);
	if (!parsed) return false;
	const expectedPayload = `${parsed.timestamp}.${rawBody}`;
	const computed = await hmacSha256Hex(secret, expectedPayload);
	return parsed.signatures.some((sig) => timingSafeEqualHex(sig, computed));
}

function normalizeAmount(amount: number | null | undefined): number | undefined {
	if (typeof amount !== 'number') return undefined;
	return Math.round(amount) / 100;
}

function splitName(fullName: string | null | undefined): { firstName?: string; lastName?: string } {
	if (!fullName) return {};
	const parts = fullName.trim().split(/\s+/);
	if (parts.length === 0) return {};
	if (parts.length === 1) return { firstName: parts[0] };
	return {
		firstName: parts[0],
		lastName: parts.slice(1).join(' '),
	};
}

async function handleCheckoutCompleted(event: Stripe.Event, brevoApiKey: string): Promise<void> {
	const session = event.data.object as Stripe.Checkout.Session;
	const email = session.customer_details?.email ?? session.customer_email ?? undefined;
	if (!email) return;

	const { firstName, lastName } = splitName(session.customer_details?.name);
	const orderTotal = normalizeAmount(session.amount_total);
	const orderId = session.id;
	const currency = (session.currency ?? 'eur').toUpperCase();

	await upsertBrevoContact({
		apiKey: brevoApiKey,
		email,
		attributes: {
			FIRSTNAME: firstName,
			LASTNAME: lastName,
			ORDER_STATUS: 'paid',
			LAST_ORDER_ID: orderId,
			LAST_ORDER_TOTAL: orderTotal,
			CURRENCY: currency,
		},
	});

	await trackBrevoEvent({
		apiKey: brevoApiKey,
		event: 'order_paid',
		email,
		properties: {
			order_id: orderId,
			order_status: 'paid',
			amount: orderTotal ?? 0,
			currency,
		},
	});
}

async function handlePaymentFailed(event: Stripe.Event, brevoApiKey: string): Promise<void> {
	const paymentIntent = event.data.object as Stripe.PaymentIntent;
	const email = paymentIntent.receipt_email ?? undefined;
	if (!email) return;

	const amount = normalizeAmount(paymentIntent.amount);
	const currency = (paymentIntent.currency ?? 'eur').toUpperCase();

	await upsertBrevoContact({
		apiKey: brevoApiKey,
		email,
		attributes: {
			ORDER_STATUS: 'payment_failed',
			CURRENCY: currency,
		},
	});

	await trackBrevoEvent({
		apiKey: brevoApiKey,
		event: 'order_payment_failed',
		email,
		properties: {
			payment_intent_id: paymentIntent.id,
			order_status: 'payment_failed',
			amount: amount ?? 0,
			currency,
		},
	});
}

async function handleChargeRefunded(event: Stripe.Event, brevoApiKey: string): Promise<void> {
	const charge = event.data.object as Stripe.Charge;
	const email = charge.billing_details?.email ?? undefined;
	if (!email) return;

	const amountRefunded = normalizeAmount(charge.amount_refunded);
	const currency = (charge.currency ?? 'eur').toUpperCase();

	await upsertBrevoContact({
		apiKey: brevoApiKey,
		email,
		attributes: {
			ORDER_STATUS: 'refunded',
			CURRENCY: currency,
		},
	});

	await trackBrevoEvent({
		apiKey: brevoApiKey,
		event: 'order_refunded',
		email,
		properties: {
			charge_id: charge.id,
			order_status: 'refunded',
			amount_refunded: amountRefunded ?? 0,
			currency,
		},
	});
}

export const POST: APIRoute = async ({ request, locals }) => {
	const runtime = (locals as { runtime?: { env?: Record<string, string | undefined> } }).runtime;
	const webhookSecret =
		runtime?.env?.STRIPE_WEBHOOK_SECRET ?? import.meta.env.STRIPE_WEBHOOK_SECRET ?? '';
	const brevoApiKey = runtime?.env?.BREVO_API_KEY ?? import.meta.env.BREVO_API_KEY ?? '';

	if (!webhookSecret || !brevoApiKey) {
		return new Response('Webhook is not configured', { status: 500 });
	}

	const signatureHeader = request.headers.get('stripe-signature');
	if (!signatureHeader) {
		return new Response('Missing stripe-signature header', { status: 400 });
	}

	const rawBody = await request.text();
	const valid = await verifyStripeWebhookSignature(rawBody, signatureHeader, webhookSecret);
	if (!valid) {
		return new Response('Invalid signature', { status: 400 });
	}

	let event: Stripe.Event;
	try {
		event = JSON.parse(rawBody) as Stripe.Event;
	} catch {
		return new Response('Invalid JSON payload', { status: 400 });
	}

	try {
		switch (event.type) {
			case 'checkout.session.completed':
				await handleCheckoutCompleted(event, brevoApiKey);
				break;
			case 'payment_intent.payment_failed':
				await handlePaymentFailed(event, brevoApiKey);
				break;
			case 'charge.refunded':
				await handleChargeRefunded(event, brevoApiKey);
				break;
			default:
				break;
		}

		return new Response('ok', { status: 200 });
	} catch (err) {
		console.error('Stripe webhook handler error:', err);
		return new Response('Webhook handler failed', { status: 500 });
	}
};
