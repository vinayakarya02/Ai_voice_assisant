"use client";

import dynamic from "next/dynamic";
import { HomeSkeleton } from "@/components/skeletons/HomeSkeleton";

/**
 * The home experience is client-only (it relies on the browser speech APIs
 * and localStorage), so we lazy-load it with a skeleton fallback to keep the
 * initial payload small and avoid hydration mismatches.
 */
const AssistantExperience = dynamic(
  () =>
    import("@/components/AssistantExperience").then(
      (m) => m.AssistantExperience
    ),
  { ssr: false, loading: () => <HomeSkeleton /> }
);

export default function HomePage() {
  return <AssistantExperience />;
}
