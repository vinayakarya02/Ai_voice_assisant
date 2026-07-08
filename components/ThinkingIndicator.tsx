"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { LoadingDots } from "@/components/LoadingDots";

/**
 * The "Thinking…" placeholder shown while awaiting the AI response, complete
 * with animated dots and a lightweight time estimate.
 */
export function ThinkingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <Logo size={30} className="mt-0.5" />
      <div className="glass rounded-2xl rounded-tl-md px-4 py-3">
        <div className="flex items-center gap-2 text-muted">
          <span className="text-sm font-medium">Thinking</span>
          <LoadingDots className="text-indigo-300" />
          <span className="hidden text-[11px] text-muted/80 sm:inline">
            · usually a few seconds
          </span>
        </div>
      </div>
    </motion.div>
  );
}
