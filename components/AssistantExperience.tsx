"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Square } from "lucide-react";
import { useAssistant, type AssistantStatus } from "@/hooks/useAssistant";
import { useConversations } from "@/components/providers/ConversationsProvider";
import { MicButton } from "@/components/MicButton";
import { ConversationView } from "@/components/ConversationView";
import { ConversationHeader } from "@/components/ConversationHeader";
import { RecentConversations } from "@/components/RecentConversations";
import { PromptInput } from "@/components/PromptInput";
import { ErrorToast } from "@/components/ErrorToast";
import { VoiceWave } from "@/components/VoiceWave";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/utils/cn";

/** Example prompts shown on the empty home screen. */
const SUGGESTIONS = [
  { label: "Fun fact", prompt: "Tell me a surprising fun fact." },
  { label: "Productivity tip", prompt: "Give me a quick productivity tip." },
  {
    label: "Explain simply",
    prompt: "Explain quantum computing in one simple sentence.",
  },
  { label: "Today's idea", prompt: "Suggest a creative idea for my day." },
];

function statusText(status: AssistantStatus): string {
  switch (status) {
    case "listening":
      return "Listening… speak now";
    case "thinking":
      return "Thinking…";
    case "speaking":
      return "Speaking…";
    default:
      return "Tap the mic or press Space to talk";
  }
}

/**
 * The full home experience. Shows a centered hero when there's no active
 * conversation, and a scrolling transcript + control dock once a chat begins.
 */
export function AssistantExperience() {
  const a = useAssistant();
  const { activeConversation } = useConversations();
  const hasMessages =
    !!activeConversation && activeConversation.messages.length > 0;

  // Keyboard shortcut: Space toggles listening (ignored while typing).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat || e.metaKey || e.ctrlKey || e.altKey)
        return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "BUTTON" ||
        target?.isContentEditable
      ) {
        return;
      }
      e.preventDefault();
      a.toggleListening();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [a]);

  return (
    <div className="relative flex h-full flex-col">
      {hasMessages ? (
        <>
          <ConversationHeader conversation={activeConversation} />
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ConversationView
              conversation={activeConversation}
              isThinking={a.isThinking}
              typingId={a.typingId}
              onTypingDone={a.clearTyping}
              onRegenerate={a.regenerate}
              onSpeak={a.speak}
              listening={a.isListening}
              transcript={a.transcript}
              interimTranscript={a.interimTranscript}
              busy={a.isThinking}
            />
          </div>
          <ControlDock a={a} />
        </>
      ) : (
        <Hero a={a} />
      )}

      <ErrorToast
        error={a.error}
        onRetry={a.retryLast}
        onDismiss={a.dismissError}
      />
    </div>
  );
}

/** Centered welcome hero with the big mic, suggestions, and recent chats. */
function Hero({ a }: { a: ReturnType<typeof useAssistant> }) {
  const showLive =
    a.isListening && (a.transcript.length > 0 || a.interimTranscript.length > 0);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <MicButton status={a.status} onClick={a.toggleListening} size={132} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-10 text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          <span className="gradient-text">How can I help you today?</span>
        </motion.h1>

        <p className="mt-3 flex items-center gap-2 text-sm text-muted">
          {(a.status === "listening" || a.status === "speaking") && (
            <VoiceWave
              active
              className="h-4"
              color={a.status === "speaking" ? "#67e8f9" : "#a5b4fc"}
            />
          )}
          {statusText(a.status)}
        </p>

        {showLive && (
          <p className="mt-5 max-w-lg text-base">
            {a.transcript}
            <span className="text-muted">{a.interimTranscript}</span>
          </p>
        )}

        {a.isSpeaking && (
          <button
            type="button"
            onClick={a.stopSpeaking}
            className="glass mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition hover:border-red-400/40"
          >
            <Square className="h-3.5 w-3.5 fill-current text-red-400" />
            Stop speaking
          </button>
        )}

        {/* Suggestion chips */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-2.5">
          {SUGGESTIONS.map((s, i) => (
            <motion.button
              key={s.label}
              type="button"
              onClick={() => a.sendMessage(s.prompt)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.07, duration: 0.3 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm text-muted transition-colors hover:text-[var(--fg)] hover:border-indigo-400/50"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
              {s.label}
            </motion.button>
          ))}
        </div>

        {/* Typed fallback */}
        <div className="mt-6 w-full max-w-lg">
          <PromptInput onSubmit={a.sendMessage} disabled={a.isThinking} />
        </div>
      </div>

      <RecentConversations />
    </div>
  );
}

/** Footer control dock shown during an active conversation. */
function ControlDock({ a }: { a: ReturnType<typeof useAssistant> }) {
  return (
    <div className="shrink-0 border-t hairline glass">
      <div className="mx-auto w-full max-w-3xl px-4 py-3">
        <div className="flex items-center gap-4">
          <MicButton status={a.status} onClick={a.toggleListening} size={56} />

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2 text-xs text-muted">
              {(a.status === "listening" || a.status === "speaking") && (
                <VoiceWave
                  active
                  bars={4}
                  className="h-3"
                  color={a.status === "speaking" ? "#67e8f9" : "#a5b4fc"}
                />
              )}
              <span>{statusText(a.status)}</span>
              {a.isSpeaking && (
                <button
                  type="button"
                  onClick={a.stopSpeaking}
                  className={cn(
                    "ml-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5",
                    "text-red-300 transition hover:text-red-200"
                  )}
                >
                  <Square className="h-3 w-3 fill-current" />
                  Stop
                </button>
              )}
            </div>
            <PromptInput onSubmit={a.sendMessage} disabled={a.isThinking} />
          </div>
        </div>
      </div>
    </div>
  );
}
