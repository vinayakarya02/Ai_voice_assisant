"use client";

import { motion } from "framer-motion";

/**
 * A ghost bubble that mirrors the user's speech in real time while listening.
 * `transcript` is finalized text; `interim` is the tentative, still-changing part.
 */
export function LiveTranscript({
  transcript,
  interim,
}: {
  transcript: string;
  interim: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-end"
    >
      <div className="max-w-[85%] rounded-2xl rounded-br-md border border-indigo-400/40 bg-indigo-500/10 px-4 py-2.5">
        <p className="text-[15px] leading-relaxed">
          {transcript}
          <span className="text-muted">{interim}</span>
          <span className="ml-1 inline-block h-4 w-[2px] animate-pulse bg-indigo-400 align-middle" />
        </p>
      </div>
    </motion.div>
  );
}
