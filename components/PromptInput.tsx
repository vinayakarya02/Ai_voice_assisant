"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * A compact typed-prompt fallback. Useful when speech recognition is
 * unavailable (e.g. Firefox) or when the user simply prefers to type.
 */
export function PromptInput({
  onSubmit,
  disabled,
  placeholder = "Or type a message…",
  className,
}: {
  onSubmit: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const [value, setValue] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    onSubmit(text);
    setValue("");
  };

  return (
    <form onSubmit={submit} className={cn("flex w-full items-center gap-2", className)}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Type a message"
        disabled={disabled}
        className="glass w-full rounded-xl px-4 py-2.5 text-sm outline-none transition placeholder:text-muted focus-visible:ring-2 focus-visible:ring-indigo-400/60 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="btn-gradient grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white transition hover:brightness-110 disabled:opacity-40"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
