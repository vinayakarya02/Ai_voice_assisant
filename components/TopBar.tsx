"use client";

import Link from "next/link";
import { Menu, Moon, Settings as SettingsIcon, Sun } from "lucide-react";
import { useSettings } from "@/components/providers/SettingsProvider";
import { Logo } from "@/components/Logo";
import { IconButton } from "@/components/ui/IconButton";
import { APP_NAME } from "@/lib/constants";

/**
 * Slim top bar: mobile menu trigger + brand (mobile), and quick actions
 * (theme toggle, settings) on the right — satisfying the "logo top-left,
 * settings top-right" layout from the brief.
 */
export function TopBar({ onMenu }: { onMenu: () => void }) {
  const { settings, update } = useSettings();
  const isDark = settings.theme === "dark";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b hairline px-3 sm:px-4">
      <div className="flex items-center gap-2">
        <IconButton label="Open menu" className="lg:hidden" onClick={onMenu}>
          <Menu className="h-5 w-5" />
        </IconButton>
        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <Logo size={28} />
          <span className="text-sm font-semibold">{APP_NAME}</span>
        </Link>
      </div>

      <div className="flex items-center gap-1">
        <IconButton
          label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          onClick={() => update({ theme: isDark ? "light" : "dark" })}
        >
          {isDark ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </IconButton>
        <Link href="/settings" aria-label="Settings">
          <IconButton label="Settings" tabIndex={-1}>
            <SettingsIcon className="h-5 w-5" />
          </IconButton>
        </Link>
      </div>
    </header>
  );
}
