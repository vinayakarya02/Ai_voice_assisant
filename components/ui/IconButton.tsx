"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible label — required since the button only contains an icon. */
  label: string;
  active?: boolean;
  size?: "sm" | "md";
}

/**
 * A small, accessible icon-only button with hover + focus states.
 * `label` is mapped to both `aria-label` and `title`.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { label, active, size = "md", className, children, ...rest },
    ref
  ) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex items-center justify-center rounded-lg transition",
          "text-muted hover:text-[var(--fg)] hover:bg-white/5",
          "disabled:opacity-40 disabled:pointer-events-none",
          active && "text-[var(--fg)] bg-white/10",
          size === "sm" ? "h-8 w-8" : "h-9 w-9",
          className
        )}
        {...rest}
      >
        {children}
      </button>
    );
  }
);
