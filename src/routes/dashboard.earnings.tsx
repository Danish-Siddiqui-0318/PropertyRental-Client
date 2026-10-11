import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard-shell";
import { StatCard } from "@/components/data-table";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/primitives";
import { formatCurrency } from "@/lib/format";
import { ownerEarningsQuery } from "@/lib/queries";
import { TransactionTable } from "@/components/transaction-table";

export const Route = createFileRoute("/dashboard/earnings")({
  head: () => ({
    meta: [
      { title: "Earnings — AD Property Rental" },
      { name: "description", content: "Total earnings and successful transactions across your properties." },
      { property: "og:title", content: "Earnings — AD Property Rental" },
      { property: "og:description", content: "Total earnings across your properties." },
    ],
  }),
  component: () => (
    <DashboardShell title="Earnings" description="Income received across all your properties." allow={["owner"]}>
      <Earnings />
    </DashboardShell>
  ),
});

function Earnings() {
  const { data, isPending, isError, error, refetch } = useQuery(ownerEarningsQuery());
  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <div className="glow-panel grid grid-cols-2 gap-4 rounded-3xl p-5">
        <StatCard label="Total earnings" value={formatCurrency(data.totalEarnings)} tone="primary" />
        <StatCard label="Transactions" value={data.transactions?.length ?? 0} />
      </div>
      {data.transactions?.length ? (
        <TransactionTable rows={data.transactions} />
      ) : (
        <EmptyState title="No earnings yet" description="Completed rent payments will show up here." />
      )}
    </div>
  );
}
