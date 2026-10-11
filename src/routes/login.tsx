import { AuthLayout } from "@/components/auth-layout";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Alert, Button, Field, Input } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — AD Property Rental" },
      {
        name: "description",
        content: "Sign in to your AD Property Rental account to manage rentals, inquiries and payments.",
      },
      { property: "og:title", content: "Sign in — AD Property Rental" },
      { property: "og:description", content: "Sign in to your AD Property Rental account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated, ready } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (ready && isAuthenticated) void navigate({ to: "/dashboard", replace: true });
  }, [ready, isAuthenticated, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const role = await login(email, password);
      void navigate({ to: role === "admin" ? "/admin" : "/dashboard", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage your rentals, inquiries and payments." footer={<>No account yet?{" "}<Link to="/register" className="font-semibold text-primary hover:underline">Create one</Link></>}>
        <form className="space-y-4" onSubmit={submit}>
          <Field label="Email">
            <Input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>
          {error ? <Alert>{error}</Alert> : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
    </AuthLayout>
  );
}
