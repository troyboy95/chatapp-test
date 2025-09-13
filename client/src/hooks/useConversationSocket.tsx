import { socket } from "@/api/socket";
import useAuthStore from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { useEffect } from "react";

export function useConversationSocket(conversationId: string | null) {
  const { addMessage } = useChatStore();
  const { user } = useAuthStore()

  useEffect(() => {
    if (!conversationId) return;

    socket.emit("joinConversation", conversationId);

    socket.on("message:new", (msg) => {
      if (msg.conversation_id === conversationId) {
        // addMessage({
        //             id: "1",
        //             content: msg,
        //             conversation_id: conversationId,
        //             created_at: Date.now().toISO(),
        //             sender_id: user?.id!,
        //             statuses: []
        //         });
      }
    });

    return () => {
      socket.off("newMessage");
    };
  }, [conversationId, addMessage]);
}
