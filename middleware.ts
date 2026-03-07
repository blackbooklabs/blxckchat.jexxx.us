// Sacred Domain Router Configuration
// Handles routing for blxckbook.jexxx.us and dxsh.blxckbook.jexxx.us

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { pathname, hostname } = request.nextUrl;
  const subdomain = hostname.split('.')[0];

  // Sacred routing logic based on subdomain
  switch (subdomain) {
    case 'dxsh':
      // dxsh.blxckbook.jexxx.us → Dashboard UI (protected)
      if (pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      if (pathname.startsWith('/dashboard') || pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
        if (pathname.startsWith('/dashboard')) {
          await auth.protect();
        }
        return NextResponse.next();
      }

      return NextResponse.redirect(new URL('/dashboard', request.url));

    case 'blxckbook':
    case 'www':
    default:
      // blxckbook.jexxx.us → public access, auth enforced on protected routes
      if (!isPublicRoute(request)) {
        await auth.protect();
      }
      return NextResponse.next();
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};