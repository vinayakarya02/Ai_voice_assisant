import type { CSSProperties } from "react";

/**
 * Ambient animated backdrop: three slowly-drifting, blurred color orbs (an
 * "aurora" effect), a faint edge-masked grid, and a field of gently rising
 * particles. Rendered once behind all app content. Purely decorative and
 * non-interactive.
 *
 * All motion is CSS-driven (see globals.css), so it is GPU-composited and is
 * automatically frozen for users who prefer reduced motion. Particle values
 * are derived deterministically from the index (no Math.random) to stay
 * SSR-safe / hydration-stable.
 */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 61) % 100, // spread across the width
  size: 4 + (i % 4) * 2, // 4–10px
  duration: 18 + (i % 6) * 3, // 18–33s
  delay: (i % 9) * 2.1, // staggered starts
  drift: ((i % 5) - 2) * 26, // -52…52px horizontal drift
}));

export function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      <div className="bg-grid" />

      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={
            {
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              "--drift": `${p.drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
