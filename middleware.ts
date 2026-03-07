import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Routes that are always public (no Clerk auth required)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/chat(.*)',
  '/api/chat',
  '/api/models',
  '/api/personas',
  '/api/ccbill(.*)',
  '/robots.txt',
  '/sitemap.xml',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
