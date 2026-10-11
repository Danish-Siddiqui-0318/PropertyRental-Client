import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { apiRequest, getStoredToken, setStoredToken } from "./api";
import type { Profile, Role } from "./types";

type TokenClaims = { userId: number; role: Role; exp?: number };

function decodeToken(token: string): TokenClaims | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    const parsed = JSON.parse(json) as TokenClaims;
    if (parsed.exp && parsed.exp * 1000 < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

type AuthValue = {
  ready: boolean;
  token: string | null;
  claims: TokenClaims | null;
  role: Role | null;
  isAuthenticated: boolean;
  profile: Profile | null;
  setProfile: (p: Profile | null) => void;
  login: (email: string, password: string) => Promise<Role>;
  logout: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = getStoredToken();
    if (stored && decodeToken(stored)) {
      setToken(stored);
    } else if (stored) {
      setStoredToken(null);
    }
    setReady(true);
  }, []);

  const clear = useCallback(() => {
    setStoredToken(null);
    setToken(null);
    setProfile(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    const handler = () => clear();
    window.addEventListener("adpr:unauthorized", handler);
    return () => window.removeEventListener("adpr:unauthorized", handler);
  }, [clear]);

  const claims = useMemo(() => (token ? decodeToken(token) : null), [token]);

  // Keep the profile in sync with the active session.
  useEffect(() => {
    if (!token) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    apiRequest<{ user: Profile }>("/auth/profile", { auth: true })
      .then((res) => {
        if (!cancelled) setProfile(res.user);
      })
      .catch(() => {
        /* handled globally (401 clears the session) */
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiRequest<{ token: string }>("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      setStoredToken(res.token);
      setToken(res.token);
      const decoded = decodeToken(res.token);
      return (decoded?.role ?? "renter") as Role;
    },
    [],
  );

  const logout = useCallback(() => {
    clear();
    void navigate({ to: "/", replace: true });
  }, [clear, navigate]);

  const value: AuthValue = {
    ready,
    token,
    claims,
    role: claims?.role ?? null,
    isAuthenticated: Boolean(token && claims),
    profile,
    setProfile,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
