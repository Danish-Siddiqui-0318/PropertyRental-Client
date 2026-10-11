import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard-shell";
import { DataTable } from "@/components/data-table";
import { EmptyState, ErrorState, LoadingState, StatusBadge } from "@/components/ui/primitives";
import { formatCurrency, formatDate } from "@/lib/format";
import { adminPaymentsQuery } from "@/lib/queries";
import type { Payment } from "@/lib/types";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({
    meta: [
      { title: "Payments — AD Property Rental admin" },
      { name: "description", content: "All payment records across the platform." },
      { property: "og:title", content: "Payments — AD Property Rental admin" },
      { property: "og:description", content: "All payment records across the platform." },
    ],
  }),
  component: () => (
    <DashboardShell area="admin" allow={["admin"]} title="Payments">
      <List />
    </DashboardShell>
  ),
});

function List() {
  const { data, isPending, isError, error, refetch } = useQuery(adminPaymentsQuery());
  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!data.length) return <EmptyState title="No payments" />;

  return (
    <DataTable<Payment>
      rows={data}
      rowKey={(p) => p.PaymentID}
      columns={[
        { key: "id", header: "#", cell: (p) => p.PaymentID },
        { key: "property", header: "Property", cell: (p) => <span className="font-display font-semibold">{p.PropertyTitle ?? `Agreement #${p.AgreementID}`}</span> },
        { key: "parties", header: "Renter → Owner", cell: (p) => `${p.RenterName ?? "—"} → ${p.OwnerName ?? "—"}` },
        { key: "type", header: "Type", cell: (p) => p.PaymentType },
        { key: "due", header: "Due", cell: (p) => formatDate(p.DueDate) },
        { key: "amount", header: "Amount", cell: (p) => formatCurrency(p.Amount) },
        { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.Status} /> },
      ]}
    />
  );
}
