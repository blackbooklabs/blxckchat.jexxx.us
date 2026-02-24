"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

interface DomainRoutingProps {
  children: React.ReactNode;
}

export function DomainRouting({ children }: DomainRoutingProps) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    if (!isLoaded) return;

    // Get current domain
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    
    console.log('🌙 Luna Verde: Domain routing check', { hostname, subdomain, isSignedIn });

    // Sacred routing logic based on domain
    if (subdomain === 'dxsh') {
      // dxsh.blxckbook.jexxx.us → Dashboard (requires auth)
      console.log('🌙 Luna Verde: dxsh domain detected - routing to dashboard');
      
      if (!isSignedIn) {
        console.log('🌙 Luna Verde: Not signed in - redirecting to sign-in');
        router.push('/sign-in');
        return;
      }
      
      // Already on dashboard or dashboard subpaths
      if (window.location.pathname === '/' || window.location.pathname === '/home') {
        console.log('🌙 Luna Verde: On home page of dxsh domain - redirecting to dashboard');
        router.push('/dashboard');
        return;
      }
    } else if (subdomain === 'blxckbook' || subdomain === 'www' || !subdomain) {
      // blxckbook.jexxx.us → Home page (public access)
      console.log('🌙 Luna Verde: blxckbook domain detected - serving home page');
      
      // Allow public access to home page
      if (window.location.pathname.startsWith('/dashboard') && !isSignedIn) {
        console.log('🌙 Luna Verde: Unauthorized dashboard access - redirecting to sign-in');
        router.push('/sign-in');
        return;
      }
      
      // For blxckbook domain, home page is accessible to all
      console.log('🌙 Luna Verde: Serving home page for blxckbook domain');
    }
  }, [isSignedIn, isLoaded, router]);

  if (!isClient) {
    return null; // Prevent hydration mismatch
  }

  return <>{children}</>;
}