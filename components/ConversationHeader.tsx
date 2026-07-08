"use client";

import { FileDown, FileText, Trash2 } from "lucide-react";
import type { Conversation } from "@/types";
import { useConversations } from "@/components/providers/ConversationsProvider";
import { IconButton } from "@/components/ui/IconButton";
import {
  conversationToMarkdown,
  conversationToText,
  downloadTextFile,
  safeFilename,
} from "@/utils/export";

/**
 * Slim header above the active conversation: title + export (Markdown / text)
 * and delete actions.
 */
export function ConversationHeader({
  conversation,
}: {
  conversation: Conversation;
}) {
  const { deleteConversation } = useConversations();

  const exportMarkdown = () =>
    downloadTextFile(
      `${safeFilename(conversation.title)}.md`,
      conversationToMarkdown(conversation),
      "text/markdown"
    );

  const exportText = () =>
    downloadTextFile(
      `${safeFilename(conversation.title)}.txt`,
      conversationToText(conversation),
      "text/plain"
    );

  return (
    <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b hairline px-4">
      <h2 className="truncate text-sm font-medium">{conversation.title}</h2>
      <div className="flex items-center gap-0.5">
        <IconButton
          label="Export as Markdown"
          size="sm"
          onClick={exportMarkdown}
        >
          <FileText className="h-4 w-4" />
        </IconButton>
        <IconButton label="Export as text" size="sm" onClick={exportText}>
          <FileDown className="h-4 w-4" />
        </IconButton>
        <IconButton
          label="Delete conversation"
          size="sm"
          className="hover:text-red-400"
          onClick={() => deleteConversation(conversation.id)}
        >
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}
