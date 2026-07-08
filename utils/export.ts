import type { Conversation } from "@/types";
import { formatDateTime } from "./format";

/**
 * Conversation export helpers (Markdown / plain text) plus a small
 * browser download trigger. All client-side — no server round trip.
 */

export function conversationToMarkdown(convo: Conversation): string {
  const lines: string[] = [];
  lines.push(`# ${convo.title || "Conversation"}`);
  lines.push("");
  lines.push(`_Exported ${formatDateTime(Date.now())}_`);
  lines.push("");
  for (const m of convo.messages) {
    const who = m.role === "user" ? "🧑 You" : "🤖 Assistant";
    lines.push(`### ${who} · ${formatDateTime(m.timestamp)}`);
    lines.push("");
    lines.push(m.content);
    lines.push("");
  }
  return lines.join("\n");
}

export function conversationToText(convo: Conversation): string {
  const lines: string[] = [];
  lines.push(convo.title || "Conversation");
  lines.push("=".repeat((convo.title || "Conversation").length));
  lines.push("");
  for (const m of convo.messages) {
    const who = m.role === "user" ? "You" : "Assistant";
    lines.push(`[${formatDateTime(m.timestamp)}] ${who}:`);
    lines.push(m.content);
    lines.push("");
  }
  return lines.join("\n");
}

/** Trigger a client-side file download for the given text content. */
export function downloadTextFile(
  filename: string,
  content: string,
  mime = "text/plain"
): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Slugify a conversation title into a safe filename stem. */
export function safeFilename(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "conversation"
  );
}
