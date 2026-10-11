import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard-shell";
import { TransactionTable } from "@/components/transaction-table";
import { Alert, Button, ErrorState, LoadingState, Panel, StatusBadge } from "@/components/ui/primitives";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { paymentHistoryQuery, paymentQuery } from "@/lib/queries";

export const Route = createFileRoute("/dashboard/payments/$paymentId")({
  head: () => ({
    meta: [
      { title: "Payment details — AD Property Rental" },
      { name: "description", content: "Payment details, transaction history and secure Stripe checkout." },
      { property: "og:title", content: "Payment details — AD Property Rental" },
      { property: "og:description", content: "Payment details and transaction history." },
    ],
  }),
  component: () => (
    <DashboardShell title="Payment details" allow={["renter", "owner"]}>
      <PaymentDetail />
    </DashboardShell>
  ),
});

function PaymentDetail() {
  const { paymentId } = Route.useParams();
  const id = Number(paymentId);
  const { role } = useAuth();
  const payment = useQuery(paymentQuery(id));
  const history = useQuery(paymentHistoryQuery(id));

  const checkout = useMutation({
    mutationFn: () =>
      apiRequest<{ checkoutUrl: string }>("/payments/create-checkout-session", {
        method: "POST",
        auth: true,
        body: { paymentId: id },
      }),
    onSuccess: (res) => {
      if (res.checkoutUrl) window.location.href = res.checkoutUrl;
    },
  });

  if (payment.isPending) return <LoadingState />;
  if (payment.isError || !payment.data) return <ErrorState error={payment.error} onRetry={() => void payment.refetch()} />;

  const p = payment.data;
  const paid = p.Status?.toLowerCase() === "paid";

  return (
    <div className="space-y-6">
      <Link to="/dashboard/payments" className="font-display text-xs font-bold uppercase text-muted-foreground hover:text-foreground">
        ← All payments
      </Link>

      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Payment #{p.PaymentID} · Agreement #{p.AgreementID}</p>
            <h2 className="mt-1 font-display text-2xl font-medium tracking-tight">{p.PropertyTitle ?? p.PaymentType}</h2>
          </div>
          <StatusBadge status={p.Status} />
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Item label="Amount" value={formatCurrency(p.Amount)} />
          <Item label="Type" value={p.PaymentType} />
          <Item label="Due date" value={formatDate(p.DueDate)} />
          <Item label="Paid at" value={formatDateTime(p.PaidAt)} />
        </dl>

        {role === "renter" && !paid ? (
          <div className="mt-6 space-y-3">
            <Button variant="flame" size="lg" disabled={checkout.isPending} onClick={() => checkout.mutate()}>
              {checkout.isPending ? "Opening Stripe…" : `Pay ${formatCurrency(p.Amount)} with Stripe`}
            </Button>
            {checkout.isError ? <Alert>{(checkout.error as Error).message}</Alert> : null}
            <p className="text-xs text-muted-foreground">
              You will be redirected to Stripe's secure checkout. The status updates here once the server confirms the payment.
            </p>
          </div>
        ) : null}
      </Panel>

      <div>
        <h3 className="mb-3 font-display text-lg font-medium tracking-tight">Transaction history</h3>
        {history.isPending ? (
          <LoadingState />
        ) : history.isError ? (
          <ErrorState error={history.error} onRetry={() => void history.refetch()} />
        ) : !(history.data.transactions ?? []).filter((t) => t.TransactionID).length ? (
          <p className="text-sm text-muted-foreground">No transactions recorded for this payment.</p>
        ) : (
          <TransactionTable rows={history.data.transactions.filter((t) => t.TransactionID)} />
        )}
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-background/60 p-4">
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1 font-display font-bold">{value}</dd>
    </div>
  );
}
