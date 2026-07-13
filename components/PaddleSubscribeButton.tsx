// Sacred Paddle Subscribe Button Component
// Backup/testing payment processor for the divine empire

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PADDLE_CONFIG, getTierPrice } from "@/lib/payments";

interface PaddleSubscribeButtonProps {
  tierId: string;
  userId: string;
  className?: string;
  label?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function PaddleSubscribeButton({ 
  tierId, 
  userId, 
  className, 
  label,
  onSuccess, 
  onError 
}: PaddleSubscribeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    
    try {
      const tier = PADDLE_CONFIG.priceIds[tierId as keyof typeof PADDLE_CONFIG.priceIds];
      const price = getTierPrice(tierId);
      
      if (price === 0) {
        // Free tier - redirect to dashboard
        window.location.href = '/dashboard';
        onSuccess?.();
        return;
      }
      
      if (!tier) {
        throw new Error(`Paddle price is not configured for tier: ${tierId}`);
      }

      const checkoutRes = await fetch('/api/paddle/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId, userId }),
      });

      const checkoutJson = await checkoutRes.json();
      if (!checkoutRes.ok || !checkoutJson?.checkoutUrl) {
        throw new Error(checkoutJson?.error || 'Unable to create Paddle checkout');
      }

      window.location.href = checkoutJson.checkoutUrl;
      onSuccess?.();
      
    } catch (error) {
      console.error('Paddle checkout failed:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const tier = PADDLE_CONFIG.priceIds[tierId as keyof typeof PADDLE_CONFIG.priceIds];
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
        bg-linear-to-r from-blue-500 via-cyan-500 to-teal-500
        hover:brightness-110 transition-all duration-300
        shadow-lg hover:shadow-xl
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className || ''}
      `}
    >
      {/* Sacred ripple effect */}
      <motion.div
        className="absolute inset-0 bg-linear-to-r from-white/20 to-transparent rounded-full"
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
          label || buttonText
        )}
      </span>
      
      {/* Sacred wave effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: [0, (i - 1) * 15, 0],
              y: [0, -8, 0]
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