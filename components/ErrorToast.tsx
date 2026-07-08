"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, RotateCcw, X } from "lucide-react";
import type { AssistantError } from "@/hooks/useAssistant";
import { IconButton } from "@/components/ui/IconButton";

/**
 * A dismissible, accessible error toast pinned above the control dock.
 * Offers a retry action for recoverable failures.
 */
export function ErrorToast({
  error,
  onRetry,
  onDismiss,
}: {
  error: AssistantError | null;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          role="alert"
          aria-live="assertive"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="pointer-events-auto fixed bottom-28 left-1/2 z-50 w-[min(92vw,440px)] -translate-x-1/2"
        >
          <div className="glass flex items-start gap-3 rounded-xl border border-red-400/30 p-3 shadow-glow">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <div className="min-w-0 flex-1">
              <p className="text-sm">{error.message}</p>
              {error.retryable && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-1.5 inline-flex items-center gap-1 rounded-md text-xs font-medium text-indigo-300 transition hover:text-indigo-200"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Try again
                </button>
              )}
            </div>
            <IconButton label="Dismiss error" size="sm" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </IconButton>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
