import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { DashboardShell } from "@/components/dashboard-shell";
import { Alert, Button, Field, Input, Panel } from "@/components/ui/primitives";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import type { Profile } from "@/lib/types";

export const Route = createFileRoute("/dashboard/profile")({
  head: () => ({
    meta: [
      { title: "Profile & security — AD Property Rental" },
      { name: "description", content: "Edit your profile details and change your password." },
      { property: "og:title", content: "Profile & security — AD Property Rental" },
      { property: "og:description", content: "Edit your profile details and change your password." },
    ],
  }),
  component: () => (
    <DashboardShell title="Profile & security" description="Keep your contact details up to date.">
      <ProfileForms />
    </DashboardShell>
  ),
});

function ProfileForms() {
  const { profile, setProfile } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [status, setStatus] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwStatus, setPwStatus] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm({ name: profile.name, email: profile.email, phone: profile.phone ?? "" });
  }, [profile]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await apiRequest<{ message: string }>("/auth/profile", {
        method: "PUT",
        auth: true,
        body: { name: form.name, email: form.email, phone: form.phone || null },
      });
      const fresh = await apiRequest<{ user: Profile }>("/auth/profile", { auth: true });
      setProfile(fresh.user);
      setStatus({ tone: "success", text: res.message });
    } catch (err) {
      setStatus({ tone: "error", text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwStatus(null);
    if (pw.newPassword !== pw.confirm) {
      setPwStatus({ tone: "error", text: "New passwords do not match." });
      return;
    }
    setPwSaving(true);
    try {
      const res = await apiRequest<{ message: string }>("/auth/change-password", {
        method: "PUT",
        auth: true,
        body: { currentPassword: pw.currentPassword, newPassword: pw.newPassword },
      });
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
      setPwStatus({ tone: "success", text: res.message });
    } catch (err) {
      setPwStatus({ tone: "error", text: (err as Error).message });
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel>
        <h2 className="font-display text-lg font-medium tracking-tight">Profile</h2>
        {profile ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {profile.role} account · member since {formatDate(profile.createdAt)}
          </p>
        ) : null}
        <form className="mt-5 space-y-4" onSubmit={saveProfile}>
          <Field label="Full name">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Email">
            <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          {status ? <Alert tone={status.tone}>{status.text}</Alert> : null}
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save profile"}</Button>
        </form>
      </Panel>

      <Panel>
        <h2 className="font-display text-lg font-medium tracking-tight">Change password</h2>
        <form className="mt-5 space-y-4" onSubmit={changePassword}>
          <Field label="Current password">
            <Input type="password" required autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          </Field>
          <Field label="New password">
            <Input type="password" required minLength={6} autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          </Field>
          <Field label="Confirm new password">
            <Input type="password" required minLength={6} autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          </Field>
          {pwStatus ? <Alert tone={pwStatus.tone}>{pwStatus.text}</Alert> : null}
          <Button type="submit" variant="outline" disabled={pwSaving}>{pwSaving ? "Updating…" : "Update password"}</Button>
        </form>
      </Panel>
    </div>
  );
}
