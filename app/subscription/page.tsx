"use client";

import { useAuth } from '@clerk/nextjs';
import { motion } from 'motion/react';
import { PaddleSubscribeButton } from '@/components/PaddleSubscribeButton';
import { TIER_CONFIGS, type SubscriptionTier } from '@/types/subscription';

const PAID_TIERS: SubscriptionTier[] = ['devotee', 'whale', 'melchizedek'];

export default function SubscriptionPage() {
  const { isLoaded, isSignedIn, userId } = useAuth();

  if (!isLoaded) {
    return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">Loading…</div>;
  }

  if (!isSignedIn || !userId) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-xl text-center space-y-4">
          <h1 className="text-3xl font-bold">Sign in required</h1>
          <p className="text-muted">Please sign in to activate a subscription tier.</p>
          <a href="/chat" className="inline-block px-4 py-2 rounded-full bg-accent text-white">Return to chat</a>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold">Choose your subscription tier</h1>
          <p className="text-muted mt-2">Paddle checkout is now active for BLXCKCHAT billing.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PAID_TIERS.map((tierId, i) => {
            const tier = TIER_CONFIGS[tierId];
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-surface border border-border rounded-2xl p-6"
              >
                <h2 className="text-2xl font-semibold">{tier.name}</h2>
                <p className="text-muted text-sm mt-1">{tier.description}</p>
                <div className="text-3xl font-bold mt-4">${tier.monthlyPrice}<span className="text-sm font-normal text-muted">/mo</span></div>

                <ul className="mt-4 mb-6 space-y-2 text-sm text-muted">
                  {tier.features.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>

                <PaddleSubscribeButton tierId={tierId} userId={userId} className="w-full" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
