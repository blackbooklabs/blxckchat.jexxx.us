"use client";

import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface CursorMotionProps {
  color?: string;
  size?: number;
  trailLength?: number;
}

export default function CursorMotion({ 
  color = "rgba(255, 20, 147, 0.6)", 
  size = 8,
  trailLength = 20 
}: CursorMotionProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useSpring(0, { stiffness: 500, damping: 25 });
  const mouseY = useSpring(0, { stiffness: 500, damping: 25 });
  
  const trailX = useTransform(mouseX, (x) => x);
  const trailY = useTransform(mouseY, (y) => y);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      {/* Main cursor */}
      <motion.div
        ref={cursorRef}
        className="fixed pointer-events-none z-50 mix-blend-screen"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div 
          className="rounded-full blur-sm"
          style={{
            width: size,
            height: size,
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            boxShadow: `0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color}`,
          }}
        />
      </motion.div>

      {/* Trail effect */}
      <motion.div
        ref={trailRef}
        className="fixed pointer-events-none z-40"
        style={{
          x: trailX,
          y: trailY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: [0.5, 1, 0.5],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.1
        }}
      >
        <div 
          className="rounded-full"
          style={{
            width: size * 1.5,
            height: size * 1.5,
            background: `radial-gradient(circle, ${color} 0%, transparent 60%)`,
            filter: 'blur(1px)',
          }}
        />
      </motion.div>

      {/* Milk droplets */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed pointer-events-none z-30"
          style={{
            x: useTransform(trailX, (x) => x + (Math.random() - 0.5) * 20),
            y: useTransform(trailY, (y) => y + (Math.random() - 0.5) * 20),
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
            delay: i * 0.2
          }}
        >
          <div 
            className="rounded-full bg-white"
            style={{
              width: 3,
              height: 3,
              filter: 'blur(0.5px)',
            }}
          />
        </motion.div>
      ))}
    </>
  );
}