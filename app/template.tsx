"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * `template.tsx` remounts on every navigation, which makes it the natural
 * place for App Router page-enter animations (a gentle fade + rise).
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
