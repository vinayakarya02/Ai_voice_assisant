"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { VoiceGender } from "@/types";
import { chunkForSpeech, pickVoice } from "@/lib/voice";

interface SpeakOptions {
  voiceURI?: string | null;
  gender?: VoiceGender;
  rate?: number;
  pitch?: number;
}

interface UseSpeechSynthesisReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  voices: SpeechSynthesisVoice[];
  speak: (text: string, options?: SpeakOptions) => void;
  cancel: () => void;
}

/**
 * Wraps the browser SpeechSynthesis API.
 *
 *  - Loads voices (which populate asynchronously via `voiceschanged`).
 *  - Splits long text into sentence chunks to dodge Chrome's ~15s cutoff bug.
 *  - Tracks a single `isSpeaking` flag across the queued chunks.
 */
export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSupported(false);
      return;
    }
    setIsSupported(true);

    const loadVoices = () => {
      const list = window.speechSynthesis.getVoices();
      if (list.length) {
        voicesRef.current = list;
        setVoices(list);
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* noop */
      }
    };
  }, []);

  const cancel = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* noop */
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, options: SpeakOptions = {}) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      const clean = text.trim();
      if (!clean) return;

      // Stop anything currently playing before starting a new utterance.
      window.speechSynthesis.cancel();

      const { voiceURI = null, gender = "female", rate = 1, pitch = 1 } = options;
      const voice = pickVoice(voicesRef.current, voiceURI, gender);
      const chunks = chunkForSpeech(clean);

      setIsSpeaking(true);

      chunks.forEach((chunk, index) => {
        const utterance = new SpeechSynthesisUtterance(chunk);
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        }
        utterance.rate = Math.min(2, Math.max(0.5, rate));
        utterance.pitch = Math.min(2, Math.max(0, pitch));

        // Only the final chunk clears the speaking flag.
        if (index === chunks.length - 1) {
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = () => setIsSpeaking(false);
        }
        window.speechSynthesis.speak(utterance);
      });
    },
    []
  );

  return { isSupported, isSpeaking, voices, speak, cancel };
}
