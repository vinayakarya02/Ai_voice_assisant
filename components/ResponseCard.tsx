"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, RefreshCw, Volume2 } from "lucide-react";
import type { Message } from "@/types";
import { Logo } from "@/components/Logo";
import { IconButton } from "@/components/ui/IconButton";
import { useTypewriter } from "@/hooks/useTypewriter";
import { formatClock } from "@/utils/format";

interface ResponseCardProps {
  message: Message;
  /** Run the typewriter reveal (only for the newest reply). */
  animate: boolean;
  onTypingDone: () => void;
  onRegenerate: () => void;
  onSpeak: () => void;
  /** Disable regenerate while another request is in flight. */
  busy?: boolean;
}

/**
 * An assistant reply card (glassmorphism) with a typing reveal and the
 * Copy / Speak again / Regenerate actions plus a timestamp.
 */
export function ResponseCard({
  message,
  animate,
  onTypingDone,
  onRegenerate,
  onSpeak,
  busy,
}: ResponseCardProps) {
  const [copied, setCopied] = useState(false);
  const display = useTypewriter(message.content, animate, {
    onDone: onTypingDone,
  });
  const stillTyping = animate && display.length < message.content.length;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex gap-3"
    >
      <Logo size={30} className="mt-0.5" />
      <div className="glass min-w-0 flex-1 rounded-2xl rounded-tl-md px-4 py-3">
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
          {display}
          {stillTyping && (
            <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-indigo-400 align-middle" />
          )}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] text-muted">
            {formatClock(message.timestamp)}
          </span>
          <div className="flex items-center gap-0.5">
            <IconButton
              label={copied ? "Copied" : "Copy"}
              size="sm"
              onClick={copy}
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </IconButton>
            <IconButton label="Speak again" size="sm" onClick={onSpeak}>
              <Volume2 className="h-4 w-4" />
            </IconButton>
            <IconButton
              label="Regenerate response"
              size="sm"
              onClick={onRegenerate}
              disabled={busy}
            >
              <RefreshCw className="h-4 w-4" />
            </IconButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
