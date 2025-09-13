import useAuthStore from "@/store/authStore";
import { refreshApi } from "./auth";
import { useChatStore } from "@/store/chatStore";

const API_URL = "http://localhost:4000";

export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const { accessToken } = useAuthStore.getState();

  const headers = new Headers(options.headers || {});
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // ✅ ensures cookies sent
  });

  if (res.status === 401 || res.status === 403) {
    // Try to refresh access token
    try {
      const newToken = await refreshApi();

      // Retry request with new token
      const retryHeaders = new Headers(options.headers || {});
      retryHeaders.set("Authorization", `Bearer ${newToken}`);

      res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: retryHeaders,
        credentials: "include",
      });
    } catch (err) {
      // If refresh also fails → logout user
      useAuthStore.getState().logout();
      throw new Error("Session expired, please log in again.");
    }
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Request failed");
  }

  return res.json();
}

export async function openChat(contactId: string) {
  const { conversationId } = await fetchWithAuth("/conversations/check", {
    method: "POST",
    body: JSON.stringify({ receiverId: contactId }),
    headers: { "Content-Type": "application/json" },
  });

  useChatStore.getState().setActiveChat(conversationId, contactId);
}
