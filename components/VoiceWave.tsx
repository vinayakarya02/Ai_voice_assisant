"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface VoiceWaveProps {
  /** Whether the wave is actively animating. */
  active?: boolean;
  bars?: number;
  className?: string;
  /** Accent color of the bars (defaults to indigo). */
  color?: string;
}

/**
 * An equalizer-style bar animation used for the listening / speaking states.
 * When inactive, bars rest at a low height.
 */
export function VoiceWave({
  active = true,
  bars = 5,
  className,
  color = "#a5b4fc",
}: VoiceWaveProps) {
  // Staggered peak heights so the wave looks organic rather than uniform.
  const peaks = [0.55, 0.95, 0.7, 1, 0.6];

  return (
    <div
      className={cn("flex items-center justify-center gap-1", className)}
      aria-hidden="true"
    >
      {Array.from({ length: bars }).map((_, i) => {
        const peak = peaks[i % peaks.length];
        return (
          <motion.span
            key={i}
            className="w-1 rounded-full"
            style={{ backgroundColor: color, height: 24 }}
            initial={{ scaleY: 0.3 }}
            animate={
              active
                ? { scaleY: [0.3, peak, 0.3] }
                : { scaleY: 0.3 }
            }
            transition={
              active
                ? {
                    duration: 0.9,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.09,
                  }
                : { duration: 0.2 }
            }
          />
        );
      })}
    </div>
  );
}
