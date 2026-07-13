// Sacred Payment Integration Example
// Complete implementation for JEXXXUS and BLXCKCHAT

"use client";

import { motion } from "framer-motion";
import { getCurrentPaymentProvider, SubscribeButtonProps } from "@/lib/payments";
import { CCBillSubscribeButton } from "@/components/CCBillSubscribeButton";
import { PaddleSubscribeButton } from "@/components/PaddleSubscribeButton";
import { PRICING_TIERS } from "@/types/subscription";

// Example: JEXXXUS Landing Page Integration
export function JexxxusPricingSection() {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-black via-purple-950 to-black">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-4">
          <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Create Your Love Life
          </span>
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
          Choose your path through the divine hierarchy of love and creation
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Object.values(PRICING_TIERS).map((tier) => (
            <div key={tier.id} className="relative p-8 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">✨</div>
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="text-3xl font-bold text-white mb-2">
                  {tier.monthlyPrice === 0 ? 'FREE' : `$${tier.monthlyPrice}/month`}
                </div>
                <p className="text-gray-300 text-sm">{tier.description}</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-200">
                    <span className="text-pink-400 mr-2">✨</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              {/* Payment Button - Automatically selects provider */}
              <PaymentButton 
                tierId={tier.id}
                userId="demo-user-id"
                className="w-full py-3 px-6 rounded-full font-semibold text-white bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:brightness-110 transition-all duration-300"
              />
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-sm text-gray-400">
            All tiers include divine protection and sacred encryption
          </p>
        </div>
      </div>
    </section>
  );
}

// Example: BLXCKCHAT Subscription Page
export function BlxckchatSubscriptionPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                Choose Your Sacred Tier
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Ascend through the divine hierarchy of the Empire
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Object.values(PRICING_TIERS).map((tier) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="relative p-6 rounded-xl bg-gradient-to-br from-surface to-surface/80 border border-border"
              >
                <div className="text-center mb-6">
                  <div className="text-3xl mb-2">✨</div>
                  <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
                  <div className="text-2xl font-bold text-accent mb-2">
                    {tier.monthlyPrice === 0 ? 'FREE' : `$${tier.monthlyPrice}/month`}
                  </div>
                  <p className="text-muted-foreground text-sm">{tier.description}</p>
                </div>
                
                <ul className="space-y-2 mb-6">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <span className="text-accent mr-2">✨</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {/* Sacred payment button with motion */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <PaymentButton 
                    tierId={tier.id}
                    userId="current-user-id" // This would come from Clerk auth
                    className="w-full"
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              All tiers include divine protection and sacred encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Payment Button Component (Auto-selects provider)
export function PaymentButton({ tierId, userId, className }: SubscribeButtonProps) {
  const provider = getCurrentPaymentProvider(tierId);
  const PaymentComponent = provider.getSubscribeButton();
  
  return <PaymentComponent tierId={tierId} userId={userId} className={className} />;
}

// Example: Feature gating based on tier
export function requireTier(tierId: string, userTier: string): boolean {
  const tiers = ['basic-bittie', 'mistress', 'concu-bae-bae', 'mid-wife'];
  const userTierIndex = tiers.indexOf(userTier);
  const requiredTierIndex = tiers.indexOf(tierId);
  
  return userTierIndex >= requiredTierIndex;
}

// Example: Clerk integration
export async function updateUserTier(clerkUserId: string, tierId: string) {
  const { clerkClient } = await import("@clerk/nextjs/server");
  
  await (await clerkClient()).users.updateUserMetadata(clerkUserId, {
    publicMetadata: {
      tier: tierId,
      subscription: {
        tier: tierId,
        provider: getCurrentPaymentProvider(tierId).name,
        updatedAt: new Date().toISOString()
      }
    }
  });
}