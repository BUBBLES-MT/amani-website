// frontend/components/ui/AnimatedStagger.tsx

"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { fadeInUp, viewportOnce } from "@/lib/animations";

interface AnimatedStaggerProps {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
}

export default function AnimatedStagger({
  children,
  className = "",
  itemClassName = "",
}: AnimatedStaggerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeInUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}