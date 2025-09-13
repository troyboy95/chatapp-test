import useChatStore from "@/store/authStore";

export const API_URL = "http://localhost:4000";

export async function registerApi(email: string, password: string, display_name: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, display_name}),
  });
  if (!res.ok) throw new Error("Login failed");
  const data = await res.json();

  useChatStore.getState().login(data.user, data.accessToken);
  return data;
}

export async function loginApi(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Login failed");
  const data = await res.json();

  useChatStore.getState().login(data.user, data.accessToken);
  return data;
}

export async function logoutApi() {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  useChatStore.getState().logout();
}

export async function refreshApi(): Promise<string> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Refresh failed");
  const data = await res.json();

  useChatStore.getState().setAccessToken(data.accessToken);
  return data.accessToken;
}
