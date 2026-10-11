import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard-shell";
import { StatCard } from "@/components/data-table";
import { formatCurrency } from "@/lib/format";
import {
  adminPaymentsQuery,
  adminPropertiesQuery,
  adminRentalsQuery,
  adminTransactionsQuery,
  adminUsersQuery,
} from "@/lib/queries";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin console — AD Property Rental" },
      { name: "description", content: "Platform-wide overview of users, properties, rentals and payments." },
      { property: "og:title", content: "Admin console — AD Property Rental" },
      { property: "og:description", content: "Platform-wide overview for administrators." },
    ],
  }),
  component: () => (
    <DashboardShell area="admin" allow={["admin"]} title="Admin console" description="Figures computed live from the server's records.">
      <Overview />
    </DashboardShell>
  ),
});

function Overview() {
  const users = useQuery(adminUsersQuery());
  const properties = useQuery(adminPropertiesQuery());
  const rentals = useQuery(adminRentalsQuery());
  const payments = useQuery(adminPaymentsQuery());
  const transactions = useQuery(adminTransactionsQuery());

  const count = (role: string) => users.data?.filter((u) => u.Role === role).length ?? "—";
  const collected = payments.data
    ?.filter((p) => p.Status?.toLowerCase() === "paid")
    .reduce((sum, p) => sum + Number(p.Amount), 0);

  return (
    <div className="space-y-6">
      <div className="glow-panel grid grid-cols-2 gap-4 rounded-3xl p-5 lg:grid-cols-4">
        <StatCard label="Users" value={users.data?.length ?? "—"} />
        <StatCard label="Owners" value={count("owner")} />
        <StatCard label="Renters" value={count("renter")} />
        <StatCard label="Properties" value={properties.data?.length ?? "—"} />
        <StatCard label="Rental agreements" value={rentals.data?.length ?? "—"} />
        <StatCard
          label="Active rentals"
          value={rentals.data?.filter((r) => r.Status?.toLowerCase() === "active").length ?? "—"}
          tone="primary"
        />
        <StatCard
          label="Pending payments"
          value={payments.data?.filter((p) => p.Status?.toLowerCase() !== "paid").length ?? "—"}
          tone="accent"
        />
        <StatCard label="Collected" value={collected !== undefined ? formatCurrency(collected) : "—"} tone="primary" />
      </div>
      <p className="text-xs text-muted-foreground">
        {transactions.data ? `${transactions.data.length} transactions recorded.` : ""}
        {[users, properties, rentals, payments, transactions].some((q) => q.isError)
          ? " Some figures could not be loaded from the server."
          : ""}
      </p>
    </div>
  );
}
