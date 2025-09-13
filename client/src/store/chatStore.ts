import { socket } from "@/api/socket";
import { create } from "zustand";

type Message = {
  id: string;
  conversation_id: string
  sender_id: string;
  content: string;
  created_at: string;
  statuses: any[]
};

interface ChatState {
  activeConversationId: string | null;  // conversation ID if exists
  activeContactId: string | null;       // fallback when no conversation exists
  messages: Message[];
  setActiveChat: (conversationId: string | null, contactId: string | null) => void;
  setMessages: (msgs: Message[]) => void;
  addMessage: (msg: Message) => void;
  resetChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeConversationId: null,
  activeContactId: null,
  messages: [],
  setActiveChat: (conversationId, contactId) =>
    set({ activeConversationId: conversationId, activeContactId: contactId }),
  setMessages: (msgs) => set({ messages: msgs }),
  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),
  resetChat: () => set({ activeConversationId: null, activeContactId: null, messages: [] }),
}));

