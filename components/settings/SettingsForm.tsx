"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Moon, Play, Square, Sun, Trash2 } from "lucide-react";
import { useSettings } from "@/components/providers/SettingsProvider";
import { useConversations } from "@/components/providers/ConversationsProvider";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Toggle } from "@/components/ui/Toggle";
import { Slider } from "@/components/ui/Slider";
import { Select } from "@/components/ui/Select";
import { SettingRow } from "@/components/settings/SettingRow";
import { PROVIDERS } from "@/lib/constants";
import { englishFirst } from "@/lib/voice";
import type { AIProvider, ThemeMode, VoiceGender } from "@/types";

/**
 * The full settings form. Every change is persisted immediately via the
 * SettingsProvider (no explicit "Save" needed).
 */
export function SettingsForm() {
  const { settings, update } = useSettings();
  const { conversations, clearAll } = useConversations();
  const {
    voices,
    speak,
    cancel,
    isSupported: ttsSupported,
  } = useSpeechSynthesis();
  const [confirmClear, setConfirmClear] = useState(false);

  const voiceOptions = useMemo(() => englishFirst(voices), [voices]);
  const provider = PROVIDERS.find((p) => p.id === settings.provider);

  const testVoice = () => {
    speak(
      "Hi, I'm Omen. This is how I'll sound when I read a response aloud.",
      {
        voiceURI: settings.voiceURI,
        gender: settings.voiceGender,
        rate: settings.speechRate,
        pitch: settings.speechPitch,
      }
    );
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Personalize how Omen listens, speaks, and looks.
        </p>
      </header>

      {/* AI Provider ------------------------------------------------------- */}
      <Section title="AI Provider">
        <SettingRow title="Provider" description={provider?.description}>
          <SegmentedControl
            ariaLabel="AI provider"
            value={settings.provider}
            onChange={(v) => update({ provider: v as AIProvider })}
            options={PROVIDERS.map((p) => ({ value: p.id, label: p.label }))}
          />
        </SettingRow>
      </Section>
      <Note>
        The API key for the selected provider must be configured on the server
        (in <code className="rounded bg-white/10 px-1">.env.local</code>). See
        the README for free keys.
      </Note>

      {/* Voice & Speech ---------------------------------------------------- */}
      <Section title="Voice & Speech">
        <SettingRow
          title="Voice type"
          description="Prefer a feminine or masculine voice."
        >
          <SegmentedControl
            ariaLabel="Voice type"
            value={settings.voiceGender}
            onChange={(v) =>
              update({ voiceGender: v as VoiceGender, voiceURI: null })
            }
            options={[
              { value: "female", label: "Female" },
              { value: "male", label: "Male" },
            ]}
          />
        </SettingRow>

        <SettingRow
          title="Specific voice"
          description="Available voices depend on your browser and OS."
        >
          <Select
            aria-label="Specific voice"
            value={settings.voiceURI ?? ""}
            onChange={(e) => update({ voiceURI: e.target.value || null })}
          >
            <option value="">Automatic ({settings.voiceGender})</option>
            {voiceOptions.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </Select>
        </SettingRow>

        <SettingRow title="Speaking speed" description="How fast Omen talks.">
          <Slider
            label="Speaking speed"
            min={0.5}
            max={2}
            step={0.1}
            value={settings.speechRate}
            onChange={(v) => update({ speechRate: v })}
            format={(v) => `${v.toFixed(1)}×`}
          />
        </SettingRow>

        <SettingRow title="Pitch" description="Tone of the voice.">
          <Slider
            label="Pitch"
            min={0}
            max={2}
            step={0.1}
            value={settings.speechPitch}
            onChange={(v) => update({ speechPitch: v })}
            format={(v) => v.toFixed(1)}
          />
        </SettingRow>

        <SettingRow
          title="Auto-speak replies"
          description="Read answers aloud automatically."
        >
          <Toggle
            label="Auto-speak replies"
            checked={settings.autoSpeak}
            onChange={(v) => update({ autoSpeak: v })}
          />
        </SettingRow>
      </Section>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={testVoice}
          disabled={!ttsSupported}
          className="btn-gradient inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-40"
        >
          <Play className="h-4 w-4" />
          Test voice
        </button>
        <button
          type="button"
          onClick={cancel}
          className="glass inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm transition hover:text-[var(--fg)]"
        >
          <Square className="h-3.5 w-3.5" />
          Stop
        </button>
      </div>
      {!ttsSupported && (
        <p className="mt-2 text-xs text-amber-300">
          Text-to-speech isn&apos;t supported in this browser.
        </p>
      )}

      {/* Appearance -------------------------------------------------------- */}
      <Section title="Appearance">
        <SettingRow title="Theme" description="Dark is easiest on the eyes.">
          <SegmentedControl
            ariaLabel="Theme"
            value={settings.theme}
            onChange={(v) => update({ theme: v as ThemeMode })}
            options={[
              {
                value: "dark",
                label: "Dark",
                icon: <Moon className="h-4 w-4" />,
              },
              {
                value: "light",
                label: "Light",
                icon: <Sun className="h-4 w-4" />,
              },
            ]}
          />
        </SettingRow>
      </Section>

      {/* Data & Privacy ---------------------------------------------------- */}
      <Section title="Data & Privacy">
        <SettingRow
          title="Chat history"
          description={`${conversations.length} conversation${
            conversations.length === 1 ? "" : "s"
          } stored locally in your browser.`}
        >
          {confirmClear ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  clearAll();
                  setConfirmClear(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="glass rounded-lg px-3 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              disabled={conversations.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/40 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10 disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" />
              Clear all
            </button>
          )}
        </SettingRow>
      </Section>
      <Note>
        Everything stays on your device. Prompts are sent only to your chosen AI
        provider to generate replies — there is no account and no database.
      </Note>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
        {title}
      </h2>
      <div className="glass divide-y divide-[var(--border)] rounded-2xl px-4">
        {children}
      </div>
    </section>
  );
}

function Note({ children }: { children: ReactNode }) {
  return <p className="mt-2 px-1 text-xs text-muted">{children}</p>;
}
