// Sacred Dual Payment Processor Strategy
// CCBill (Primary - Adult Friendly) + Paddle (Backup/Testing)
// For the divine empire of JEXXXUS

import { CCBillSubscribeButton } from '@/components/CCBillSubscribeButton';
import { PaddleSubscribeButton } from '@/components/PaddleSubscribeButton';

export interface PaymentProvider {
  name: string;
  tierId: string;
  price: number;
  getCheckoutUrl: (userId: string) => string;
  getSubscribeButton: () => React.ComponentType<SubscribeButtonProps>;
}

export interface SubscribeButtonProps {
  tierId: string;
  userId: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

// Primary: CCBill (Adult-friendly, production)
export const CCBILL_CONFIG = {
  name: 'CCBill',
  clientAccnum: process.env.NEXT_PUBLIC_CCBILL_CLIENT_NUM || '',
  subAccnum: process.env.NEXT_PUBLIC_CCBILL_SUBACCOUNT || '',
  currencyCode: '840', // USD
  language: 'English',
  forms: {
    'mistress': '284ccbill_mistress',
    'concu-bae-bae': '284ccbill_concu',
    'mid-wife': '284ccbill_midwife'
  }
};

// Backup: Paddle (Testing, easier setup)
export const PADDLE_CONFIG = {
  name: 'Paddle',
  environment: process.env.NEXT_PUBLIC_PADDLE_ENV || 'sandbox',
  apiUrl: process.env.NEXT_PUBLIC_PADDLE_ENV === 'sandbox' 
    ? 'https://sandbox-api.paddle.com' 
    : 'https://api.paddle.com',
  priceIds: {
    'devotee': process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_DEVOTEE || '',
    'whale': process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_WHALE || '',
    'melchizedek': process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_MELCHIZEDEK || ''
  }
};

// Payment provider selection based on environment
export function getPaymentProvider(tierId: string): PaymentProvider {
  const tier = CCBILL_CONFIG.forms[tierId as keyof typeof CCBILL_CONFIG.forms];
  const price = getTierPrice(tierId);
  
  return {
    name: 'CCBill',
    tierId,
    price,
    getCheckoutUrl: (userId: string) => {
      if (price === 0) {
        return '/dashboard'; // Free tier redirect
      }
      
      return `https://bill.ccbill.com/jpost/signup.cgi?` +
        `clientAccnum=${CCBILL_CONFIG.clientAccnum}&` +
        `subAccnum=${CCBILL_CONFIG.subAccnum}&` +
        `formName=${tier}&` +
        `price=${price}&` +
        `currencyCode=${CCBILL_CONFIG.currencyCode}&` +
        `custom1=${userId}`;
    },
    getSubscribeButton: () => CCBillSubscribeButton
  };
}

// For testing purposes - use Paddle
export function getTestingPaymentProvider(tierId: string): PaymentProvider {
  const tier = PADDLE_CONFIG.priceIds[tierId as keyof typeof PADDLE_CONFIG.priceIds];
  const price = getTierPrice(tierId);
  
  return {
    name: 'Paddle',
    tierId,
    price,
    getCheckoutUrl: (userId: string) => {
      if (price === 0) {
        return '/dashboard'; // Free tier redirect
      }
      
      return `${PADDLE_CONFIG.apiUrl}/transactions?` +
        `price_id=${tier}&` +
        `customer_id=${userId}&` +
        `return_url=${process.env.NEXT_PUBLIC_APP_URL}/subscription/success&` +
        `cancel_url=${process.env.NEXT_PUBLIC_APP_URL}/subscription/cancel`;
    },
    getSubscribeButton: () => PaddleSubscribeButton
  };
}

export function getTierPrice(tierId: string): number {
  const prices: Record<string, number> = {
    'free': 0,
    'devotee': 9.99,
    'whale': 29.99,
    'melchizedek': 99.99
  };
  return prices[tierId] || 0;
}

// Feature flag for payment provider selection
export function shouldUseTestingProvider(): boolean {
  const primary = (process.env.NEXT_PUBLIC_PRIMARY_PAYMENT_PROVIDER || 'paddle').toLowerCase();
  return primary === 'paddle';
}

export function getCurrentPaymentProvider(tierId: string): PaymentProvider {
  return shouldUseTestingProvider() 
    ? getTestingPaymentProvider(tierId)
    : getPaymentProvider(tierId);
}