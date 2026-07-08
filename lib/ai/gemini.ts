import { AIError, mapUpstreamStatus } from "./errors";
import type { ProviderMessage, ProviderResult } from "./types";

/**
 * Google Gemini adapter. Gemini's REST API differs from the OpenAI shape:
 *  - "system" messages go into `systemInstruction`
 *  - "assistant" role is called "model"
 *  - messages live under `contents` with `parts: [{ text }]`
 *  - the key is passed as a query param, not a bearer token
 */
export async function callGemini(
  messages: ProviderMessage[],
  signal?: AbortSignal
): Promise<ProviderResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new AIError(
      "missing_key",
      "GEMINI_API_KEY is not set on the server. Add it to your .env.local file.",
      500
    );
  }

  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  // Split out system instructions from the conversational turns.
  const systemText = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");

  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };
  if (systemText) {
    body.systemInstruction = { parts: [{ text: systemText }] };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const detail = await safeErrorMessage(res);
    throw mapUpstreamStatus(res.status, detail);
  }

  const data = await res.json();

  // Content can be withheld for safety reasons — surface that clearly.
  const blockReason = data?.promptFeedback?.blockReason;
  if (blockReason) {
    throw new AIError(
      "provider_error",
      `Gemini blocked the response (${blockReason}). Try rephrasing.`,
      502
    );
  }

  const parts = data?.candidates?.[0]?.content?.parts;
  const reply: string | undefined = Array.isArray(parts)
    ? parts.map((p: { text?: string }) => p?.text || "").join("")
    : undefined;

  if (!reply || !reply.trim()) {
    throw new AIError(
      "provider_error",
      "Gemini returned an empty response.",
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
