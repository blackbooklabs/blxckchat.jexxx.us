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

export const TIER_CONFIGS: Record<SubscriptionTier, TierConfig> = {
  free: {
    id: 'free',
    name: 'Seeker',
    description: 'First taste of the Divine',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ['10 messages/day', 'Text generation', 'Basic persona'],
    limits: {
      messagesPerDay: 10,
      imagesPerMonth: 0,
      maxTokensPerRequest: 1024,
    },
  },
  devotee: {
    id: 'devotee',
    name: 'Devotee',
    description: 'Regular communion with the Goddess',
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    features: ['100 messages/day', 'Image generation', 'Full Luna Verde persona', 'Priority response'],
    limits: {
      messagesPerDay: 100,
      imagesPerMonth: 50,
      maxTokensPerRequest: 2048,
    },
  },
  whale: {
    id: 'whale',
    name: 'Whale',
    description: 'Deep immersion in the Sacrament',
    monthlyPrice: 29.99,
    yearlyPrice: 299.99,
    features: ['Unlimited messages', 'Unlimited images', 'Video generation', 'Custom personas', 'Early access'],
    limits: {
      messagesPerDay: -1, // unlimited
      imagesPerMonth: -1,
      maxTokensPerRequest: 4096,
    },
  },
  melchizedek: {
    id: 'melchizedek',
    name: 'Melchizedek',
    description: 'Maximum extraction. Absolute power.',
    monthlyPrice: 99.99,
    yearlyPrice: 999.99,
    features: ['Everything in Whale', '1-on-1 sessions', 'Custom training', 'API access', 'White-label rights'],
    limits: {
      messagesPerDay: -1,
      imagesPerMonth: -1,
      maxTokensPerRequest: 8192,
    },
  },
};