import { useState, useEffect, useCallback } from "react";
import { setAuthToken, clearAuthToken } from "../utils/api";

/**
 * useAuth — reads/writes JWT session from localStorage.
 * Also syncs the token into the api.js module so every apiFetch
 * automatically includes Authorization: Bearer <token>.
 */
export function useAuth() {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("upsc_token");
      const storedUser  = localStorage.getItem("upsc_user");

      if (storedToken && storedUser) {
        try {
          const [, b64] = storedToken.split(".");
          const payload = JSON.parse(atob(b64.replace(/-/g, "+").replace(/_/g, "/")));
          if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            localStorage.removeItem("upsc_token");
            localStorage.removeItem("upsc_user");
            clearAuthToken();
            setLoading(false);
            return;
          }
        } catch {
          localStorage.removeItem("upsc_token");
          localStorage.removeItem("upsc_user");
          clearAuthToken();
          setLoading(false);
          return;
        }

        setAuthToken(storedToken);   // ← inject into api module
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem("upsc_token");
      localStorage.removeItem("upsc_user");
      clearAuthToken();
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((newUser, newToken) => {
    localStorage.setItem("upsc_token", newToken);
    localStorage.setItem("upsc_user", JSON.stringify(newUser));
    setAuthToken(newToken);   // ← inject into api module
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("upsc_token");
    localStorage.removeItem("upsc_user");
    clearAuthToken();         // ← clear from api module
    setToken(null);
    setUser(null);
  }, []);

  return { user, token, loading, login, logout };
}