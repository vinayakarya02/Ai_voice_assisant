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
      <aside className="hidden lg:flex w-[272px] shrink-0 flex-col border-r hairline glass">
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
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col panel lg:hidden"
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
        className="flex items-center gap-2.5 rounded-xl px-2 py-2"
      >
        <Logo size={34} />
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
        className="btn-gradient mt-3 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-white shadow-glow transition hover:brightness-110 active:scale-[0.99]"
      >
        <Plus className="h-4 w-4" />
        New Chat
      </button>

      {/* History */}
      <div className="mt-5 flex-1 overflow-y-auto no-scrollbar">
        <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Recent
        </p>
        {conversations.length === 0 ? (
          <p className="px-2 text-sm text-muted">
            No conversations yet. Start talking to Nova!
          </p>
        ) : (
          <ul className="space-y-1">
            {conversations.map((c) => (
              <li key={c.id}>
                <div
                  className={cn(
                    "group flex items-center gap-2 rounded-lg px-2 py-2 transition",
                    "hover:bg-white/5",
                    c.id === activeId && pathname === "/" && "bg-white/10"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(c.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 text-muted" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{c.title}</span>
                      <span className="block text-[11px] text-muted">
                        {formatRelative(c.updatedAt)}
                      </span>
                    </span>
                  </button>
                  <IconButton
                    label="Delete conversation"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-red-400"
                    onClick={() => deleteConversation(c.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer nav */}
      <nav className="mt-3 space-y-1 border-t hairline pt-3">
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
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition hover:bg-white/5",
        active ? "text-[var(--fg)] bg-white/10" : "text-muted"
      )}
    >
      {icon}
      {label}
    </Link>
  );
}
