"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Moon, Settings as SettingsIcon, Sun } from "lucide-react";
import { useSettings } from "@/components/providers/SettingsProvider";
import { Logo } from "@/components/Logo";
import { IconButton } from "@/components/ui/IconButton";
import { APP_NAME, PROVIDERS } from "@/lib/constants";

/** Map the current route to a short section label shown on desktop. */
function sectionLabel(pathname: string): string {
  if (pathname === "/settings") return "Settings";
  if (pathname === "/about") return "About";
  return "Home";
}

/**
 * Frosted top navigation bar: mobile menu + brand on the left, a page-context
 * title on desktop, and a live provider status pill plus grouped theme/settings
 * controls on the right.
 */
export function TopBar({ onMenu }: { onMenu: () => void }) {
  const { settings, update } = useSettings();
  const pathname = usePathname();
  const isDark = settings.theme === "dark";
  const provider = PROVIDERS.find((p) => p.id === settings.provider);

  return (
    <header className="topbar relative z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b hairline px-3 sm:px-4">
      {/* Accent hairline glow along the bottom edge */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"
      />

      {/* Left: mobile menu + brand (mobile), section title (desktop) */}
      <div className="flex items-center gap-2.5">
        <IconButton label="Open menu" className="lg:hidden" onClick={onMenu}>
          <Menu className="h-5 w-5" />
        </IconButton>

        <Link
          href="/"
          className="flex items-center gap-2 transition hover:opacity-80 lg:hidden"
        >
          <Logo size={26} />
          <span className="text-sm font-semibold">{APP_NAME}</span>
        </Link>

        <div className="hidden items-center gap-2.5 lg:flex">
          <span className="h-5 w-1 rounded-full bg-gradient-to-b from-indigo-400 to-cyan-400" />
          <h1 className="text-sm font-semibold tracking-tight">
            {sectionLabel(pathname)}
          </h1>
        </div>
      </div>

      {/* Right: provider status pill + grouped controls */}
      <div className="flex items-center gap-1.5">
        <Link
          href="/settings"
          title="Active AI provider"
          className="glass hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-muted transition hover:text-[var(--fg)] sm:inline-flex"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          {provider?.label ?? "AI"}
        </Link>

        <div className="glass flex items-center gap-0.5 rounded-xl p-0.5">
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
      </div>
    </header>
  );
}
