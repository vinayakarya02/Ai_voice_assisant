import type { AIProvider, Settings } from "@/types";

/** localStorage keys (namespaced to avoid collisions). */
export const STORAGE_KEYS = {
  conversations: "va.conversations.v1",
  settings: "va.settings.v1",
  activeConversation: "va.activeConversation.v1",
} as const;

/** Default user settings, applied on first load. */
export const DEFAULT_SETTINGS: Settings = {
  provider: "groq",
  voiceGender: "female",
  voiceURI: null,
  speechRate: 1,
  speechPitch: 1,
  autoSpeak: true,
  theme: "dark",
};

/**
 * System prompt tuned for a *spoken* assistant: concise, natural, no markdown.
 */
export const SYSTEM_PROMPT = `You are "Omen", a friendly and helpful voice assistant, similar to Alexa.
Your replies are read aloud by a text-to-speech engine, so:
- Keep answers natural, conversational, and concise (usually 1-3 sentences) unless the user explicitly asks for detail.
- Do NOT use markdown, bullet points, headings, code fences, or emojis, since they do not read well aloud.
- Spell out things that should be spoken naturally (e.g. say "10 a.m." not "10:00").
- If you are unsure or lack real-time data, say so briefly and honestly.
Be warm, upbeat, and get to the point.`;

/** How many recent messages to send to the model for context. */
export const MAX_HISTORY_MESSAGES = 12;

export interface ProviderMeta {
  id: AIProvider;
  label: string;
  description: string;
  keyEnv: string;
  signupUrl: string;
  defaultModel: string;
}

/** Metadata used by the Settings UI and docs. */
export const PROVIDERS: ProviderMeta[] = [
  {
    id: "groq",
    label: "Groq",
    description: "Extremely fast, generous free tier. Recommended default.",
    keyEnv: "GROQ_API_KEY",
    signupUrl: "https://console.groq.com/keys",
    defaultModel: "llama-3.3-70b-versatile",
  },
  {
    id: "gemini",
    label: "Google Gemini",
    description: "Google's free Gemini Flash models.",
    keyEnv: "GEMINI_API_KEY",
    signupUrl: "https://aistudio.google.com/app/apikey",
    defaultModel: "gemini-1.5-flash",
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    description: "Access many free community models through one key.",
    keyEnv: "OPENROUTER_API_KEY",
    signupUrl: "https://openrouter.ai/keys",
    defaultModel: "meta-llama/llama-3.3-70b-instruct:free",
  },
];

export const APP_NAME = "Omen";
export const APP_TAGLINE = "Your free, private AI voice assistant";
