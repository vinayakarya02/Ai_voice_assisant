"use client";

import { motion } from "framer-motion";
import type { Message } from "@/types";
import { formatClock } from "@/utils/format";

/**
 * A user message: right-aligned gradient bubble with a timestamp.
 */
export function MessageBubble({ message }: { message: Message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex justify-end"
    >
      <div className="btn-gradient max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-white shadow-glow">
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
          {message.content}
        </p>
        <p className="mt-1 text-right text-[11px] text-white/70">
          {formatClock(message.timestamp)}
        </p>
      </div>
    </motion.div>
  );
}
