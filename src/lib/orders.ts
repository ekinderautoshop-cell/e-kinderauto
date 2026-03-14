export interface D1Database {
	prepare(query: string): D1PreparedStatement;
}

export interface D1PreparedStatement {
	bind(...values: unknown[]): D1PreparedStatement;
	all<T = unknown>(): Promise<{ results: T[] }>;
	first<T = unknown>(): Promise<T | null>;
}

export interface OrderItem {
	name: string;
	quantity: number;
	unitAmount: number;
	totalAmount: number;
	currency: string;
	image?: string;
}

export interface StoredOrder {
	id: number;
	stripeSessionId: string;
	stripePaymentIntentId?: string;
	userId?: string;
	customerEmail: string;
	status: string;
	currency: string;
	totalAmount: number;
	items: OrderItem[];
	createdAt: number;
}

async function exec(db: D1Database, query: string, params: unknown[] = []): Promise<void> {
	const stmt = db.prepare(query).bind(...params) as D1PreparedStatement & {
		run?: () => Promise<unknown>;
	};
	if (typeof stmt.run === 'function') {
		await stmt.run();
		return;
	}
	await stmt.all();
}

export async function ensureOrdersTable(db: D1Database): Promise<void> {
	await exec(
		db,
		`CREATE TABLE IF NOT EXISTS orders (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			stripe_session_id TEXT NOT NULL UNIQUE,
			stripe_payment_intent_id TEXT,
			user_id TEXT,
			customer_email TEXT NOT NULL,
			status TEXT NOT NULL,
			currency TEXT NOT NULL,
			total_amount REAL NOT NULL DEFAULT 0,
			items_json TEXT NOT NULL,
			created_at INTEGER NOT NULL
		)`
	);
	await exec(db, 'CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)');
	await exec(db, 'CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email)');
	await exec(db, 'CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)');
}

export async function upsertOrder(db: D1Database, order: Omit<StoredOrder, 'id'>): Promise<void> {
	await ensureOrdersTable(db);
	const query = `INSERT INTO orders (
		stripe_session_id,
		stripe_payment_intent_id,
		user_id,
		customer_email,
		status,
		currency,
		total_amount,
		items_json,
		created_at
	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	ON CONFLICT(stripe_session_id) DO UPDATE SET
		stripe_payment_intent_id = excluded.stripe_payment_intent_id,
		user_id = excluded.user_id,
		customer_email = excluded.customer_email,
		status = excluded.status,
		currency = excluded.currency,
		total_amount = excluded.total_amount,
		items_json = excluded.items_json`;

	await exec(db, query, [
		order.stripeSessionId,
		order.stripePaymentIntentId ?? null,
		order.userId ?? null,
		order.customerEmail,
		order.status,
		order.currency,
		order.totalAmount,
		JSON.stringify(order.items),
		order.createdAt,
	]);
}

export async function updateOrderStatusByPaymentIntentOrEmail(
	db: D1Database,
	params: {
		paymentIntentId?: string;
		email?: string;
		status: string;
	}
): Promise<void> {
	await ensureOrdersTable(db);
	const { paymentIntentId, email, status } = params;
	if (paymentIntentId) {
		await exec(db, 'UPDATE orders SET status = ? WHERE stripe_payment_intent_id = ?', [status, paymentIntentId]);
		return;
	}
	if (email) {
		await exec(db, 'UPDATE orders SET status = ? WHERE customer_email = ?', [status, email]);
	}
}

interface OrderRow {
	id: number;
	stripe_session_id: string;
	stripe_payment_intent_id: string | null;
	user_id: string | null;
	customer_email: string;
	status: string;
	currency: string;
	total_amount: number;
	items_json: string;
	created_at: number;
}

function mapRow(row: OrderRow): StoredOrder {
	let items: OrderItem[] = [];
	try {
		const parsed = JSON.parse(row.items_json);
		if (Array.isArray(parsed)) items = parsed as OrderItem[];
	} catch {
		items = [];
	}
	return {
		id: row.id,
		stripeSessionId: row.stripe_session_id,
		stripePaymentIntentId: row.stripe_payment_intent_id ?? undefined,
		userId: row.user_id ?? undefined,
		customerEmail: row.customer_email,
		status: row.status,
		currency: row.currency,
		totalAmount: row.total_amount,
		items,
		createdAt: row.created_at,
	};
}

export async function getOrdersForUser(
	db: D1Database,
	params: { userId?: string; email?: string; limit?: number }
): Promise<StoredOrder[]> {
	await ensureOrdersTable(db);
	const { userId, email, limit = 50 } = params;
	if (userId) {
		const byUser = await db
			.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ?')
			.bind(userId, limit)
			.all<OrderRow>();
		return byUser.results.map(mapRow);
	}
	if (email) {
		const byEmail = await db
			.prepare('SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC LIMIT ?')
			.bind(email, limit)
			.all<OrderRow>();
		return byEmail.results.map(mapRow);
	}
	return [];
}
