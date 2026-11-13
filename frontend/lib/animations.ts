// frontend/lib/animations.ts

import { Variants } from "framer-motion";

// ============================================
// 🎯 EASING — Kama POS (Material Design)
// ============================================
// ✅ POS inatumia cubic-bezier(0.4, 0, 0.2, 1)
const easeOutExpo = [0.4, 0, 0.2, 1] as const;
const easeInOutSoft = [0.4, 0, 0.2, 1] as const;

// ============================================
// ✅ FADE IN UP — Kwa sections (default)
// ============================================
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
};

// ============================================
// ✅ FADE IN DOWN — Kwa hero
// ============================================
export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
};

// ============================================
// ✅ FADE IN SCALE — Kwa cards
// ============================================
export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
};

// ============================================
// ✅ FADE IN LEFT — Kwa cards upande wa kushoto
// ============================================
export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
};

// ============================================
// ✅ FADE IN RIGHT — Kwa cards upande wa kulia
// ============================================
export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
};

// ============================================
// ✅ STAGGER CONTAINER — Kwa grids
// ✅ POS: delay 0.1s tu (kama .stagger-1, .stagger-2)
// ============================================
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// ============================================
// ✅ STAGGER ITEM — Kwa kila card
// ✅ POS: y 30, duration 0.6s, easing ya POS
// ============================================
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
};

// ============================================
// ✅ HERO TEXT — Kwa jina kubwa
// ============================================
export const heroText: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: easeOutExpo },
  },
};

// ============================================
// ✅ SCALE IN — Kwa icons, badges
// ============================================
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
};

// ============================================
// ✅ SLIDE DOWN — Kwa navbar, headers
// ============================================
export const slideDown: Variants = {
  hidden: { opacity: 0, y: -100 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
};

// ============================================
// ✅ SLIDE UP — Kwa footer
// ============================================
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: easeOutExpo },
  },
};

// ============================================
// ✅ BLOB — Kwa background decorations
// ============================================
export const blobAnimation: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 1.2, ease: easeInOutSoft },
  },
};

// ============================================
// ✅ VIEWPORT SETTINGS
// ============================================
export const viewportOnce = {
  once: true,
  margin: "-80px",
} as const;

export const viewportRepeat = {
  once: false,
  margin: "-80px",
} as const;

// ============================================
// ✅ PAGE TRANSITION
// ============================================
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3, ease: easeOutExpo },
  },
};

// ============================================
// ✅ LIST ITEM — Kwa lists
// ============================================
export const listItem: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
};

// ============================================
// ✅ HOVER / TAP
// ============================================
export const hoverScale = {
  scale: 1.02,
  transition: { duration: 0.2, ease: easeOutExpo },
} as const;

export const tapScale = {
  scale: 0.98,
} as const;

// ============================================
// ✅ DEFAULT TRANSITION
// ============================================
export const defaultTransition = {
  duration: 0.6,
  ease: easeOutExpo,
} as const;