"use client";

import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface Option<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

/**
 * A pill-style segmented selector for small sets of mutually-exclusive options.
 */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (next: T) => void;
  options: Option<T>[];
  ariaLabel: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="glass inline-flex gap-1 rounded-xl p-1"
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition",
              selected
                ? "btn-gradient text-white shadow"
                : "text-muted hover:text-[var(--fg)]"
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
