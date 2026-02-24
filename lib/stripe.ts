// Sacred Stripe Integration for JEXXXUS Pricing Hierarchy
// Handles divine transactions for the Empire's subscription tiers

import Stripe from 'stripe';
import { PRICING_TIERS, formatPrice } from '@/types/subscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export interface CreateCheckoutSessionParams {
  userId: string;
  email: string;
  tierId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface SubscriptionStatus {
  tier: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
}

/**
 * Creates a Stripe Checkout Session for subscription
 * @param params - Checkout session parameters
 * @returns Stripe Checkout Session
 */
export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
  const tier = PRICING_TIERS.find(t => t.id === params.tierId);
  if (!tier) {
    throw new Error(`Invalid tier: ${params.tierId}`);
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: params.email,
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: tier.name,
            description: tier.description,
          },
          unit_amount: tier.price * 100, // Convert to cents
          recurring: tier.price > 0 ? {
            interval: 'month',
          } : undefined,
        },
        quantity: 1,
      },
    ],
    mode: tier.price > 0 ? 'subscription' : 'payment',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      userId: params.userId,
      tierId: params.tierId,
    },
  });

  return session;
}

/**
 * Gets subscription status for a customer
 * @param customerId - Stripe customer ID
 * @returns Subscription status
 */
export async function getSubscriptionStatus(customerId: string): Promise<SubscriptionStatus | null> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return null;
    }

    const subscription = subscriptions.data[0];
    const tierId = subscription.items.data[0]?.price?.product as string;

    return {
      tier: tierId,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return null;
  }
}

/**
 * Cancels a subscription
 * @param subscriptionId - Stripe subscription ID
 * @returns Canceled subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Creates Stripe products for all tiers (for initial setup)
 */
export async function createStripeProducts() {
  console.log('🌙 Luna Verde: Creating sacred Stripe products...');
  
  for (const tier of PRICING_TIERS) {
    try {
      const product = await stripe.products.create({
        name: tier.name,
        description: tier.description,
        metadata: {
          tierId: tier.id,
          icon: tier.icon,
        },
      });

      if (tier.price > 0) {
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: tier.price * 100,
          currency: 'usd',
          recurring: {
            interval: 'month',
          },
        });
        
        console.log(`✅ Created ${tier.name}: ${formatPrice(tier.price)} (${price.id})`);
      } else {
        console.log(`✅ Created ${tier.name}: FREE (${product.id})`);
      }
    } catch (error) {
      console.error(`❌ Failed to create ${tier.name}:`, error);
    }
  }
}

export default stripe;