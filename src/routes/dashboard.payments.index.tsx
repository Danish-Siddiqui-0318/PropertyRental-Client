import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard-shell";
import { DataTable } from "@/components/data-table";
import { Button, EmptyState, ErrorState, LoadingState, StatusBadge } from "@/components/ui/primitives";
import { formatCurrency, formatDate } from "@/lib/format";
import { paymentsQuery } from "@/lib/queries";
import type { Payment } from "@/lib/types";

export const Route = createFileRoute("/dashboard/payments/")({
  head: () => ({
    meta: [
      { title: "Payments — AD Property Rental" },
      { name: "description", content: "Rent and deposit payment records for your agreements." },
      { property: "og:title", content: "Payments — AD Property Rental" },
      { property: "og:description", content: "Rent and deposit payment records." },
    ],
  }),
  component: () => (
    <DashboardShell title="Payments" description="Payment records generated for your rental agreements." allow={["renter", "owner"]}>
      <PaymentsList />
    </DashboardShell>
  ),
});

function PaymentsList() {
  const { data, isPending, isError, error, refetch } = useQuery(paymentsQuery());
  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!data.length) return <EmptyState title="No payments yet" description="Payments are created once a rental agreement is approved." />;

  return (
    <DataTable<Payment>
      rows={data}
      rowKey={(p) => p.PaymentID}
      columns={[
        { key: "id", header: "#", cell: (p) => p.PaymentID },
        { key: "property", header: "Property", cell: (p) => <span className="font-display font-semibold">{p.PropertyTitle ?? `Agreement #${p.AgreementID}`}</span> },
        { key: "type", header: "Type", cell: (p) => p.PaymentType },
        { key: "due", header: "Due", cell: (p) => formatDate(p.DueDate) },
        { key: "amount", header: "Amount", cell: (p) => <span className="font-display font-bold text-primary">{formatCurrency(p.Amount)}</span> },
        { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.Status} /> },
        {
          key: "open",
          header: "",
          align: "right",
          cell: (p) => (
            <Link to="/dashboard/payments/$paymentId" params={{ paymentId: String(p.PaymentID) }}>
              <Button variant="outline" size="sm">Details</Button>
            </Link>
          ),
        },
      ]}
    />
  );
}
