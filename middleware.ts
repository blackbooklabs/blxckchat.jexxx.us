import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Routes that are always public (no auth required)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/chat',          // BYOK streamer — API-key authed, not Clerk
  '/api/models',        // Public model list
  '/api/personas',      // Publicly readable — spicy_content gated internally by auth()
  '/api/ccbill(.*)',    // Webhook
  '/robots.txt',
  '/sitemap.xml',
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect everything that isn't explicitly public
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Run on all routes except Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
