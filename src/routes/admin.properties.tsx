import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard-shell";
import { DataTable } from "@/components/data-table";
import { EmptyState, ErrorState, LoadingState, StatusBadge } from "@/components/ui/primitives";
import { formatCurrency, formatDate } from "@/lib/format";
import { adminPropertiesQuery } from "@/lib/queries";
import { propertyTypeLabel } from "@/lib/property-types";

export const Route = createFileRoute("/admin/properties")({
  head: () => ({
    meta: [
      { title: "Properties — AD Property Rental admin" },
      { name: "description", content: "Every property on the platform, with owner details." },
      { property: "og:title", content: "Properties — AD Property Rental admin" },
      { property: "og:description", content: "Every property on the platform." },
    ],
  }),
  component: () => (
    <DashboardShell area="admin" allow={["admin"]} title="Properties" description="Read-only: the server exposes no admin edit endpoints.">
      <List />
    </DashboardShell>
  ),
});

function List() {
  const { data, isPending, isError, error, refetch } = useQuery(adminPropertiesQuery());
  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!data.length) return <EmptyState title="No properties" />;
  type Row = (typeof data)[number];

  return (
    <DataTable<Row>
      rows={data}
      rowKey={(p) => p.PropertyID}
      columns={[
        { key: "id", header: "#", cell: (p) => p.PropertyID },
        {
          key: "title",
          header: "Property",
          cell: (p) => (
            <Link to="/properties/$propertyId" params={{ propertyId: String(p.PropertyID) }} className="font-display font-semibold hover:text-primary">
              {p.Title}
            </Link>
          ),
        },
        { key: "owner", header: "Owner", cell: (p) => p.OwnerName ?? `#${p.OwnerID}` },
        { key: "city", header: "City", cell: (p) => p.City },
        { key: "type", header: "Type", cell: (p) => propertyTypeLabel(p.PropertyType) },
        { key: "rent", header: "Rent", cell: (p) => formatCurrency(p.MonthlyRent) },
        { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.Status} /> },
        { key: "created", header: "Listed", cell: (p) => formatDate(p.CreatedAt) },
      ]}
    />
  );
}
