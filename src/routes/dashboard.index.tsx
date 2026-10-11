import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard-shell";
import { StatCard } from "@/components/data-table";
import { Button, Panel } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  myPropertiesQuery,
  ownerEarningsQuery,
  ownerInquiriesQuery,
  paymentsQuery,
  rentalsQuery,
} from "@/lib/queries";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AD Property Rental" },
      { name: "description", content: "Your AD Property Rental account overview." },
      { property: "og:title", content: "Dashboard — AD Property Rental" },
      { property: "og:description", content: "Your AD Property Rental account overview." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { profile } = useAuth();
  return (
    <DashboardShell
      title={profile ? `Hello, ${profile.name.split(" ")[0]}` : "Dashboard"}
      description="A live summary of your activity on AD Property Rental."
    >
      <Overview />
    </DashboardShell>
  );
}

function Overview() {
  const { role, profile } = useAuth();
  if (role === "owner") return <OwnerOverview />;
  if (role === "renter") return <RenterOverview />;
  return (
    <Panel>
      <p className="text-sm text-muted-foreground">
        Signed in as administrator {profile?.email}. Use the admin console to review users,
        properties, rentals, payments and transactions.
      </p>
      <Link to="/admin" className="mt-4 inline-block">
        <Button>Open admin console</Button>
      </Link>
    </Panel>
  );
}

function OwnerOverview() {
  const properties = useQuery(myPropertiesQuery());
  const rentals = useQuery(rentalsQuery());
  const inquiries = useQuery(ownerInquiriesQuery());
  const earnings = useQuery(ownerEarningsQuery());

  const active = rentals.data?.filter((r) => r.Status?.toLowerCase() === "active").length;
  const pending = rentals.data?.filter((r) => r.Status?.toLowerCase() === "pending") ?? [];
  const openInquiries = inquiries.data?.filter((i) => i.Status?.toLowerCase() === "pending").length;

  return (
    <div className="space-y-6">
      <div className="glow-panel grid grid-cols-2 gap-4 rounded-3xl p-5 lg:grid-cols-4">
        <StatCard label="Properties" value={properties.data?.length ?? "—"} />
        <StatCard label="Active leases" value={active ?? "—"} />
        <StatCard label="Open inquiries" value={openInquiries ?? "—"} tone="accent" />
        <StatCard
          label="Total earnings"
          value={earnings.data ? formatCurrency(earnings.data.totalEarnings) : "—"}
          tone="primary"
        />
      </div>

      <Panel>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-medium tracking-tight">
            Pending rental requests
          </h2>
          <Link to="/dashboard/rentals" className="font-display text-xs font-bold uppercase text-primary">
            Manage →
          </Link>
        </div>
        {pending.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No requests waiting for approval.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border/60">
            {pending.slice(0, 5).map((r) => (
              <li key={r.AgreementID} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-display font-semibold">{r.PropertyTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.RenterName} · from {formatDate(r.StartDate)}
                  </p>
                </div>
                <Link
                  to="/dashboard/rentals/$agreementId"
                  params={{ agreementId: String(r.AgreementID) }}
                >
                  <Button variant="outline" size="sm">Review</Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="flex flex-wrap gap-3">
        <Link to="/dashboard/properties/new">
          <Button variant="flame">List a new property</Button>
        </Link>
        <Link to="/dashboard/inquiries">
          <Button variant="outline">Reply to inquiries</Button>
        </Link>
      </div>
    </div>
  );
}

function RenterOverview() {
  const rentals = useQuery(rentalsQuery());
  const payments = useQuery(paymentsQuery());

  const active = rentals.data?.filter((r) => r.Status?.toLowerCase() === "active").length;
  const pending = rentals.data?.filter((r) => r.Status?.toLowerCase() === "pending").length;
  const due = payments.data?.filter((p) => p.Status?.toLowerCase() !== "paid") ?? [];

  return (
    <div className="space-y-6">
      <div className="glow-panel grid grid-cols-2 gap-4 rounded-3xl p-5 lg:grid-cols-3">
        <StatCard label="Active rentals" value={active ?? "—"} tone="primary" />
        <StatCard label="Pending requests" value={pending ?? "—"} />
        <StatCard label="Payments due" value={payments.data ? due.length : "—"} tone="accent" />
      </div>

      <Panel>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-medium tracking-tight">
            Upcoming payments
          </h2>
          <Link to="/dashboard/payments" className="font-display text-xs font-bold uppercase text-primary">
            All payments →
          </Link>
        </div>
        {due.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">You have no outstanding payments.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border/60">
            {due.slice(0, 5).map((p) => (
              <li key={p.PaymentID} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-display font-semibold">{p.PropertyTitle ?? `Payment #${p.PaymentID}`}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.PaymentType} · due {formatDate(p.DueDate)}
                  </p>
                </div>
                <Link to="/dashboard/payments/$paymentId" params={{ paymentId: String(p.PaymentID) }}>
                  <Button variant="flame" size="sm">{formatCurrency(p.Amount)} · Pay</Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Link to="/properties">
        <Button variant="outline">Browse properties</Button>
      </Link>
    </div>
  );
}
