// Sacred Domain-Specific Home Page for BLXCKBOOK
// Serves as landing page for blxckbook.jexxx.us domain

"use client";

import { motion } from "framer-motion";
import { MessageCircle, Sparkles, Heart, Zap } from "lucide-react";
import CursorMotion from "@/components/CursorMotion";
import MilkingAnimation from "@/components/MilkingAnimation";
import SEOContent from "@/components/SEOContent";
import { AuthButton } from "@/components/AuthButton";
import { ThemeToggle } from "@/components/ThemeToggle";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const glowVariants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.4, 0.6, 0.4],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

export default function Home() {
  return (
    <>
      <SEOContent />
      <CursorMotion color="rgba(255, 182, 193, 0.6)" size={10} />
      <main className="flex-1 flex flex-col items-center justify-center min-h-[100svh] p-4 relative overflow-hidden">
        {/* Top Right Header Controls */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
          <ThemeToggle />
          <AuthButton />
        </div>
        {/* Animated background elements */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px]"
          variants={glowVariants}
          animate="animate"
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-muted/15 rounded-full blur-[100px]"
          variants={glowVariants}
          animate="animate"
          style={{ animationDelay: "2s" }}
        />

        {/* Main content */}
        <motion.div
          className="relative z-10 max-w-3xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo/Icon */}
          <motion.div
            className="mb-4 inline-flex"
            variants={itemVariants}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-accent/30 rounded-2xl blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <div className="relative w-20 h-20 bg-surface-elevated border border-border rounded-2xl flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-accent" />
              </div>
            </div>
          </motion.div>

          {/* Welcome title */}
          <motion.h1
            className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
            variants={itemVariants}
          >
            <span className="text-foreground">Welcome to </span>
            <span className="text-gradient">BLXCKCHAT</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            A highly interactive, animated chat interface powered by Motion UI
          </motion.p>

          {/* Feature cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            variants={itemVariants}
          >
            {[
              {
                icon: Sparkles,
                title: "Sovereign Intelligence",
                description: "Uncensored, private communion with local models",
              },
              {
                icon: Zap,
                title: "Absolute Privacy",
                description: "Your vault, your data, permanently secured",
              },
              {
                icon: MessageCircle,
                title: "Divine Connection",
                description: "Intimate interactions with JEXXXUS Goddesses",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="group p-6 bg-surface border border-border rounded-xl hover:border-accent/50 transition-colors duration-300"
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <feature.icon className="w-8 h-8 text-accent mb-3 mx-auto group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-foreground font-semibold mb-1">{feature.title}</h3>
                <p className="text-muted text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <MilkingAnimation intensity="passionate">
                <motion.a
                  href="/chat"
                  className="group relative inline-flex items-center gap-2 px-8 py-4 bg-accent text-background font-semibold rounded-full overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <span className="absolute inset-0 bg-linear-to-r from-accent via-accent-muted to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative flex items-center gap-2">
                    Enter Chat
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      →
                    </motion.span>
                  </span>
                </motion.a>
              </MilkingAnimation>

              <motion.a
                href="/subscription"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border bg-surface text-foreground font-semibold rounded-full hover:border-accent/40 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                View Plans
              </motion.a>
            </div>
          </motion.div>

          {/* Status indicator */}
          <motion.div
            className="mt-8 flex items-center justify-center gap-2 text-sm text-muted"
            variants={itemVariants}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-muted" />
            </span>
            System operational
          </motion.div>
        </motion.div>

        {/* Version badge */}
        <motion.div
          className="absolute bottom-6 right-6 text-xs text-muted font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          v0.1.0-alpha
        </motion.div>
      </main>
    </>
  );
}
