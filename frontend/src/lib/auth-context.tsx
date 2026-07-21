"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "./api";
import type { Session, Role } from "@/types";

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  login: (kode: string, password: string) => Promise<Session>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      setSession({ role: res.role, user: res.user });
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (kode: string, password: string) => {
    const res = await api.post("/auth/login", { kode, password });
    const s: Session = { role: res.role, user: res.user };
    setSession(s);
    return s;
  }, []);

  const logout = useCallback(async () => {
    await api.post("/auth/logout");
    setSession(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ session, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}

// Helper redirect berdasarkan role, dipakai setelah login sukses
export function dashboardPathForRole(role: Role): string {
  if (role === "ADMIN") return "/dashboard/admin";
  if (role === "KOORDINATOR") return "/dashboard/koordinator";
  return "/dashboard/relawan";
}
