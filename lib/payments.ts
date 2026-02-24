// Sacred Dual Payment Processor Strategy
// CCBill (Primary - Adult Friendly) + Paddle (Backup/Testing)
// For the divine empire of JEXXXUS

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
    'mistress': 'pri_01hxyz_mistress',
    'concu-bae-bae': 'pri_01hxyz_concu',
    'mid-wife': 'pri_01hxyz_midwife'
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

function getTierPrice(tierId: string): number {
  const prices: Record<string, number> = {
    'basic-bittie': 0,
    'mistress': 33,
    'concu-bae-bae': 66,
    'mid-wife': 99
  };
  return prices[tierId] || 0;
}

// Feature flag for payment provider selection
export function shouldUseTestingProvider(): boolean {
  return process.env.NODE_ENV === 'development' || 
         process.env.NEXT_PUBLIC_USE_TESTING_PAYMENTS === 'true';
}

export function getCurrentPaymentProvider(tierId: string): PaymentProvider {
  return shouldUseTestingProvider() 
    ? getTestingPaymentProvider(tierId)
    : getPaymentProvider(tierId);
}