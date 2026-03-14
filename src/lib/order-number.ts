function numericHash(input: string): number {
	let hash = 0;
	for (let i = 0; i < input.length; i += 1) {
		hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
	}
	return hash;
}

export function formatOrderNumber(params: {
	stripeSessionId: string;
	createdAtMs?: number;
	prefix?: string;
}): string {
	const { stripeSessionId, createdAtMs, prefix = 'EKA' } = params;
	const now = createdAtMs ? new Date(createdAtMs) : new Date();
	const year = now.getUTCFullYear();
	const seed = `${stripeSessionId}-${createdAtMs ?? ''}-${year}`;
	const suffix = String(numericHash(seed) % 1_000_000).padStart(6, '0');
	return `${prefix}-${year}-${suffix}`;
}
