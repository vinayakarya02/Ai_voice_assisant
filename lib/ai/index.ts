import type { AIProvider } from "@/types";
import { AIError } from "./errors";
import { callGemini } from "./gemini";
import { callGroq } from "./groq";
import { callOpenRouter } from "./openrouter";
import type { ProviderAdapter, ProviderMessage, ProviderResult } from "./types";

const ADAPTERS: Record<AIProvider, ProviderAdapter> = {
  groq: callGroq,
  gemini: callGemini,
  openrouter: callOpenRouter,
};

/**
 * Dispatch a chat completion to the configured provider.
 * Throws {@link AIError} on any failure (missing key, rate limit, etc.).
 */
export async function generateReply(
  provider: AIProvider,
  messages: ProviderMessage[],
  signal?: AbortSignal
): Promise<ProviderResult> {
  const adapter = ADAPTERS[provider];
  if (!adapter) {
    throw new AIError(
      "bad_request",
      `Unknown AI provider: "${provider}".`,
      400
    );
  }
  return adapter(messages, signal);
}

export { AIError };
export type { ProviderMessage, ProviderResult };
