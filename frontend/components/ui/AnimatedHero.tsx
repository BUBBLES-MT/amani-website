// frontend/components/ui/AnimatedHero.tsx

"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { heroText, staggerContainer, staggerItem } from "@/lib/animations";

// ============================================
// ✅ AnimatedHero — Container ya hero
// ============================================
export function AnimatedHero({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// ✅ AnimatedHeroItem — Kila kipengele cha hero
// ============================================
export function AnimatedHeroItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

// ============================================
// ✅ AnimatedHeroText — Kwa jina kubwa
// ============================================
export function AnimatedHeroText({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={heroText} className={className}>
      {children}
    </motion.div>
  );
}