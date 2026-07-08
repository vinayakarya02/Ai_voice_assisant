"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Info, MessageSquare, Plus, Settings, Trash2, X } from "lucide-react";
import { useConversations } from "@/components/providers/ConversationsProvider";
import { Logo } from "@/components/Logo";
import { IconButton } from "@/components/ui/IconButton";
import { APP_NAME } from "@/lib/constants";
import { formatRelative } from "@/utils/format";
import { cn } from "@/utils/cn";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

/**
 * App sidebar: brand, New Chat, conversation history, and footer navigation.
 * Renders as a static column on desktop and a slide-in drawer on mobile.
 */
export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop: persistent column */}
      <aside className="relative z-10 hidden w-[272px] shrink-0 flex-col border-r hairline glass lg:flex">
        <SidebarContent onNavigate={() => {}} />
      </aside>

      {/* Mobile: overlay drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.aside
              className="panel fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
              role="dialog"
              aria-label="Navigation menu"
            >
              <div className="flex justify-end p-2">
                <IconButton label="Close menu" onClick={onClose}>
                  <X className="h-5 w-5" />
                </IconButton>
              </div>
              <SidebarContent onNavigate={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarContent({ onNavigate }: { onNavigate: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    conversations,
    activeId,
    newConversation,
    selectConversation,
    deleteConversation,
  } = useConversations();

  const goHome = () => {
    if (pathname !== "/") router.push("/");
  };

  const handleNewChat = () => {
    newConversation();
    goHome();
    onNavigate();
  };

  const handleSelect = (id: string) => {
    selectConversation(id);
    goHome();
    onNavigate();
  };

  return (
    <div className="flex h-full flex-col p-3">
      {/* Brand */}
      <Link
        href="/"
        onClick={onNavigate}
        className="group flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-white/5"
      >
        <Logo size={34} className="transition-transform group-hover:scale-105" />
        <span className="flex flex-col leading-tight">
          <span className="text-[15px] font-semibold tracking-tight">
            {APP_NAME}
          </span>
          <span className="text-[11px] text-muted">AI Voice Assistant</span>
        </span>
      </Link>

      {/* New chat */}
      <button
        type="button"
        onClick={handleNewChat}
        className="btn-gradient group mt-3 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-white shadow-glow transition hover:shadow-glow-lg hover:brightness-110 active:scale-[0.99]"
      >
        <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
        New Chat
      </button>

      {/* History */}
      <div className="mt-5 flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-2 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Recent
          </p>
          {conversations.length > 0 && (
            <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-muted">
              {conversations.length}
            </span>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
          {conversations.length === 0 ? (
            <div className="mx-1 rounded-xl border border-dashed hairline px-3 py-6 text-center">
              <MessageSquare className="mx-auto h-5 w-5 text-muted/60" />
              <p className="mt-2 text-xs text-muted">
                No conversations yet.
                <br />
                Start talking to {APP_NAME}!
              </p>
            </div>
          ) : (
            <ul className="space-y-0.5">
              {conversations.map((c) => {
                const active = c.id === activeId && pathname === "/";
                return (
                  <li key={c.id}>
                    <div
                      className={cn(
                        "group relative flex items-center gap-2 rounded-lg py-2 pl-2.5 pr-1 transition-colors",
                        active
                          ? "bg-gradient-to-r from-indigo-500/20 via-indigo-500/5 to-transparent"
                          : "hover:bg-white/5"
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-400 to-cyan-400" />
                      )}
                      <button
                        type="button"
                        onClick={() => handleSelect(c.id)}
                        className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                      >
                        <span
                          className={cn(
                            "grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors",
                            active
                              ? "bg-indigo-500/25 text-indigo-200"
                              : "bg-white/5 text-muted group-hover:text-[var(--fg)]"
                          )}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block truncate text-sm",
                              active && "font-medium text-[var(--fg)]"
                            )}
                          >
                            {c.title}
                          </span>
                          <span className="block text-[11px] text-muted">
                            {formatRelative(c.updatedAt)}
                          </span>
                        </span>
                      </button>
                      <IconButton
                        label="Delete conversation"
                        size="sm"
                        className="opacity-0 transition hover:text-red-400 focus-visible:opacity-100 group-hover:opacity-100"
                        onClick={() => deleteConversation(c.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Footer nav */}
      <nav className="mt-3 space-y-0.5 border-t hairline pt-3">
        <SidebarLink
          href="/settings"
          icon={<Settings className="h-4 w-4" />}
          label="Settings"
          active={pathname === "/settings"}
          onClick={onNavigate}
        />
        <SidebarLink
          href="/about"
          icon={<Info className="h-4 w-4" />}
          label="About"
          active={pathname === "/about"}
          onClick={onNavigate}
        />
        <p className="px-3 pt-2 text-[10px] text-muted/70">
          {APP_NAME} · v1.0.0
        </p>
      </nav>
    </div>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  active,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
        active
          ? "bg-gradient-to-r from-indigo-500/15 to-transparent text-[var(--fg)]"
          : "text-muted hover:bg-white/5 hover:text-[var(--fg)]"
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-400 to-cyan-400" />
      )}
      <span className={cn("transition-colors", active && "text-indigo-300")}>
        {icon}
      </span>
      {label}
    </Link>
  );
}
