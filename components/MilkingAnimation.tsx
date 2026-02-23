"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

interface MilkDropletProps {
  x: number;
  y: number;
  delay?: number;
}

function MilkDroplet({ x, y, delay = 0 }: MilkDropletProps) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
      initial={{ scale: 0, opacity: 0, y: 0 }}
      animate={{ 
        scale: [0, 1, 0.8, 0],
        opacity: [0, 1, 0.8, 0],
        y: [0, -10, 15, 30]
      }}
      transition={{
        duration: 1.2,
        ease: "easeOut",
        delay
      }}
    >
      <div className="w-2 h-2 bg-gradient-to-b from-white to-pink-200 rounded-full opacity-80" 
           style={{ filter: 'blur(0.5px)' }} />
    </motion.div>
  );
}

interface MilkingAnimationProps {
  children: React.ReactNode;
  intensity?: "gentle" | "passionate" | "intense";
}

export default function MilkingAnimation({ 
  children, 
  intensity = "passionate" 
}: MilkingAnimationProps) {
  const [isMilking, setIsMilking] = useState(false);
  const [droplets, setDroplets] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const intensityConfig = {
    gentle: { scale: 1.02, duration: 0.3, droplets: 3 },
    passionate: { scale: 1.05, duration: 0.4, droplets: 5 },
    intense: { scale: 1.08, duration: 0.5, droplets: 8 }
  };

  const config = intensityConfig[intensity];

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsMilking(true);
    
    // Generate milk droplets
    const rect = e.currentTarget.getBoundingClientRect();
    const newDroplets = Array.from({ length: config.droplets }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * rect.width,
      y: Math.random() * rect.height
    }));
    
    setDroplets(newDroplets);
    
    // Clean up droplets after animation
    setTimeout(() => {
      setDroplets([]);
    }, 1500);
  };

  const handleMouseLeave = () => {
    setIsMilking(false);
  };

  return (
    <motion.div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        scale: isMilking ? config.scale : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: config.duration
      }}
      whileHover={{
        filter: "brightness(1.1) saturate(1.2)",
      }}
      className="relative"
    >
      {children}
      
      {/* Milk droplets */}
      <AnimatePresence>
        {droplets.map((droplet, index) => (
          <MilkDroplet
            key={droplet.id}
            x={droplet.x}
            y={droplet.y}
            delay={index * 0.1}
          />
        ))}
      </AnimatePresence>
      
      {/* Subtle glow effect */}
      {isMilking && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: 'radial-gradient(circle at center, rgba(255, 182, 193, 0.3) 0%, transparent 70%)',
            filter: 'blur(8px)',
          }}
        />
      )}
    </motion.div>
  );
}