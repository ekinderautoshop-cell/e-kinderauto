import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';
import { defineMiddleware, sequence } from 'astro:middleware';

const isProtectedRoute = createRouteMatcher(['/checkout(.*)']);

const clerkHandler = clerkMiddleware((auth, context) => {
	const { isAuthenticated, redirectToSignIn } = auth();
	if (!isAuthenticated && isProtectedRoute(context.request)) {
		return redirectToSignIn();
	}
});

const safeClerk = defineMiddleware(async (context, next) => {
	try {
		return await clerkHandler(context, next);
	} catch (e: any) {
		console.error('[Clerk Middleware Error]', e?.message ?? e);
		return next();
	}
});

export const onRequest = sequence(safeClerk);
