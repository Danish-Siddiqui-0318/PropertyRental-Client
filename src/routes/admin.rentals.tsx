import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard-shell";
import { DataTable } from "@/components/data-table";
import { EmptyState, ErrorState, LoadingState, StatusBadge } from "@/components/ui/primitives";
import { formatCurrency, formatDate } from "@/lib/format";
import { adminRentalsQuery } from "@/lib/queries";
import type { Rental } from "@/lib/types";

export const Route = createFileRoute("/admin/rentals")({
  head: () => ({
    meta: [
      { title: "Rentals — AD Property Rental admin" },
      { name: "description", content: "All rental agreements across the platform." },
      { property: "og:title", content: "Rentals — AD Property Rental admin" },
      { property: "og:description", content: "All rental agreements across the platform." },
    ],
  }),
  component: () => (
    <DashboardShell area="admin" allow={["admin"]} title="Rental agreements">
      <List />
    </DashboardShell>
  ),
});

function List() {
  const { data, isPending, isError, error, refetch } = useQuery(adminRentalsQuery());
  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!data.length) return <EmptyState title="No rental agreements" />;

  return (
    <DataTable<Rental>
      rows={data}
      rowKey={(r) => r.AgreementID}
      columns={[
        { key: "id", header: "#", cell: (r) => r.AgreementID },
        { key: "property", header: "Property", cell: (r) => <span className="font-display font-semibold">{r.PropertyTitle}</span> },
        { key: "owner", header: "Owner", cell: (r) => r.OwnerName ?? "—" },
        { key: "renter", header: "Renter", cell: (r) => r.RenterName ?? "—" },
        { key: "term", header: "Term", cell: (r) => `${formatDate(r.StartDate)} → ${formatDate(r.EndDate)}` },
        { key: "rent", header: "Rent", cell: (r) => formatCurrency(r.MonthlyRent) },
        { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.Status} /> },
      ]}
    />
  );
}
