import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard-shell";
import { ErrorState, LoadingState, Panel, StatusBadge } from "@/components/ui/primitives";
import { formatDateTime } from "@/lib/format";
import { adminUserQuery } from "@/lib/queries";

export const Route = createFileRoute("/admin/users/$userId")({
  head: () => ({
    meta: [
      { title: "User details — AD Property Rental admin" },
      { name: "description", content: "Account details for a registered user." },
      { property: "og:title", content: "User details — AD Property Rental admin" },
      { property: "og:description", content: "Account details for a registered user." },
    ],
  }),
  component: () => (
    <DashboardShell area="admin" allow={["admin"]} title="User details">
      <Detail />
    </DashboardShell>
  ),
});

function Detail() {
  const { userId } = Route.useParams();
  const { data: u, isPending, isError, error, refetch } = useQuery(adminUserQuery(Number(userId)));
  if (isPending) return <LoadingState />;
  if (isError || !u) return <ErrorState error={error} onRetry={() => void refetch()} />;

  return (
    <div className="space-y-4">
      <Link to="/admin/users" className="font-display text-xs font-bold uppercase text-muted-foreground hover:text-foreground">
        ← All users
      </Link>
      <Panel className="max-w-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-medium tracking-tight">{u.Name}</h2>
          <StatusBadge status={u.Role} />
        </div>
        <dl className="mt-4 divide-y divide-border/60 text-sm">
          {[
            ["User ID", `#${u.UserID}`],
            ["Email", u.Email],
            ["Phone", u.Phone ?? "—"],
            ["Registered", formatDateTime(u.CreatedAt)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-3">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </Panel>
    </div>
  );
}
