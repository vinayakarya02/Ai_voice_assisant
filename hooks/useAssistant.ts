"use client";

import { useCallback, useEffect, useState } from "react";
import { useConversations } from "@/components/providers/ConversationsProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useSpeechSynthesis } from "./useSpeechSynthesis";
import type { Message } from "@/types";
import { uid } from "@/utils/id";

export type AssistantStatus = "idle" | "listening" | "thinking" | "speaking";

export interface AssistantError {
  code: string;
  message: string;
  retryable: boolean;
}

/** Human-friendly copy for each error code. */
const FRIENDLY: Record<string, string> = {
  missing_key:
    "The AI provider isn't configured yet. Add an API key to your .env.local file.",
  rate_limit: "Too many requests right now. Please wait a moment and try again.",
  provider_error: "The AI service ran into a problem. Please try again.",
  network: "Network issue — check your connection and try again.",
  bad_request: "That request couldn't be processed. Try rephrasing.",
  empty: "I didn't catch that. Please try again.",
  mic_permission:
    "Microphone access is blocked. Enable it in your browser and retry.",
  no_speech: "I didn't hear anything. Tap the mic and speak clearly.",
  no_mic: "No microphone was found. Connect one and try again.",
  unsupported:
    "Your browser doesn't support voice input. Try Chrome, Edge, or Safari.",
  unknown: "Something went wrong. Please try again.",
};

type ApiMessage = { role: "user" | "assistant"; content: string };

/**
 * The central controller: converts speech to text, talks to the AI API,
 * persists the conversation, and speaks the reply. Returns a flat interface
 * the UI can drive without touching the underlying browser APIs.
 */
