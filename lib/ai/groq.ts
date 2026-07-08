import { AIError, mapUpstreamStatus } from "./errors";
import type { ProviderMessage, ProviderResult } from "./types";

/**
 * Groq adapter. Groq exposes an OpenAI-compatible Chat Completions endpoint,
 * so the request/response shapes mirror OpenAI's.
 */
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function callGroq(
  messages: ProviderMessage[],
  signal?: AbortSignal
): Promise<ProviderResult> {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new AIError(
      "missing_key",
      "GROQ_API_KEY is not set on the server. Add it to your .env.local file.",
      500
    );
  }

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
    signal,
  });

  if (!res.ok) {
    const detail = await safeErrorMessage(res);
    throw mapUpstreamStatus(res.status, detail);
  }

  const data = await res.json();
  const reply: string | undefined = data?.choices?.[0]?.message?.content;
  if (!reply || !reply.trim()) {
    throw new AIError(
      "provider_error",
      "Groq returned an empty response.",
      502
    );
  }

  return { reply: reply.trim(), model };
}

async function safeErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data?.error?.message || JSON.stringify(data);
  } catch {
    return `${res.status} ${res.statusText}`;
  }
}
