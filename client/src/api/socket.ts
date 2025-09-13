import { io, Socket } from "socket.io-client";
import useAuthStore from "@/store/authStore";
import { refreshApi } from "./auth";
import { useChatStore } from "@/store/chatStore";

// export const socket = io("http://localhost:4000", {
//   auth: (cb) => {
//     const token = useAuthStore.getState().accessToken;
//     cb({ token });
//   },
//   withCredentials: true,
// });

let socket: Socket;

function initSocket() {
  const { accessToken } = useAuthStore.getState();

  socket = io("http://localhost:4000", {
    withCredentials: true,
    auth: { token: accessToken },
  });

  // If the backend says "jwt expired"
  socket.on("error", async (err) => {
    if (err?.error === "jwt expired") {
      console.log("JWT expired, refreshing...");

      // ask auth store to refresh
      const newToken = await refreshApi();

      socket.auth = { token: newToken };
      socket.disconnect().connect();
    }

    socket.on("message:new", (msg) => {
      const { activeConversationId, addMessage } = useChatStore.getState();

      // only add if you're currently viewing this conversation
      if (msg.conversation_id === activeConversationId) {
        addMessage(msg);
      }
    });

    // when server broadcasts status updates
    socket.on("message:status", ({ messageId, userId, status }) => {
      const { messages, setMessages } = useChatStore.getState();

      const updated = messages.map((m) =>
        m.id === messageId
          ? {
              ...m,
              statuses: m.statuses.map((s) =>
                s.user_id === userId ? { ...s, status } : s
              ),
            }
          : m
      );

      setMessages(updated);
    });
  });

  return socket;
}

export { initSocket, socket };

export function sendMessage(conversationId: string, content: string) {
  socket.emit("message:send", { conversationId, content });
}
