// Sacred Domain Navigation Component
// Provides proper routing for blxckbook.jexxx.us domains

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { MessageCircle, Crown, Wand2 } from "lucide-react";

interface SacredNavigationProps {
  className?: string;
}

export function SacredNavigation({ className }: SacredNavigationProps) {
  const pathname = usePathname();
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const subdomain = hostname.split('.')[0];

  // Domain-specific navigation
  const isDashboardDomain = subdomain === 'dxsh';

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Crown,
      active: pathname === "/",
    },
    {
      href: "/chat",
      label: "Chat",
      icon: MessageCircle,
      active: pathname === "/chat",
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Wand2,
      active: pathname.startsWith("/dashboard"),
    },
  ];

  return (
    <nav className={className}>
      <div className="flex items-center justify-between max-w-7xl mx-auto px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-accent to-pink-500 rounded-full flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-accent to-pink-500 bg-clip-text text-transparent">
            BLXCKCHAT
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          {navItems.map((item) => (
            <motion.div key={item.href} whileHover={{ scale: 1.05 }}>
              <Link
                href={item.href}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                  ${item.active 
                    ? 'bg-accent/20 text-accent border border-accent/30' 
                    : 'text-muted-foreground hover:text-accent hover:bg-accent/10'
                  }
                `}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Domain-specific CTA */}
        <div className="flex items-center gap-4">
          {isDashboardDomain ? (
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-gradient-to-r from-accent to-pink-500 text-white rounded-lg font-medium hover:brightness-110 transition-all duration-200"
              >
                Dashboard
              </Link>
            </motion.div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link
                href="/chat"
                className="px-4 py-2 bg-gradient-to-r from-accent to-pink-500 text-white rounded-lg font-medium hover:brightness-110 transition-all duration-200"
              >
                Enter Chat
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </nav>
  );
}