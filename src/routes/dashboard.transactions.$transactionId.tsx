import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard-shell";
import { ErrorState, LoadingState, Panel, StatusBadge } from "@/components/ui/primitives";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { transactionQuery } from "@/lib/queries";

export const Route = createFileRoute("/dashboard/transactions/$transactionId")({
  head: () => ({
    meta: [
      { title: "Transaction details — AD Property Rental" },
      { name: "description", content: "Details of a single payment transaction." },
      { property: "og:title", content: "Transaction details — AD Property Rental" },
      { property: "og:description", content: "Details of a single payment transaction." },
    ],
  }),
  component: () => (
    <DashboardShell title="Transaction details" allow={["renter", "owner"]}>
      <Detail />
    </DashboardShell>
  ),
});

function Detail() {
  const { transactionId } = Route.useParams();
  const { data: t, isPending, isError, error, refetch } = useQuery(transactionQuery(Number(transactionId)));
  if (isPending) return <LoadingState />;
  if (isError || !t) return <ErrorState error={error} onRetry={() => void refetch()} />;

  const rows: [string, string][] = [
    ["Property", t.PropertyTitle ?? "—"],
    ["Payment", `#${t.PaymentID}`],
    ["Payment status", t.PaymentStatus ?? "—"],
    ["Amount", formatCurrency(t.Amount)],
    ["Method", t.PaymentMethod ?? "—"],
    ["Reference", t.TransactionReference ?? "—"],
    ["Date", formatDateTime(t.TransactionDate)],
    ["Failure reason", t.FailureReason ?? "—"],
  ];

  return (
    <div className="space-y-4">
      <Link to="/dashboard/transactions" className="font-display text-xs font-bold uppercase text-muted-foreground hover:text-foreground">
        ← All transactions
      </Link>
      <Panel>
        <div className="flex items-center justify-between">
          <p className="eyebrow">Transaction #{t.TransactionID}</p>
          <StatusBadge status={t.Status} />
        </div>
        <dl className="mt-4 divide-y divide-border/60">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-3 text-sm">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="break-all text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </Panel>
    </div>
  );
}
