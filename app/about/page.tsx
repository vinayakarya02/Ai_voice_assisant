import type { Metadata } from "next";
import {
  History,
  Languages,
  Lock,
  Mic,
  Sparkles,
  Volume2,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About — Nova",
  description: APP_TAGLINE,
};

const FEATURES = [
  {
    icon: Mic,
    title: "Voice recognition",
    body: "Push to talk with a live transcript. Nova auto-stops when you finish speaking.",
  },
  {
    icon: Sparkles,
    title: "Smart replies",
    body: "Answers come from fast, free AI models via Groq, Gemini, or OpenRouter.",
  },
  {
    icon: Volume2,
    title: "Natural speech",
    body: "Replies are read aloud with adjustable voice, speed, and pitch.",
  },
  {
    icon: History,
    title: "Conversation history",
    body: "Every chat is saved locally so you can revisit or export it anytime.",
  },
  {
    icon: Lock,
    title: "Private by design",
    body: "No account, no database. Everything lives in your browser.",
  },
  {
    icon: Languages,
    title: "Accessible",
    body: "Keyboard shortcuts, ARIA labels, reduced-motion and high-contrast support.",
  },
];

const STACK = [
  "Next.js 15",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Framer Motion",
  "Web Speech API",
];

const STEPS = [
  "Tap the glowing microphone (or press the Space bar).",
  "Ask a question out loud — your words appear as you speak.",
  "Nova thinks, replies on screen, and reads the answer aloud.",
  "Revisit, copy, regenerate, or export any conversation.",
];

export default function AboutPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        {/* Hero */}
        <div className="flex flex-col items-center text-center">
          <Logo size={56} />
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            {APP_NAME}
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted">{APP_TAGLINE}</p>
        </div>

        {/* Intro */}
        <p className="mx-auto mt-8 max-w-2xl text-center text-[15px] leading-relaxed text-muted">
          {APP_NAME} is a lightweight, Alexa-style voice assistant you can run
          entirely for free. Speak naturally, get concise spoken answers, and
          keep a private history of your conversations — all in the browser.
        </p>

        {/* Features */}
        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500/15 text-indigo-300">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-semibold">{f.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">{f.body}</p>
            </div>
          ))}
        </div>

        {/* How to use */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold">How to use</h2>
          <ol className="mt-4 space-y-3">
            {STEPS.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="btn-gradient grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-semibold text-white">
                  {i + 1}
                </span>
                <span className="text-sm text-muted">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Tech stack */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold">Built with</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {STACK.map((tech) => (
              <span
                key={tech}
                className="glass rounded-full px-3 py-1.5 text-xs text-muted"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        <p className="mt-12 text-center text-xs text-muted">
          {APP_NAME} · Free & open. Uses only free AI APIs. Version 1.0.0
        </p>
      </div>
    </div>
  );
}
