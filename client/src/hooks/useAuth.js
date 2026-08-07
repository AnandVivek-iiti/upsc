import { useState, useEffect, useCallback } from "react";
import { setAuthToken, clearAuthToken, getProfile } from "../utils/api";
import timerStore from "./timerStore";

export function useAuth() {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  const fetchSubscription = useCallback(() => {
    return getProfile()
      .then((d) => { setSubscription(d?.user?.subscription || null); return d; })
      .catch(() => {}); 
  }, []);

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

        setAuthToken(storedToken);
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

  useEffect(() => {
    if (token) fetchSubscription();
    else setSubscription(null);
  }, [token, fetchSubscription]);

  const login = useCallback((newUser, newToken) => {
    localStorage.setItem("upsc_token", newToken);
    localStorage.setItem("upsc_user", JSON.stringify(newUser));
    setAuthToken(newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("upsc_token");
    localStorage.removeItem("upsc_user");
    clearAuthToken();
    timerStore.setUser(null);
    setToken(null);
    setUser(null);
    setSubscription(null);
  }, []);

  return {
    user, token, loading, login, logout,
    subscription,
    isPremium: !!subscription?.isActive,
    refetchSubscription: fetchSubscription,
  };
}