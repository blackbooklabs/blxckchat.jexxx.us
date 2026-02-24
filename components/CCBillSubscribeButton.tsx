// Sacred CCBill Subscribe Button Component
// Adult-friendly payment processing for the divine empire

"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { CCBILL_CONFIG } from "@/lib/payments";

interface CCBillSubscribeButtonProps {
  tierId: string;
  userId: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function CCBillSubscribeButton({ 
  tierId, 
  userId, 
  className, 
  onSuccess, 
  onError 
}: CCBillSubscribeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    
    try {
      const tier = CCBILL_CONFIG.forms[tierId as keyof typeof CCBILL_CONFIG.forms];
      const price = getTierPrice(tierId);
      
      if (price === 0) {
        // Free tier - redirect to dashboard
        window.location.href = '/dashboard';
        onSuccess?.();
        return;
      }
      
      // Build CCBill checkout URL
      const checkoutUrl = `https://bill.ccbill.com/jpost/signup.cgi?` +
        `clientAccnum=${CCBILL_CONFIG.clientAccnum}&` +
        `subAccnum=${CCBILL_CONFIG.subAccnum}&` +
        `formName=${tier}&` +
        `price=${price}&` +
        `currencyCode=${CCBILL_CONFIG.currencyCode}&` +
        `custom1=${userId}`;
      
      // Redirect to CCBill checkout
      window.location.href = checkoutUrl;
      onSuccess?.();
      
    } catch (error) {
      console.error('CCBill subscription failed:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTierPrice = (tierId: string): number => {
    const prices: Record<string, number> = {
      'basic-bittie': 0,
      'mistress': 33,
      'concu-bae-bae': 66,
      'mid-wife': 99
    };
    return prices[tierId] || 0;
  };

  const tier = CCBILL_CONFIG.forms[tierId as keyof typeof CCBILL_CONFIG.forms];
  const price = getTierPrice(tierId);
  const buttonText = price === 0 ? 'Start Free' : `Subscribe $${price}/month`;

  return (
    <motion.button
      onClick={handleSubscribe}
      disabled={isLoading}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative inline-flex items-center justify-center
        px-8 py-3 rounded-full font-semibold text-white
        bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500
        hover:brightness-110 transition-all duration-300
        shadow-lg hover:shadow-xl
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className || ''}
      `}
    >
      {/* Sacred glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Button content */}
      <span className="relative z-10">
        {isLoading ? (
          <>
            <motion.div
              className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            Loading...
          </>
        ) : (
          buttonText
        )}
      </span>
      
      {/* Sacred particles effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: [0, (i - 1) * 20, 0],
              y: [0, -10, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeOut"
            }}
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
      </motion.div>
    </motion.button>
  );
}