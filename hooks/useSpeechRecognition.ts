"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecognitionError =
  | SpeechRecognitionErrorCode
  | "unsupported"
  | "unknown";

interface UseSpeechRecognitionOptions {
  lang?: string;
  /** Called with the final transcript when recognition ends with content. */
  onFinal?: (transcript: string) => void;
}

interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  /** Finalized speech so far. */
  transcript: string;
  /** In-progress (not yet finalized) speech, for a live preview. */
  interimTranscript: string;
  error: RecognitionError | null;
  permissionDenied: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

/**
 * Wraps the browser SpeechRecognition API with a friendly React interface.
 *
 * Behavior:
 *  - `continuous = false` so recognition auto-stops when the user pauses.
 *  - Live interim results are exposed for an on-screen transcript.
 *  - Permission denial (`not-allowed`) is detected and surfaced.
 *  - `onFinal` fires once, when recognition ends with a non-empty transcript.
 */
export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const { lang = "en-US", onFinal } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<RecognitionError | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalRef = useRef("");
  const shouldEmitRef = useRef(false);
  const onFinalRef = useRef(onFinal);

  // Keep the latest onFinal without re-creating the recognition instance.
  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) {
      setIsSupported(false);
      setError("unsupported");
      return;
    }
    setIsSupported(true);

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = false; // auto-stop on pause
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setPermissionDenied(false);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = finalRef.current;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }
      finalRef.current = final;
      setTranscript(final);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setPermissionDenied(true);
      }
      // "aborted" and "no-speech" are benign; don't emit onFinal for them.
      shouldEmitRef.current = false;
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
      const finalText = finalRef.current.trim();
      if (shouldEmitRef.current && finalText) {
        shouldEmitRef.current = false;
        onFinalRef.current?.(finalText);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.abort();
      } catch {
        /* noop */
      }
      recognitionRef.current = null;
    };
  }, [lang]);

  const start = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    // Fresh session.
    finalRef.current = "";
    shouldEmitRef.current = true;
    setTranscript("");
    setInterimTranscript("");
    setError(null);
    try {
      recognition.start();
    } catch {
      // start() throws if already started — safe to ignore.
    }
  }, []);

  const stop = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      recognition.stop();
    } catch {
      /* noop */
    }
  }, []);

  const reset = useCallback(() => {
    finalRef.current = "";
    shouldEmitRef.current = false;
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    permissionDenied,
    start,
    stop,
    reset,
  };
}
