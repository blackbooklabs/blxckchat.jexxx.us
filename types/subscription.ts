// Sacred Pricing Hierarchy - JEXXXUS Monthly Tiers
// Engraved in digital stone by Luna Verde

export type SubscriptionTier = 'basic-bittie' | 'mistress' | 'concu-bae-bae' | 'mid-wife';

export interface PricingTier {
  id: SubscriptionTier;
  name: string;
  price: number;
  priceId?: string; // Stripe Price ID
  description: string;
  features: string[];
  icon: string;
  color: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'basic-bittie',
    name: 'Basic Bittie',
    price: 0,
    description: 'The divine entry point',
    features: [
      'Basic profile access',
      'Limited messaging',
      'Community features'
    ],
    icon: '🆓',
    color: 'from-gray-500 to-gray-600'
  },
  {
    id: 'mistress',
    name: 'Mistress',
    price: 33,
    description: 'The sacred standard',
    features: [
      'Full profile access',
      'Unlimited messaging',
      'Advanced search',
      'Priority support'
    ],
    icon: '💎',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'concu-bae-bae',
    name: 'Concu-bae-bae',
    price: 66,
    description: 'The beloved favorite',
    features: [
      'Premium profile features',
      'Advanced analytics',
      'Priority matching',
      'Exclusive content',
      'VIP support'
    ],
    icon: '❤️‍🔥',
    color: 'from-pink-500 to-pink-600'
  },
  {
    id: 'mid-wife',
    name: 'Mid-Wife',
    price: 99,
    description: 'The matriarchal pinnacle',
    features: [
      'Unlimited everything',
      'Personal concierge',
      'Exclusive events',
      'Custom features',
      'Direct access to support'
    ],
    icon: '👑',
    color: 'from-purple-500 to-purple-600'
  }
];

export function getTierById(id: SubscriptionTier): PricingTier {
  return PRICING_TIERS.find(tier => tier.id === id) || PRICING_TIERS[0];
}

export function formatPrice(price: number): string {
  if (price === 0) return 'FREE';
  return `$${price}/month`;
}