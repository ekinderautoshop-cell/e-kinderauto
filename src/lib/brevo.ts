const BREVO_API_BASE = 'https://api.brevo.com/v3';

interface BrevoContactAttributes {
	FIRSTNAME?: string;
	LASTNAME?: string;
	ORDER_STATUS?: string;
	LAST_ORDER_ID?: string;
	LAST_ORDER_TOTAL?: number;
	CURRENCY?: string;
}

export async function upsertBrevoContact(params: {
	apiKey: string;
	email: string;
	attributes?: BrevoContactAttributes;
}): Promise<void> {
	const { apiKey, email, attributes } = params;
	const res = await fetch(`${BREVO_API_BASE}/contacts`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'api-key': apiKey,
		},
		body: JSON.stringify({
			email,
			updateEnabled: true,
			attributes: attributes ?? {},
		}),
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Brevo contact upsert failed: ${res.status} ${text}`);
	}
}

export async function trackBrevoEvent(params: {
	apiKey: string;
	event: string;
	email: string;
	properties?: Record<string, string | number | boolean | null>;
}): Promise<void> {
	const { apiKey, event, email, properties } = params;
	const res = await fetch(`${BREVO_API_BASE}/events`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'api-key': apiKey,
		},
		body: JSON.stringify({
			event,
			email,
			properties: properties ?? {},
		}),
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Brevo event track failed: ${res.status} ${text}`);
	}
}
