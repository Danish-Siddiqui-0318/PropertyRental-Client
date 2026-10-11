import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard-shell";
import { TransactionTable } from "@/components/transaction-table";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/primitives";
import { adminTransactionsQuery } from "@/lib/queries";

export const Route = createFileRoute("/admin/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — AD Property Rental admin" },
      { name: "description", content: "All Stripe transactions recorded by the platform." },
      { property: "og:title", content: "Transactions — AD Property Rental admin" },
      { property: "og:description", content: "All transactions recorded by the platform." },
    ],
  }),
  component: () => (
    <DashboardShell area="admin" allow={["admin"]} title="Transactions">
      <List />
    </DashboardShell>
  ),
});

function List() {
  const { data, isPending, isError, error, refetch } = useQuery(adminTransactionsQuery());
  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!data.length) return <EmptyState title="No transactions" />;
  return <TransactionTable rows={data} showParties />;
}
