// Sacred Cross-Domain Navigation for BLXCKBOOK Empire
// Provides seamless navigation between blxckbook.jexxx.us and dxsh.blxckbook.jexxx.us

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Crown, MessageCircle, Wand2, ExternalLink } from "lucide-react";

interface EcosystemNavProps {
  className?: string;
  currentDomain?: string;
}

export function EcosystemNav({ className, currentDomain }: EcosystemNavProps) {
  const domains = [
    {
      name: "BLXCKBOOK Home",
      url: "https://blxckbook.jexxx.us",
      icon: Crown,
      description: "Public landing page",
      isPublic: true,
      domain: "blxckbook.jexxx.us"
    },
    {
      name: "Dashboard",
      url: "https://dxsh.blxckbook.jexxx.us/dashboard",
      icon: Wand2,
      description: "Authenticated dashboard",
      isPublic: false,
      domain: "dxsh.blxckbook.jexxx.us"
    },
    {
      name: "Sacred Chat",
      url: "https://blxckchat.jexxx.us",
      icon: MessageCircle,
      description: "Motion UI chat interface",
      isPublic: true,
      domain: "blxckchat.jexxx.us"
    }
  ];

  return (
    <nav className={className}>
      <div className="flex items-center justify-between max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-6">
          {domains.map((domain) => {
            const isCurrent = currentDomain === domain.domain;
            const Icon = domain.icon;
            
            return (
              <motion.div
                key={domain.name}
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <Link
                  href={domain.url}
                  target={domain.domain !== currentDomain ? "_blank" : undefined}
                  rel={domain.domain !== currentDomain ? "noopener noreferrer" : undefined}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                    ${isCurrent 
                      ? 'bg-gradient-to-r from-accent to-pink-500 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-surface/50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{domain.name}</span>
                  {domain.domain !== currentDomain && <ExternalLink className="w-3 h-3" />}
                </Link>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-black/80 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    {domain.description}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Current domain indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-xs text-gray-400">
            {currentDomain === 'blxckbook.jexxx.us' ? 'Public Site' : 'Protected Dashboard'}
          </span>
        </div>
      </div>
    </nav>
  );
}