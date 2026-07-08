"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Mic, Square } from "lucide-react";
import type { AssistantStatus } from "@/hooks/useAssistant";
import { cn } from "@/utils/cn";

interface MicButtonProps {
  status: AssistantStatus;
  onClick: () => void;
  /** Diameter of the button in pixels. */
  size?: number;
  disabled?: boolean;
}

/**
 * The glowing, animated microphone — the app's centerpiece.
 *  - idle: gentle breathing glow
 *  - listening: expanding pulse rings + a Stop glyph
 *  - thinking: spinner (disabled)
 *  - speaking: brighter halo, tap to interrupt and talk
 */
export function MicButton({
  status,
  onClick,
  size = 128,
  disabled,
}: MicButtonProps) {
  const listening = status === "listening";
  const thinking = status === "thinking";
  const speaking = status === "speaking";
  const frame = size * 1.7;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: frame, height: frame }}
    >
      {/* Expanding rings while listening */}
      <AnimatePresence>
        {listening &&
          [0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute rounded-full border-2 border-indigo-400/40"
              style={{ width: size, height: size }}
              initial={{ scale: 0.9, opacity: 0.55 }}
              animate={{ scale: 1.9, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
                delay: i * 0.6,
              }}
            />
          ))}
      </AnimatePresence>

      {/* Breathing halo */}
      <motion.span
        className="absolute rounded-full"
        style={{
          width: size * 1.3,
          height: size * 1.3,
          background:
            "radial-gradient(circle, rgba(99,102,241,0.4), transparent 70%)",
        }}
        animate={{
          opacity:
            listening || speaking ? [0.55, 0.95, 0.55] : [0.25, 0.5, 0.25],
          scale: listening ? [1, 1.08, 1] : [1, 1.03, 1],
        }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled || thinking}
        aria-label={listening ? "Stop listening" : "Start listening"}
        aria-pressed={listening}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.94 }}
        className={cn(
          "btn-gradient relative z-10 flex items-center justify-center rounded-full text-white shadow-glow-lg outline-none transition",
          "disabled:cursor-not-allowed disabled:opacity-80",
          listening && "ring-4 ring-indigo-400/50",
          speaking && "ring-4 ring-cyan-400/40"
        )}
        style={{ width: size, height: size }}
      >
        {thinking ? (
          <Loader2 className="animate-spin" size={size * 0.34} />
        ) : listening ? (
          <Square className="fill-current" size={size * 0.3} />
        ) : (
          <Mic size={size * 0.38} />
        )}
      </motion.button>
    </div>
  );
}
