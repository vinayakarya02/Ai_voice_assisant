"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Conversation, Message } from "@/types";
import { STORAGE_KEYS } from "@/lib/constants";
import { readJSON, writeJSON } from "@/lib/storage";
import { uid } from "@/utils/id";

/** Max conversations kept in localStorage (oldest are dropped). */
const MAX_CONVERSATIONS = 100;

interface State {
  conversations: Conversation[];
  activeId: string | null;
}

type Action =
  | { type: "hydrate"; conversations: Conversation[]; activeId: string | null }
  | { type: "append"; msg: Message; newConvoId: string }
  | { type: "updateMessage"; id: string; patch: Partial<Message> }
  | { type: "deleteConversation"; id: string }
  | { type: "clearAll" }
  | { type: "select"; id: string | null };

function deriveTitle(content: string): string {
  const oneLine = content.replace(/\s+/g, " ").trim();
  return oneLine.length > 42 ? `${oneLine.slice(0, 42)}…` : oneLine || "New chat";
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { conversations: action.conversations, activeId: action.activeId };

    case "append": {
      const { msg } = action;
      const idx = state.activeId
        ? state.conversations.findIndex((c) => c.id === state.activeId)
        : -1;

      // Append to the active conversation and float it to the top.
      if (idx >= 0) {
        const convo = state.conversations[idx];
        const isFirstUser =
          convo.messages.length === 0 && msg.role === "user";
        const updated: Conversation = {
          ...convo,
          messages: [...convo.messages, msg],
          updatedAt: msg.timestamp,
          title: isFirstUser ? deriveTitle(msg.content) : convo.title,
        };
        const rest = state.conversations.filter((_, i) => i !== idx);
        return { ...state, conversations: [updated, ...rest] };
      }

      // No active conversation — create a new one.
      const convo: Conversation = {
        id: action.newConvoId,
        title: msg.role === "user" ? deriveTitle(msg.content) : "New chat",
        messages: [msg],
        createdAt: msg.timestamp,
        updatedAt: msg.timestamp,
      };
      return {
        conversations: [convo, ...state.conversations].slice(
          0,
          MAX_CONVERSATIONS
        ),
        activeId: convo.id,
      };
    }

    case "updateMessage": {
      const conversations = state.conversations.map((c) => {
        if (!c.messages.some((m) => m.id === action.id)) return c;
        return {
          ...c,
          messages: c.messages.map((m) =>
            m.id === action.id ? { ...m, ...action.patch } : m
          ),
          updatedAt: Date.now(),
        };
      });
      return { ...state, conversations };
    }

    case "deleteConversation": {
      const conversations = state.conversations.filter(
        (c) => c.id !== action.id
      );
      const activeId =
        state.activeId === action.id ? null : state.activeId;
      return { conversations, activeId };
    }

    case "clearAll":
      return { conversations: [], activeId: null };

    case "select":
      return { ...state, activeId: action.id };

    default:
      return state;
  }
}

interface ConversationsContextValue {
  conversations: Conversation[];
  activeId: string | null;
  activeConversation: Conversation | null;
  loaded: boolean;
  /** Append a message to the active conversation (creating one if needed). */
  appendMessage: (msg: Message) => void;
  updateMessage: (id: string, patch: Partial<Message>) => void;
  deleteConversation: (id: string) => void;
  clearAll: () => void;
  newConversation: () => void;
  selectConversation: (id: string) => void;
}

const ConversationsContext = createContext<ConversationsContextValue | null>(
  null
);

export function ConversationsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    conversations: [],
    activeId: null,
  });
  const [loaded, setLoaded] = useState(false);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const conversations = readJSON<Conversation[]>(
      STORAGE_KEYS.conversations,
      []
    );
    const storedActive = readJSON<string | null>(
      STORAGE_KEYS.activeConversation,
      null
    );
    const activeId =
      storedActive && conversations.some((c) => c.id === storedActive)
        ? storedActive
        : null;
    dispatch({ type: "hydrate", conversations, activeId });
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist whenever state changes (after hydration).
  useEffect(() => {
    if (!loaded) return;
    writeJSON(STORAGE_KEYS.conversations, state.conversations);
  }, [state.conversations, loaded]);

  useEffect(() => {
    if (!loaded) return;
    writeJSON(STORAGE_KEYS.activeConversation, state.activeId);
  }, [state.activeId, loaded]);

  const appendMessage = useCallback((msg: Message) => {
    dispatch({ type: "append", msg, newConvoId: uid() });
  }, []);

  const updateMessage = useCallback(
    (id: string, patch: Partial<Message>) => {
      dispatch({ type: "updateMessage", id, patch });
    },
    []
  );

  const deleteConversation = useCallback((id: string) => {
    dispatch({ type: "deleteConversation", id });
  }, []);

  const clearAll = useCallback(() => dispatch({ type: "clearAll" }), []);
  const newConversation = useCallback(
    () => dispatch({ type: "select", id: null }),
    []
  );
  const selectConversation = useCallback(
    (id: string) => dispatch({ type: "select", id }),
    []
  );

  const activeConversation = useMemo(
    () =>
      state.conversations.find((c) => c.id === state.activeId) ?? null,
    [state.conversations, state.activeId]
  );

  const value: ConversationsContextValue = {
    conversations: state.conversations,
    activeId: state.activeId,
    activeConversation,
    loaded,
    appendMessage,
    updateMessage,
    deleteConversation,
    clearAll,
    newConversation,
    selectConversation,
  };

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversations(): ConversationsContextValue {
  const ctx = useContext(ConversationsContext);
  if (!ctx) {
    throw new Error(
      "useConversations must be used within a <ConversationsProvider>."
    );
  }
  return ctx;
}
