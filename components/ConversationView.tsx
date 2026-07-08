"use client";

import { useEffect, useRef } from "react";
import type { Conversation } from "@/types";
import { MessageBubble } from "@/components/MessageBubble";
import { ResponseCard } from "@/components/ResponseCard";
import { ThinkingIndicator } from "@/components/ThinkingIndicator";
import { LiveTranscript } from "@/components/LiveTranscript";

interface ConversationViewProps {
  conversation: Conversation;
  isThinking: boolean;
  typingId: string | null;
  onTypingDone: () => void;
  onRegenerate: (messageId: string) => void;
  onSpeak: (text: string) => void;
  listening: boolean;
  transcript: string;
  interimTranscript: string;
  busy: boolean;
}

/**
 * The scrollable transcript of a conversation. Auto-scrolls to the newest
 * content (messages, live transcript, or the thinking indicator).
 */
export function ConversationView({
  conversation,
  isThinking,
  typingId,
  onTypingDone,
  onRegenerate,
  onSpeak,
  listening,
  transcript,
  interimTranscript,
  busy,
}: ConversationViewProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const showLive = listening && (transcript.length > 0 || interimTranscript.length > 0);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [
    conversation.messages.length,
    isThinking,
    transcript,
    interimTranscript,
    showLive,
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6">
      {conversation.messages.map((m) =>
        m.role === "user" ? (
          <MessageBubble key={m.id} message={m} />
        ) : (
          <ResponseCard
            key={m.id}
            message={m}
            animate={m.id === typingId}
            onTypingDone={onTypingDone}
            onRegenerate={() => onRegenerate(m.id)}
            onSpeak={() => onSpeak(m.content)}
            busy={busy}
          />
        )
      )}

      {showLive && (
        <LiveTranscript transcript={transcript} interim={interimTranscript} />
      )}
      {isThinking && <ThinkingIndicator />}

      <div ref={endRef} />
    </div>
  );
}
