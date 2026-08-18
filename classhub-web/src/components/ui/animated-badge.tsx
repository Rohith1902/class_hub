"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedBadgeProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  yOffset?: number;
}

export function AnimatedBadge({ children, className = "", delay = 0, yOffset = 20 }: AnimatedBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.8, 
        delay, 
        type: "spring", 
        stiffness: 100 
      }}
      whileHover={{ scale: 1.05 }}
      className={`absolute flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-md border border-border/50 rounded-full shadow-lg shadow-primary/10 ${className}`}
    >
      {children}
    </motion.div>
  );
}
