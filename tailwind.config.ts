import type { Config } from "tailwindcss";

/**
 * Tailwind configuration for the Voice Assistant.
 * The theme is intentionally centered on a dark "AI dashboard" aesthetic:
 * deep slate backgrounds, violet -> indigo -> cyan accents, and a set of
 * custom keyframes used for the microphone / listening / speaking states.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic brand palette (also mirrored as CSS variables in globals.css)
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        accent: {
          cyan: "#22d3ee",
          violet: "#a78bfa",
          fuchsia: "#e879f9",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(99, 102, 241, 0.55)",
        "glow-lg": "0 0 80px -10px rgba(99, 102, 241, 0.6)",
      },
      backgroundImage: {
        "radial-glow":
          "radial-gradient(600px circle at 50% 0%, rgba(99,102,241,0.15), transparent 60%)",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.85)", opacity: "0.7" },
          "80%, 100%": { transform: "scale(1.6)", opacity: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 30px -5px rgba(99,102,241,0.5)" },
          "50%": { boxShadow: "0 0 55px 0px rgba(99,102,241,0.85)" },
        },
        "wave": {
          "0%, 100%": { transform: "scaleY(0.35)" },
          "50%": { transform: "scaleY(1)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        "wave": "wave 1s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.35s ease-out both",
        "shimmer": "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
