import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { DashboardShell } from "@/components/dashboard-shell";
import { DataTable } from "@/components/data-table";
import { Button, EmptyState, ErrorState, Input, LoadingState, Select, StatusBadge } from "@/components/ui/primitives";
import { formatDate } from "@/lib/format";
import { adminUsersQuery } from "@/lib/queries";
import type { AdminUser } from "@/lib/types";

export const Route = createFileRoute("/admin/users/")({
  head: () => ({
    meta: [
      { title: "Users — AD Property Rental admin" },
      { name: "description", content: "All registered users on AD Property Rental." },
      { property: "og:title", content: "Users — AD Property Rental admin" },
      { property: "og:description", content: "All registered users." },
    ],
  }),
  component: () => (
    <DashboardShell area="admin" allow={["admin"]} title="Users">
      <Users />
    </DashboardShell>
  ),
});

function Users() {
  const { data, isPending, isError, error, refetch } = useQuery(adminUsersQuery());
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");

  const rows = useMemo(
    () =>
      (data ?? []).filter(
        (u) =>
          (!role || u.Role === role) &&
          `${u.Name} ${u.Email}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [data, q, role],
  );

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Input className="max-w-xs" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select className="w-auto" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="renter">Renters</option>
          <option value="owner">Owners</option>
          <option value="admin">Admins</option>
        </Select>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No users match" />
      ) : (
        <DataTable<AdminUser>
          rows={rows}
          rowKey={(u) => u.UserID}
          columns={[
            { key: "id", header: "#", cell: (u) => u.UserID },
            { key: "name", header: "Name", cell: (u) => <span className="font-display font-semibold">{u.Name}</span> },
            { key: "email", header: "Email", cell: (u) => u.Email },
            { key: "phone", header: "Phone", cell: (u) => u.Phone ?? "—" },
            { key: "role", header: "Role", cell: (u) => <StatusBadge status={u.Role} /> },
            { key: "joined", header: "Joined", cell: (u) => formatDate(u.CreatedAt) },
            {
              key: "open",
              header: "",
              align: "right",
              cell: (u) => (
                <Link to="/admin/users/$userId" params={{ userId: String(u.UserID) }}>
                  <Button variant="outline" size="sm">View</Button>
                </Link>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