export function useAssistant() {
  const { settings } = useSettings();
  const { activeConversation, appendMessage, updateMessage } =
    useConversations();

  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<AssistantError | null>(null);
  // Id of the assistant message that should play the typewriter animation.
  const [typingId, setTypingId] = useState<string | null>(null);

  const {
    isSpeaking,
    speak: synthSpeak,
    cancel: stopSpeaking,
    isSupported: ttsSupported,
    voices,
  } = useSpeechSynthesis();

  const speak = useCallback(
    (text: string) => {
      synthSpeak(text, {
        voiceURI: settings.voiceURI,
        gender: settings.voiceGender,
        rate: settings.speechRate,
        pitch: settings.speechPitch,
      });
    },
    [
      synthSpeak,
      settings.voiceURI,
      settings.voiceGender,
      settings.speechRate,
      settings.speechPitch,
    ]
  );

  /** POST to /api/chat, returning the reply or throwing an {code,message}. */
  const callApi = useCallback(
    async (messages: ApiMessage[]): Promise<string> => {
      let res: Response;
      try {
        res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages, provider: settings.provider }),
        });
      } catch {
        throw { code: "network", message: FRIENDLY.network };
      }

      let data: { reply?: string; error?: string; code?: string } | null = null;
      try {
        data = await res.json();
      } catch {
        /* non-JSON response */
      }

      if (!res.ok || !data?.reply) {
        const code = data?.code || "unknown";
        throw { code, message: data?.error || FRIENDLY[code] || FRIENDLY.unknown };
      }
      return data.reply;
    },
    [settings.provider]
  );

  /** Shared completion routine used by send / regenerate / retry. */
  const complete = useCallback(
    async (context: ApiMessage[], apply: (reply: string) => void) => {
      setError(null);
      stopSpeaking();
      setIsThinking(true);
      try {
        const reply = await callApi(context);
        apply(reply);
        if (settings.autoSpeak) speak(reply);
      } catch (e) {
        const err = e as { code?: string; message?: string };
        const code = err.code || "network";
        setError({
          code,
          message: err.message || FRIENDLY[code] || FRIENDLY.network,
          retryable: true,
        });
      } finally {
        setIsThinking(false);
      }
    },
    [callApi, settings.autoSpeak, speak, stopSpeaking]
  );

  /** Handle a new user utterance / typed prompt. */
  const sendMessage = useCallback(
    (rawText: string) => {
      const text = rawText.trim();
      if (!text) {
        setError({ code: "empty", message: FRIENDLY.empty, retryable: false });
        return;
      }
      const userMsg: Message = {
        id: uid(),
        role: "user",
        content: text,
        timestamp: Date.now(),
      };
      const prior = activeConversation?.messages ?? [];
      const context: ApiMessage[] = [...prior, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      appendMessage(userMsg);
      const assistantId = uid();
      void complete(context, (reply) => {
        appendMessage({
          id: assistantId,
          role: "assistant",
          content: reply,
          timestamp: Date.now(),
        });
        setTypingId(assistantId);
      });
    },
    [activeConversation, appendMessage, complete]
  );

  /** Re-generate a specific assistant message from the prior context. */
  const regenerate = useCallback(
    (assistantId: string) => {
      const convo = activeConversation;
      if (!convo) return;
      const idx = convo.messages.findIndex((m) => m.id === assistantId);
      if (idx < 1) return;
      const context: ApiMessage[] = convo.messages
        .slice(0, idx)
        .map((m) => ({ role: m.role, content: m.content }));
      if (!context.length || context[context.length - 1].role !== "user") return;

      void complete(context, (reply) => {
        updateMessage(assistantId, {
          content: reply,
          timestamp: Date.now(),
          error: false,
        });
        setTypingId(assistantId);
      });
    },
    [activeConversation, complete, updateMessage]
  );

  /** Retry after a failure (re-send last user turn or regenerate last reply). */
  const retryLast = useCallback(() => {
    const convo = activeConversation;
    if (!convo || convo.messages.length === 0) return;
    const last = convo.messages[convo.messages.length - 1];
    if (last.role === "assistant") {
      regenerate(last.id);
      return;
    }
    const context: ApiMessage[] = convo.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    const assistantId = uid();
    void complete(context, (reply) => {
      appendMessage({
        id: assistantId,
        role: "assistant",
        content: reply,
        timestamp: Date.now(),
      });
      setTypingId(assistantId);
    });
  }, [activeConversation, appendMessage, complete, regenerate]);

  // --- Speech recognition, wired to sendMessage --------------------------
  const {
    isSupported: sttSupported,
    isListening,
    transcript,
    interimTranscript,
    error: recogError,
    permissionDenied,
    start: startListening,
    stop: stopListening,
  } = useSpeechRecognition({ onFinal: sendMessage });

  // Surface runtime recognition errors as friendly toasts.
  useEffect(() => {
    if (!recogError || recogError === "aborted" || recogError === "unsupported")
      return;
    const map: Record<string, { code: string; retryable: boolean }> = {
      "not-allowed": { code: "mic_permission", retryable: true },
      "service-not-allowed": { code: "mic_permission", retryable: true },
      "no-speech": { code: "no_speech", retryable: false },
      "audio-capture": { code: "no_mic", retryable: true },
      network: { code: "network", retryable: true },
    };
    const entry = map[recogError];
    if (entry) {
      setError({ ...entry, message: FRIENDLY[entry.code] });
    }
  }, [recogError]);

  const toggleListening = useCallback(() => {
    if (!sttSupported) {
      setError({
        code: "unsupported",
        message: FRIENDLY.unsupported,
        retryable: false,
      });
      return;
    }
    setError(null);
    if (isListening) {
      stopListening();
    } else {
      stopSpeaking();
      startListening();
    }
  }, [sttSupported, isListening, startListening, stopListening, stopSpeaking]);

  const status: AssistantStatus = isListening
    ? "listening"
    : isThinking
    ? "thinking"
    : isSpeaking
    ? "speaking"
    : "idle";

  return {
    // status
    status,
    isListening,
    isThinking,
    isSpeaking,
    // live transcript
    transcript,
    interimTranscript,
    // capability flags
    sttSupported,
    ttsSupported,
    permissionDenied,
    // errors
    error,
    dismissError: () => setError(null),
    // actions
    toggleListening,
    startListening,
    stopListening,
    sendMessage,
    regenerate,
    retryLast,
    speak,
    stopSpeaking,
    // typing animation
    typingId,
    clearTyping: () => setTypingId(null),
    // data
    voices,
  };
}
