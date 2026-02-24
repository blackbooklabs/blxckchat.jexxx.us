// Sacred CCBill Webhook Handler
// Processes adult-friendly payment notifications for the divine empire

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { clerkClient } from "@clerk/nextjs/server";
import { getTierById } from "@/types/subscription";

/**
 * CCBill Webhook Event Types
 */
interface CCBillWebhookPayload {
  event_type: string;
  data: {
    customer_id?: string;
    subscription_id?: string;
    formName?: string;
    price?: string;
    currencyCode?: string;
    custom1?: string; // Our user ID
    subscriptionStatus?: string;
    nextBillDate?: string;
    cancelDate?: string;
  };
  timestamp: string;
}

/**
 * Maps CCBill form names to our tier IDs
 */
function mapCCBillFormToTier(formName: string): string {
  const mapping: Record<string, string> = {
    '284ccbill_mistress': 'mistress',
    '284ccbill_concu': 'concu-bae-bae',
    '284ccbill_midwife': 'mid-wife'
  };
  return mapping[formName] || 'basic-bittie';
}

/**
 * Maps CCBill subscription status to our status
 */
function mapCCBillStatus(status: string): string {
  const mapping: Record<string, string> = {
    'active': 'active',
    'canceled': 'canceled',
    'expired': 'canceled',
    'suspended': 'past_due'
  };
  return mapping[status] || 'unknown';
}

/**
 * Verifies CCBill webhook signature
 */
function verifyCCBillWebhook(body: string, signature: string | null): boolean {
  // CCBill webhook verification implementation
  // This would typically involve checking against a shared secret
  // For now, we'll implement a basic check - replace with proper verification
  
  if (!signature) return false;
  
  // Implement proper CCBill webhook signature verification
  // See CCBill documentation for specific implementation
  
  return true; // Simplified for now - implement properly!
}

/**
 * CCBill Webhook Handler
 * Processes payment notifications and updates user tiers
 */
export async function POST(request: NextRequest) {
  try {
    // Get webhook signature for verification
    const signature = request.headers.get('ccbill-signature');
    const body = await request.text();
    
    // Verify webhook signature
    if (!verifyCCBillWebhook(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }
    
    const payload: CCBillWebhookPayload = JSON.parse(body);
    const { event_type, data } = payload;
    
    console.log('🌙 Luna Verde: CCBill webhook received', { event_type, data });
    
    switch (event_type) {
      case 'subscription.created':
      case 'subscription.activated':
        await handleSubscriptionCreated(data);
        break;
        
      case 'subscription.canceled':
      case 'subscription.expired':
        await handleSubscriptionCanceled(data);
        break;
        
      case 'subscription.updated':
        await handleSubscriptionUpdated(data);
        break;
        
      case 'payment.success':
        await handlePaymentSuccess(data);
        break;
        
      case 'payment.failed':
        await handlePaymentFailed(data);
        break;
        
      default:
        console.log('🌙 Luna Verde: Unknown CCBill event type:', event_type);
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('🌙 Luna Verde: CCBill webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handles new subscription creation
 */
async function handleSubscriptionCreated(data: CCBillWebhookPayload['data']) {
  const userId = data.custom1;
  const tierId = mapCCBillFormToTier(data.formName || '');
  const tier = getTierById(tierId);
  
  if (!userId) {
    console.error('🌙 Luna Verde: No user ID in CCBill webhook');
    return;
  }
  
  console.log('🌙 Luna Verde: Processing new subscription', { userId, tierId, tier: tier.name });
  
  try {
    // Update Clerk user metadata
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        tier: tierId,
        subscription: {
          status: 'active',
          provider: 'ccbill',
          tierName: tier.name,
          price: tier.price,
          updatedAt: new Date().toISOString(),
          subscriptionId: data.subscription_id
        }
      }
    });
    
    console.log('🌙 Luna Verde: User tier updated successfully', { userId, tierId });
    
  } catch (error) {
    console.error('🌙 Luna Verde: Failed to update user tier:', error);
  }
}

/**
 * Handles subscription cancellation
 */
async function handleSubscriptionCanceled(data: CCBillWebhookPayload['data']) {
  const userId = data.custom1;
  
  if (!userId) {
    console.error('🌙 Luna Verde: No user ID in CCBill webhook');
    return;
  }
  
  console.log('🌙 Luna Verde: Processing subscription cancellation', { userId });
  
  try {
    // Update Clerk user metadata to free tier
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        tier: 'basic-bittie',
        subscription: {
          status: 'canceled',
          provider: 'ccbill',
          canceledAt: new Date().toISOString(),
          subscriptionId: data.subscription_id
        }
      }
    });
    
    console.log('🌙 Luna Verde: User subscription canceled', { userId });
    
  } catch (error) {
    console.error('🌙 Luna Verde: Failed to cancel subscription:', error);
  }
}

/**
 * Handles subscription updates
 */
async function handleSubscriptionUpdated(data: CCBillWebhookPayload['data']) {
  const userId = data.custom1;
  const newTierId = mapCCBillFormToTier(data.formName || '');
  const newTier = getTierById(newTierId);
  
  if (!userId) {
    console.error('🌙 Luna Verde: No user ID in CCBill webhook');
    return;
  }
  
  console.log('🌙 Luna Verde: Processing subscription update', { userId, newTierId, newTier: newTier.name });
  
  try {
    // Update Clerk user metadata with new tier
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        tier: newTierId,
        subscription: {
          status: 'active',
          provider: 'ccbill',
          tierName: newTier.name,
          price: newTier.price,
          updatedAt: new Date().toISOString(),
          subscriptionId: data.subscription_id
        }
      }
    });
    
    console.log('🌙 Luna Verde: User tier updated successfully', { userId, newTierId });
    
  } catch (error) {
    console.error('🌙 Luna Verde: Failed to update subscription:', error);
  }
}

/**
 * Handles successful payments
 */
async function handlePaymentSuccess(data: CCBillWebhookPayload['data']) {
  const userId = data.custom1;
  
  if (!userId) {
    console.error('🌙 Luna Verde: No user ID in CCBill webhook');
    return;
  }
  
  console.log('🌙 Luna Verde: Payment successful', { userId, amount: data.price });
  
  // Could send confirmation email, update analytics, etc.
  // For now, just log the success
}

/**
 * Handles failed payments
 */
async function handlePaymentFailed(data: CCBillWebhookPayload['data']) {
  const userId = data.custom1;
  
  if (!userId) {
    console.error('🌙 Luna Verde: No user ID in CCBill webhook');
    return;
  }
  
  console.log('🌙 Luna Verde: Payment failed', { userId, amount: data.price });
  
  // Could send notification email, update user status, etc.
  // For now, just log the failure
}

/**
 * CCBill Webhook Route Handler
 */
export async function GET(request: NextRequest) {
  // CCBill might send GET requests for webhook verification
  return NextResponse.json({ 
    message: 'CCBill webhook endpoint active',
    timestamp: new Date().toISOString()
  });
}