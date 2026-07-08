"use client";

import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * A styled wrapper around the native <select> (keeps full accessibility and
 * keyboard behaviour for free).
 */
export function Select({
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative inline-flex">
      <select
        className={cn(
          "glass appearance-none rounded-lg py-2 pl-3 pr-9 text-sm outline-none transition",
          "focus-visible:ring-2 focus-visible:ring-indigo-400/60",
          "[&>option]:bg-[var(--panel-solid)] [&>option]:text-[var(--fg)]",
          className
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
    </div>
  );
}
