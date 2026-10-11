import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard-shell";
import { DataTable } from "@/components/data-table";
import { Button, EmptyState, ErrorState, LoadingState, StatusBadge } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { rentalsQuery } from "@/lib/queries";
import type { Rental } from "@/lib/types";

export const Route = createFileRoute("/dashboard/rentals/")({
  head: () => ({
    meta: [
      { title: "Rental agreements — AD Property Rental" },
      { name: "description", content: "Rental requests and agreements for your account." },
      { property: "og:title", content: "Rental agreements — AD Property Rental" },
      { property: "og:description", content: "Rental requests and agreements for your account." },
    ],
  }),
  component: () => (
    <DashboardShell title="Rental agreements" description="Requests, active leases and history." allow={["renter", "owner"]}>
      <RentalsList />
    </DashboardShell>
  ),
});

function RentalsList() {
  const { role } = useAuth();
  const { data, isPending, isError, error, refetch } = useQuery(rentalsQuery());

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!data.length)
    return (
      <EmptyState
        title="No rental agreements"
        description={role === "renter" ? "Request a rental from any property page." : "Rental requests from renters will appear here."}
      />
    );

  return (
    <DataTable<Rental>
      rows={data}
      rowKey={(r) => r.AgreementID}
      columns={[
        { key: "property", header: "Property", cell: (r) => <span className="font-display font-semibold">{r.PropertyTitle ?? `#${r.PropertyID}`}</span> },
        { key: "party", header: role === "owner" ? "Renter" : "Owner", cell: (r) => (role === "owner" ? r.RenterName : r.OwnerName) ?? "—" },
        { key: "term", header: "Term", cell: (r) => `${formatDate(r.StartDate)} → ${formatDate(r.EndDate)}` },
        { key: "rent", header: "Rent", cell: (r) => <span className="font-display font-bold text-primary">{formatCurrency(r.MonthlyRent)}</span> },
        { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.Status} /> },
        {
          key: "open",
          header: "",
          align: "right",
          cell: (r) => (
            <Link to="/dashboard/rentals/$agreementId" params={{ agreementId: String(r.AgreementID) }}>
              <Button variant="outline" size="sm">Open</Button>
            </Link>
          ),
        },
      ]}
    />
  );
}
