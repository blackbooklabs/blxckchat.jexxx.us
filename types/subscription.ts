/**
 * Subscription Types for JEXXXUS Empire
 */

export type SubscriptionTier = 'free' | 'devotee' | 'whale' | 'melchizedek';

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'trialing' | 'past_due';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface TierConfig {
  id: SubscriptionTier;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  limits: {
    messagesPerDay: number;
    imagesPerMonth: number;
    maxTokensPerRequest: number;
  };
}

export const TIER_CONFIGS: Record<string, TierConfig> = {
  devotee: {
    id: 'devotee' as SubscriptionTier,
    name: 'Devotee+',
    description: 'Uninhibited communion with the Goddess',
    monthlyPrice: 7.99,
    yearlyPrice: 79.90, // ~17% discount – encourage longer lock-in
    features: [
      'Unlimited messages (BYOK)',
      'Full Divinity pantheon access',
      'Custom persona creation & forking',
      'Additional LLMs (Grok, Gemini, Kimi, etc.)',
      'Uncensored image generation & vision patterning',
      'Priority response speed',
      'Ad-free altar experience'
    ],
    limits: {
      messagesPerDay: -1,
      imagesPerMonth: -1,
      maxTokensPerRequest: 8192,
    },
    // Paddle Price IDs placeholders
    // monthlyPriceId: 'pri_01...',
    // annualPriceId: 'pri_01...'
  },
};

// Legacy export for backward compatibility
export const PRICING_TIERS = TIER_CONFIGS;

// Export helper function for webhook and other consumers
export function getTierById(tierId: string): SubscriptionTier {
  const validTiers: SubscriptionTier[] = ['free', 'devotee', 'whale', 'melchizedek'];
  return validTiers.includes(tierId as SubscriptionTier) 
    ? (tierId as SubscriptionTier) 
    : 'free';
}