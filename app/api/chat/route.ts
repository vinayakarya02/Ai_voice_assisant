import { NextRequest, NextResponse } from "next/server";
import { generateReply, AIError, type ProviderMessage } from "@/lib/ai";
import {
  SYSTEM_PROMPT,
  MAX_HISTORY_MESSAGES,
  PROVIDERS,
} from "@/lib/constants";
import type { AIProvider, ChatErrorResponse, ChatResponse } from "@/types";

// Run on the Node.js runtime so provider secrets in process.env are available.
export const runtime = "nodejs";
// Never cache AI responses.
export const dynamic = "force-dynamic";

const VALID_PROVIDERS = new Set(PROVIDERS.map((p) => p.id));

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

function errorResponse(
  code: ChatErrorResponse["code"],
  message: string,
  status: number
) {
  return NextResponse.json<ChatErrorResponse>({ error: message, code }, { status });
}

export async function POST(req: NextRequest) {
  // --- Parse & validate the request body ------------------------------------
  let payload: { messages?: unknown; provider?: unknown };
  try {
    payload = await req.json();
  } catch {
    return errorResponse("bad_request", "Request body must be valid JSON.", 400);
  }

  const rawMessages = payload.messages;
  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return errorResponse(
      "bad_request",
      "Please provide a non-empty `messages` array.",
      400
    );
  }

  // Keep only well-formed user/assistant messages with real content.
  const history: IncomingMessage[] = rawMessages
    .filter(
      (m): m is IncomingMessage =>
        !!m &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .map((m) => ({ role: m.role, content: m.content.trim() }));

  if (history.length === 0) {
    return errorResponse(
      "bad_request",
      "Your message was empty. Please say or type something.",
      400
    );
  }

  if (history[history.length - 1].role !== "user") {
    return errorResponse(
      "bad_request",
      "The last message must come from the user.",
      400
    );
  }

  // --- Resolve provider (request overrides env, env overrides default) ------
  const requested =
    typeof payload.provider === "string" ? payload.provider : undefined;
  const provider = (
    requested && VALID_PROVIDERS.has(requested as AIProvider)
      ? requested
      : (process.env.AI_PROVIDER as AIProvider) || "groq"
  ) as AIProvider;

  if (!VALID_PROVIDERS.has(provider)) {
    return errorResponse(
      "bad_request",
      `Unsupported AI provider: "${provider}".`,
      400
    );
  }

  // --- Assemble the prompt: system + trimmed history ------------------------
  const trimmed = history.slice(-MAX_HISTORY_MESSAGES);
  const messages: ProviderMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...trimmed,
  ];

  // --- Call the provider with a timeout -------------------------------------
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const result = await generateReply(provider, messages, controller.signal);
    return NextResponse.json<ChatResponse>({
      reply: result.reply,
      provider,
      model: result.model,
    });
  } catch (err) {
    if (err instanceof AIError) {
      return errorResponse(err.code, err.message, err.status);
    }
    // Aborted (timeout) or network-level failure.
    if (err instanceof Error && err.name === "AbortError") {
      return errorResponse(
        "network",
        "The AI provider took too long to respond. Please try again.",
        504
      );
    }
    return errorResponse(
      "unknown",
      "Something went wrong while contacting the AI provider.",
      500
    );
  } finally {
    clearTimeout(timeout);
  }
}

// Friendly response for accidental GETs.
export async function GET() {
  return NextResponse.json(
    { message: "POST to this endpoint with { messages, provider } to chat." },
    { status: 405 }
  );
}
