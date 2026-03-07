import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, NextRequest, NextFetchEvent } from "next/server";

// BLXCKCHAT is a BYOK platform. Most routes are public.
const isProtectedRoute = createRouteMatcher([
  // Add protected routes here if needed in the future
  // '/settings(.*)'
]);

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  // If Vercel Edge is missing the Clerk keys, degrade gracefully to a public passthrough.
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return NextResponse.next();
  }

  return clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
    return NextResponse.next();
  })(request, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};