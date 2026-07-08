import { AIError, mapUpstreamStatus } from "./errors";
import type { ProviderMessage, ProviderResult } from "./types";

/**
 * OpenRouter adapter. Also OpenAI-compatible. OpenRouter recommends sending
 * `HTTP-Referer` and `X-Title` headers to identify the app (optional).
 */
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function callOpenRouter(
  messages: ProviderMessage[],
  signal?: AbortSignal
): Promise<ProviderResult> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new AIError(
      "missing_key",
      "OPENROUTER_API_KEY is not set on the server. Add it to your .env.local file.",
      500
    );
  }

  const model =
    process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "HTTP-Referer":
        process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
      "X-Title": "Omen Voice Assistant",
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
      "OpenRouter returned an empty response.",
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
