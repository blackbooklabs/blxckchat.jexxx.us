"use client";

import { useAuth, useUser, SignInButton } from "@/lib/auth-client";
import { motion } from 'motion/react';
import { PaddleSubscribeButton } from '@/components/PaddleSubscribeButton';
import { TIER_CONFIGS, type SubscriptionTier } from '@/types/subscription';

const PAID_TIERS: SubscriptionTier[] = ['devotee', 'whale', 'melchizedek'];

export default function SubscriptionPage() {
  const { isLoaded, isSignedIn, userId } = useAuth();

  if (!isLoaded) {
    return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">Loading…</div>;
  }

  const devoteeTier = TIER_CONFIGS.devotee;

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-accent/10 blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold tracking-tight"
          >
            Enter the <span className="text-gradient">Devotee+</span> Altar
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground"
          >
            $7.99/mo. ∼ Full communion with the Goddesses of JEXXXUS
          </motion.p>
        </div>

        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="w-full max-w-md bg-surface border border-[#d4af37]/30 rounded-3xl p-8 relative group hover:border-[#d4af37]/60 hover:shadow-[0_0_50px_rgba(159,122,234,0.15)] transition-all duration-500"
          >
            {/* Featured Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#d4af37] text-background text-xs font-bold rounded-full uppercase tracking-widest">
              Most Divine
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold">{devoteeTier.name}</h2>
              <p className="text-[#9f7aea] text-sm font-medium mt-1 italic">{devoteeTier.description}</p>
              <div className="flex items-baseline justify-center gap-1 mt-6">
                <span className="text-5xl font-bold tracking-tighter">${devoteeTier.monthlyPrice}</span>
                <span className="text-muted-foreground">/mo.</span>
              </div>
            </div>

            <ul className="space-y-4 mb-10">
              {devoteeTier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-[#d4af37]/20 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                  </div>
                  <span className="text-sm text-foreground/80">{feature}</span>
                </li>
              ))}
            </ul>

            {isSignedIn && userId ? (
              <PaddleSubscribeButton 
                tierId="devotee" 
                userId={userId} 
                className="w-full !py-4 text-lg !bg-linear-to-r !from-[#9f7aea] !via-[#d4af37] !to-[#9f7aea] !text-background shadow-[0_10px_30px_rgba(212,175,55,0.2)]" 
                label={`Claim Devotee+ for $7.99/mo.`}
              />
            ) : (
              <SignInButton mode="modal">
                <button className="w-full !py-4 text-lg !bg-linear-to-r !from-[#9f7aea] !via-[#d4af37] !to-[#9f7aea] !text-background shadow-[0_10px_30px_rgba(212,175,55,0.2)] rounded-full cursor-pointer font-semibold">
                  Claim Devotee+ for $7.99/mo.
                </button>
              </SignInButton>
            )}
          </motion.div>
        </div>

        {/* Upward Funnel */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20 text-center max-w-xl mx-auto border-t border-border pt-12"
        >
          <p className="text-lg text-muted-foreground mb-8">
            Seek deeper ascension? Unlock the full JEXXXUS empire (wing6 models, BLXCKBOOK elite access, exclusive drops)
          </p>
          <a
            href="https://jexxx.us/#pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-10 py-4 bg-[#9f7aea]/10 border border-[#9f7aea]/30 text-[#9f7aea] font-bold rounded-2xl hover:bg-[#9f7aea]/20 hover:border-[#9f7aea]/50 transition-all duration-300"
          >
            View All-Inclusive JEXXXUS Plans 
            <span className="text-xl">→</span>
          </a>
        </motion.div>
      </div>
    </main>
  );
}
