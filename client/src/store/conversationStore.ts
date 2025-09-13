import { create } from "zustand";

export type MessageStatus = "sent" | "delivered" | "read";

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  statuses?: { user_id: string; status: MessageStatus }[];
};

export type Conversation = {
  id: string;
  type: "direct" | "group";
  last_message?: Message;
  participants: string[]; // list of user_ids
  messages?: Message[];   // optional, you can lazy-load
};

type ConversationsState = {
  conversations: Conversation[];
  setConversations: (convs: Conversation[]) => void;
  addConversation: (conv: Conversation) => void;
  addMessage: (conversationId: string, msg: Message) => void;
  updateMessageStatus: (
    messageId: string,
    userId: string,
    status: MessageStatus
  ) => void;
};

export const useConversationsStore = create<ConversationsState>((set) => ({
  conversations: [],
  setConversations: (convs) => set({ conversations: convs }),
  addConversation: (conv) =>
    set((state) => ({ conversations: [...state.conversations, conv] })),
  addMessage: (conversationId, msg) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: [...(c.messages || []), msg],
              last_message: msg,
            }
          : c
      ),
    })),
  updateMessageStatus: (messageId, userId, status) =>
    set((state) => ({
      conversations: state.conversations.map((c) => ({
        ...c,
        messages: c.messages?.map((m) =>
          m.id === messageId
            ? {
                ...m,
                statuses: m.statuses?.map((s) =>
                  s.user_id === userId ? { ...s, status } : s
                ),
              }
            : m
        ),
      })),
    })),
}));
