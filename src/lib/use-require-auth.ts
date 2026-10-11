import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { useAuth } from "./auth";
import type { Role } from "./types";

/**
 * Client-side route guard. The backend enforces the real permissions; this
 * keeps signed-out or wrong-role users out of screens that would only 401/403.
 */
export function useRequireAuth(allow?: Role[]) {
  const { ready, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const allowed = !allow || (role ? allow.includes(role) : false);

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) {
      void navigate({ to: "/login", replace: true });
      return;
    }
    if (!allowed) {
      void navigate({ to: "/dashboard", replace: true });
    }
  }, [ready, isAuthenticated, allowed, navigate]);

  return { checking: !ready || !isAuthenticated || !allowed };
}
