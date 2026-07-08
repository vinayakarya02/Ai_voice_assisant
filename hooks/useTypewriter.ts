"use client";

import { useEffect, useRef, useState } from "react";

interface Options {
  /** Tick interval in ms. */
  speed?: number;
  onDone?: () => void;
}

/**
 * Progressively reveals `text` for a light "AI typing" effect. When `enabled`
 * is false the full text is shown immediately (used for historical messages).
 * Long replies auto-accelerate so they never feel sluggish.
 */
export function useTypewriter(
  text: string,
  enabled: boolean,
  { speed = 16, onDone }: Options = {}
): string {
  const [display, setDisplay] = useState(enabled ? "" : text);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!enabled) {
      setDisplay(text);
      return;
    }
    setDisplay("");
    let i = 0;
    // Reveal more characters per tick for longer text so it stays snappy.
    const perTick = Math.max(1, Math.round(text.length / 220));
    const interval = setInterval(() => {
      i += perTick;
      if (i >= text.length) {
        setDisplay(text);
        clearInterval(interval);
        onDoneRef.current?.();
      } else {
        setDisplay(text.slice(0, i));
      }
    }, speed);
    return () => clearInterval(interval);
    // Re-run only when the text or enabled flag changes.
  }, [text, enabled, speed]);

  return display;
}
