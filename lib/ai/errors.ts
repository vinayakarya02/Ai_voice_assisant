import type { ChatErrorResponse } from "@/types";

export type AICode = ChatErrorResponse["code"];

/**
 * A typed error thrown by provider adapters. Carries a machine-readable
 * `code` and an HTTP `status` so the API route can respond consistently.
 */
export class AIError extends Error {
  code: AICode;
  status: number;

  constructor(code: AICode, message: string, status = 500) {
    super(message);
    this.name = "AIError";
    this.code = code;
    this.status = status;
  }
}

/** Map an upstream provider HTTP status to our error taxonomy. */
export function mapUpstreamStatus(status: number, detail: string): AIError {
  if (status === 401 || status === 403) {
    return new AIError(
      "missing_key",
      "The AI provider rejected the API key. Check that it is valid.",
      502
    );
  }
  if (status === 429) {
    return new AIError(
      "rate_limit",
      "The AI provider is rate limiting requests. Please wait a moment and try again.",
      429
    );
  }
  return new AIError(
    "provider_error",
    detail || "The AI provider returned an error.",
    502
  );
}
