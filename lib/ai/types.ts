/** Internal message shape passed to provider adapters. */
export interface ProviderMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** Normalized successful result from any provider. */
export interface ProviderResult {
  reply: string;
  model: string;
}

/** Signature every provider adapter implements. */
export type ProviderAdapter = (
  messages: ProviderMessage[],
  signal?: AbortSignal
) => Promise<ProviderResult>;
