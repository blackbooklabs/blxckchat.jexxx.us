"use client";

import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { useAuth, UserButton, SignInButton } from "@/lib/auth-client";

export function AuthButton() {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded) {
    return (
      <div className="w-8 h-8 rounded-full bg-muted/20 animate-pulse" />
    );
  }
  
  if (isSignedIn) {
    return (
      <UserButton 
        userProfileMode="modal"
        afterSignOutUrl="/"
        appearance={{
          elements: {
            userButtonAvatarBox: "w-8 h-8 rounded-full ring-2 ring-accent/50",
            userButtonPopoverCard: "bg-surface border border-border shadow-xl",
            userPreviewTextContainer: "text-foreground",
            userButtonPopoverActionButton: "text-foreground hover:bg-accent/10",
            userButtonPopoverActionButtonText: "text-foreground",
            userButtonPopoverFooter: "hidden",
          }
        }}
      />
    );
  }
  
  return (
    <SignInButton mode="modal">
      <motion.button
        className="flex items-center gap-2 px-3 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-full border border-accent/30 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <LogIn className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">Sign In</span>
      </motion.button>
    </SignInButton>
  );
}
