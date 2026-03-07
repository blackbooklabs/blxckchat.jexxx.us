import { clerkMiddleware } from '@clerk/nextjs/server';

/**
 * Minimal Clerk middleware — session propagation only.
 * Route-level protection is handled by each API route via auth().
 * No protect() calls here to avoid Edge runtime crashes.
 */
export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
