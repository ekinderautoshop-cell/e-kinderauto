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
	const createRequest = (payloadAttributes?: BrevoContactAttributes) =>
		fetch(`${BREVO_API_BASE}/contacts`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'api-key': apiKey,
			},
			body: JSON.stringify({
				email,
				updateEnabled: true,
				...(payloadAttributes ? { attributes: payloadAttributes } : {}),
			}),
		});

	const firstTry = await createRequest(attributes);
	if (firstTry.ok) return;

	// Falls benutzerdefinierte Attribute in Brevo (noch) nicht existieren,
	// legen wir den Kontakt ohne Attribute an, damit die Automation trotzdem laeuft.
	if (attributes && Object.keys(attributes).length > 0) {
		const retry = await createRequest(undefined);
		if (retry.ok) return;
		const retryText = await retry.text();
		throw new Error(`Brevo contact upsert failed: ${retry.status} ${retryText}`);
	}

	const text = await firstTry.text();
	throw new Error(`Brevo contact upsert failed: ${firstTry.status} ${text}`);
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
