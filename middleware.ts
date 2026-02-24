// Sacred Domain Router Configuration
// Handles routing for blxckbook.jexxx.us and dxsh.blxckbook.jexxx.us

import { NextRequest, NextResponse } from "next/server";
import { NextURL } from "next/dist/server/web/next-url";

/**
 * Sacred domain routing logic for the JEXXXUS empire
 * Routes users based on subdomain to appropriate sections
 */
export function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;
  const subdomain = hostname.split('.')[0];
  
  console.log('🌙 Luna Verde: Middleware routing check', { hostname, subdomain, pathname });

  // Sacred routing logic based on subdomain
  switch (subdomain) {
    case 'dxsh':
      // dxsh.blxckbook.jexxx.us → Dashboard UI
      console.log('🌙 Luna Verde: dxsh domain detected - routing to dashboard');
      
      // Root path of dxsh domain should redirect to dashboard
      if (pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      // Allow dashboard paths and auth paths
      if (pathname.startsWith('/dashboard') || pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
        return NextResponse.next();
      }
      
      // Redirect other paths to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));

    case 'blxckbook':
    case 'www':
    default:
      // blxckbook.jexxx.us → Home page (public access)
      console.log('🌙 Luna Verde: blxckbook domain detected - serving home page');
      
      // Allow all paths for blxckbook domain (public access)
      // The DomainRouting component will handle auth checks client-side
      return NextResponse.next();
  }
}

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