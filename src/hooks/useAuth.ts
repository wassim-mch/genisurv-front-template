import { useState, useEffect, useCallback } from "react";
import { loginApi, logoutApi, meApi } from "../api/auth.api";
import type { User } from "../@types/user";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger l'utilisateur au montage si token existe
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await meApi();
        setUser(res.data.user);
      } catch (err) {
        console.error("Erreur lors de la récupération de l'utilisateur", err);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await loginApi({ email, password });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
    } catch (err) {
      console.error("Erreur login", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error("Erreur logout", err);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await meApi();
      setUser(res.data.user);
    } catch (err) {
      console.error("Erreur refresh user", err);
      localStorage.removeItem("token");
      setUser(null);
    }
  }, []);

  const isAuthenticated = !!user;

  return { user, isAuthenticated, loading, login, logout, refreshUser, setUser };
}