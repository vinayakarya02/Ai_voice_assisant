"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Settings } from "@/types";
import { DEFAULT_SETTINGS, STORAGE_KEYS } from "@/lib/constants";
import { readJSON, writeJSON } from "@/lib/storage";

interface SettingsContextValue {
  settings: Settings;
  /** Merge a partial patch into settings and persist. */
  update: (patch: Partial<Settings>) => void;
  /** True once settings have been hydrated from localStorage. */
  loaded: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const stored = readJSON<Partial<Settings>>(STORAGE_KEYS.settings, {});
    setSettings({ ...DEFAULT_SETTINGS, ...stored });
    setLoaded(true);
  }, []);

  // Reflect the theme on <html> so global CSS can respond.
  useEffect(() => {
    if (!loaded) return;
    const root = document.documentElement;
    root.classList.toggle("dark", settings.theme === "dark");
    root.classList.toggle("light", settings.theme === "light");
    root.style.colorScheme = settings.theme;
  }, [settings.theme, loaded]);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      writeJSON(STORAGE_KEYS.settings, next);
      return next;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, update, loaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a <SettingsProvider>.");
  }
  return ctx;
}
