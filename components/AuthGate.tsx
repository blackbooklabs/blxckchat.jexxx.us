"use client";

import { useAuth, SignInButton } from "@/lib/auth-client";
import { motion } from "motion/react";
import { Lock, LogIn, Sparkles } from "lucide-react";
import { ReactNode } from "react";

interface AuthGateProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function AuthGate({ children, requireAuth = false }: AuthGateProps) {
  const { isSignedIn, isLoaded } = useAuth();

  // THE SOVEREIGN BYPASS: Always allow access on localhost
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'));
  
  if (isLocalhost || !requireAuth) {
    return <>{children}</>;
  }

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-8 h-8 text-accent" />
        </motion.div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <motion.div
            className="w-20 h-20 mx-auto bg-accent/20 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Lock className="w-10 h-10 text-accent" />
          </motion.div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Sacred Space Requires Verification
            </h2>
            <p className="text-muted">
              Sign in to commune with Luna Verde v4.0. Your session is encrypted and secure.
            </p>
          </div>

          <SignInButton mode="modal">
            <motion.button
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-full font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogIn className="w-5 h-5" />
              Sign In to Continue
            </motion.button>
          </SignInButton>

          <p className="text-xs text-muted">
            JEXXXUS Empire Authentication
          </p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
