import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useChatStore from "@/store/authStore";
import { refreshApi } from "../api/auth";
// import { fetchWithAuth } from "@/api/client";
// import { useContactsStore } from "@/store/contactStore";
// import { useConversationsStore } from "@/store/conversationStore";

export default function AuthGuard() {
  const { accessToken, setAccessToken } = useChatStore();
  
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        if (accessToken) {
          setIsAuthenticated(true);
        } else {
          // Try refreshing via cookie
          const newToken = await refreshApi();
          if (newToken) {
            setAccessToken(newToken);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();

  }, [accessToken, setAccessToken]);

  
  if (loading) {
    return <div>Loading...</div>; // could be spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/signIn" replace />;
  }

  return <Outlet />; // ✅ render child routes if authenticated
}
