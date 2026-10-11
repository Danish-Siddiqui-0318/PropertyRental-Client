/**
 * Centralised API configuration for the AD Property Rental backend.
 *
 * The backend is the existing Express + SQL Server server (PropertyRental-Server).
 * Base URL is configurable via VITE_API_URL and defaults to the server's
 * documented development port.
 */

export const API_BASE_URL = (
  (import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://localhost:5000"
).replace(/\/+$/, "");

export const TOKEN_STORAGE_KEY = "adpr.token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  else window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export class ApiError extends Error {
  status: number;
  details: string | undefined;

  constructor(message: string, status: number, details?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** FormData for multipart endpoints (property photos). */
  formData?: FormData;
  auth?: boolean;
  signal?: AbortSignal;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, formData, auth = false, signal } = options;

  const headers: Record<string, string> = {};
  if (auth) {
    const token = getStoredToken();
    if (!token) throw new ApiError("You need to sign in to continue.", 401);
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: formData ?? (body !== undefined ? JSON.stringify(body) : null),
      signal: signal ?? null,
    });
  } catch {
    throw new ApiError(
      `Cannot reach the AD Property Rental server at ${API_BASE_URL}. Make sure it is running and allows requests from this address.`,
      0,
    );
  }

  const text = await response.text();
  let payload: Record<string, unknown> = {};
  if (text) {
    try {
      payload = JSON.parse(text) as Record<string, unknown>;
    } catch {
      payload = {};
    }
  }

  if (!response.ok) {
    const message =
      (typeof payload["message"] === "string" && payload["message"]) ||
      `Request failed with status ${response.status}`;
    const details = typeof payload["error"] === "string" ? payload["error"] : undefined;

    if (response.status === 401) {
      // Expired or invalid token — clear it so the UI returns to a signed-out state.
      setStoredToken(null);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("adpr:unauthorized"));
      }
    }
    throw new ApiError(message, response.status, details);
  }

  return payload as T;
}
