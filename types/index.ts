/**
 * Shared domain types for the Voice Assistant app.
 */

export type Role = "user" | "assistant";

/** A single message within a conversation. */
export interface Message {
  id: string;
  role: Role;
  content: string;
  /** Unix epoch (ms). */
  timestamp: number;
  /** Marks a message that failed to generate, so the UI can offer a retry. */
  error?: boolean;
}

/** A full conversation thread, persisted to localStorage. */
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export type AIProvider = "groq" | "gemini" | "openrouter";
export type VoiceGender = "female" | "male";
export type ThemeMode = "dark" | "light";

/** User-configurable settings, persisted to localStorage. */
export interface Settings {
  provider: AIProvider;
  voiceGender: VoiceGender;
  /** The exact SpeechSynthesis voiceURI the user picked, if any. */
  voiceURI: string | null;
  /** SpeechSynthesis rate: 0.5 (slow) – 2 (fast). */
  speechRate: number;
  /** SpeechSynthesis pitch: 0 – 2. */
  speechPitch: number;
  /** Automatically speak assistant replies aloud. */
  autoSpeak: boolean;
  theme: ThemeMode;
}

/** Shape of a successful /api/chat response. */
export interface ChatResponse {
  reply: string;
  provider: AIProvider;
  model: string;
}

/** Shape of an error /api/chat response. */
export interface ChatErrorResponse {
  error: string;
  code:
    | "missing_key"
    | "rate_limit"
    | "provider_error"
    | "bad_request"
    | "network"
    | "unknown";
}
