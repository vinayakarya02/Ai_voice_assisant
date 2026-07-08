"use client";

import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { useConversations } from "@/components/providers/ConversationsProvider";
import { formatRelative } from "@/utils/format";

/**
 * A compact grid of the most recent conversations, shown at the bottom of the
 * home screen. Selecting one re-opens it. Renders nothing when history is empty.
 */
export function RecentConversations() {
  const { conversations, selectConversation } = useConversations();
  if (conversations.length === 0) return null;

  const recent = conversations.slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
        Recent conversations
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {recent.map((c, i) => (
          <motion.button
            key={c.id}
            type="button"
            onClick={() => selectConversation(c.id)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            whileHover={{ y: -2 }}
            className="glass group flex items-center gap-3 rounded-xl p-3 text-left transition hover:border-indigo-400/40"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-500/15 text-indigo-300">
              <MessageSquare className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {c.title}
              </span>
              <span className="block text-[11px] text-muted">
                {c.messages.length} messages · {formatRelative(c.updatedAt)}
              </span>
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
