// frontend/components/ui/AnimatedSection.tsx

"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";
import { fadeInUp, viewportOnce } from "@/lib/animations";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  variant?: Variants;
  delay?: number;
  as?: "section" | "div" | "article";
}

export default function AnimatedSection({
  children,
  className = "",
  variant = fadeInUp,
  delay = 0,
  as = "section",
}: AnimatedSectionProps) {
  const Component = motion[as];

  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={variant}
      transition={{ delay }}
      className={className}
    >
      {children}
    </Component>
  );
}