import type { Metadata } from "next";
import { SettingsForm } from "@/components/settings/SettingsForm";

export const metadata: Metadata = {
  title: "Settings — Omen",
  description: "Configure your AI provider, voice, speech, and theme.",
};

export default function SettingsPage() {
  return (
    <div className="h-full overflow-y-auto">
      <SettingsForm />
    </div>
  );
}
