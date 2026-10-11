import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard-shell";
import { Alert, Button, ErrorState, LoadingState, Panel, StatusBadge } from "@/components/ui/primitives";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { rentalQuery } from "@/lib/queries";

export const Route = createFileRoute("/dashboard/rentals/$agreementId")({
  head: () => ({
    meta: [
      { title: "Rental agreement — AD Property Rental" },
      { name: "description", content: "Details of a rental agreement, with approval and termination actions." },
      { property: "og:title", content: "Rental agreement — AD Property Rental" },
      { property: "og:description", content: "Details of a rental agreement." },
    ],
  }),
  component: () => (
    <DashboardShell title="Rental agreement" allow={["renter", "owner"]}>
      <RentalDetail />
    </DashboardShell>
  ),
});

function RentalDetail() {
  const { agreementId } = Route.useParams();
  const id = Number(agreementId);
  const { role } = useAuth();
  const qc = useQueryClient();
  const { data: r, isPending, isError, error, refetch } = useQuery(rentalQuery(id));

  const action = useMutation({
    mutationFn: (kind: "approve" | "terminate") =>
      apiRequest<{ message: string }>(`/rentals/${id}/${kind}`, { method: "PUT", auth: true }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["rental", id] });
      void qc.invalidateQueries({ queryKey: ["rentals"] });
      void qc.invalidateQueries({ queryKey: ["payments"] });
      void qc.invalidateQueries({ queryKey: ["my-properties"] });
      void qc.invalidateQueries({ queryKey: ["properties"] });
    },
  });

  if (isPending) return <LoadingState />;
  if (isError || !r) return <ErrorState error={error} onRetry={() => void refetch()} />;

  const status = r.Status?.toLowerCase();

  return (
    <div className="space-y-6">
      <Link to="/dashboard/rentals" className="font-display text-xs font-bold uppercase text-muted-foreground hover:text-foreground">
        ← All agreements
      </Link>
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Agreement #{r.AgreementID}</p>
            <h2 className="mt-1 font-display text-2xl font-medium tracking-tight">{r.PropertyTitle}</h2>
            <p className="text-sm text-muted-foreground">{[r.Address, r.City].filter(Boolean).join(", ")}</p>
          </div>
          <StatusBadge status={r.Status} />
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Item label="Start date" value={formatDate(r.StartDate)} />
          <Item label="End date" value={formatDate(r.EndDate)} />
          <Item label="Monthly rent" value={formatCurrency(r.MonthlyRent)} />
          <Item label="Security deposit" value={formatCurrency(r.SecurityDeposit)} />
          <Item label="Payment due day" value={`Day ${r.PaymentDueDay}`} />
          <Item label="Requested" value={formatDate(r.CreatedAt)} />
        </dl>
      </Panel>

      <div className="grid gap-6 md:grid-cols-2">
        <Panel>
          <p className="eyebrow">Owner</p>
          <p className="mt-1 font-display font-bold">{r.OwnerName ?? "—"}</p>
          <p className="text-sm text-muted-foreground">{r.OwnerEmail}</p>
          <p className="text-sm text-muted-foreground">{r.OwnerPhone}</p>
        </Panel>
        <Panel>
          <p className="eyebrow">Renter</p>
          <p className="mt-1 font-display font-bold">{r.RenterName ?? "—"}</p>
          <p className="text-sm text-muted-foreground">{r.RenterEmail}</p>
          <p className="text-sm text-muted-foreground">{r.RenterPhone}</p>
        </Panel>
      </div>

      {role === "owner" && (status === "pending" || status === "active") ? (
        <Panel>
          <p className="eyebrow">Owner actions</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {status === "pending" ? (
              <Button disabled={action.isPending} onClick={() => action.mutate("approve")}>
                Approve request
              </Button>
            ) : null}
            {status === "active" ? (
              <Button
                variant="danger"
                disabled={action.isPending}
                onClick={() => {
                  if (window.confirm("Terminate this rental agreement?")) action.mutate("terminate");
                }}
              >
                Terminate agreement
              </Button>
            ) : null}
          </div>
          <div className="mt-3">
            {action.isError ? <Alert>{(action.error as Error).message}</Alert> : null}
            {action.isSuccess ? <Alert tone="success">{action.data.message}</Alert> : null}
          </div>
        </Panel>
      ) : null}

      <Link to="/dashboard/payments">
        <Button variant="outline">View related payments</Button>
      </Link>
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
