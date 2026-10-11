import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard-shell";
import { DataTable } from "@/components/data-table";
import { Button, EmptyState, ErrorState, LoadingState, StatusBadge } from "@/components/ui/primitives";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { transactionsQuery } from "@/lib/queries";
import type { Transaction } from "@/lib/types";

export const Route = createFileRoute("/dashboard/transactions/")({
  head: () => ({
    meta: [
      { title: "Transactions — AD Property Rental" },
      { name: "description", content: "Your full transaction history." },
      { property: "og:title", content: "Transactions — AD Property Rental" },
      { property: "og:description", content: "Your full transaction history." },
    ],
  }),
  component: () => (
    <DashboardShell title="Transactions" description="Every payment attempt processed by Stripe." allow={["renter", "owner"]}>
      <List />
    </DashboardShell>
  ),
});

function List() {
  const { data, isPending, isError, error, refetch } = useQuery(transactionsQuery());
  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!data.length) return <EmptyState title="No transactions yet" />;

  return (
    <DataTable<Transaction>
      rows={data}
      rowKey={(t) => t.TransactionID}
      columns={[
        { key: "id", header: "#", cell: (t) => t.TransactionID },
        { key: "property", header: "Property", cell: (t) => t.PropertyTitle ?? `Payment #${t.PaymentID}` },
        { key: "date", header: "Date", cell: (t) => formatDateTime(t.TransactionDate) },
        { key: "amount", header: "Amount", cell: (t) => <span className="font-display font-bold text-primary">{formatCurrency(t.Amount)}</span> },
        { key: "status", header: "Status", cell: (t) => <StatusBadge status={t.Status} /> },
        {
          key: "open",
          header: "",
          align: "right",
          cell: (t) => (
            <Link to="/dashboard/transactions/$transactionId" params={{ transactionId: String(t.TransactionID) }}>
              <Button variant="outline" size="sm">Details</Button>
            </Link>
          ),
        },
      ]}
    />
  );
}
