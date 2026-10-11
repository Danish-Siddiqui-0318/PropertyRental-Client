import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { LoadingState } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";
import { useRequireAuth } from "@/lib/use-require-auth";
import type { Role } from "@/lib/types";

type NavItem = { to: string; label: string; roles: Role[] };

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Overview", roles: ["renter", "owner", "admin"] },
  { to: "/dashboard/properties", label: "My properties", roles: ["owner"] },
  { to: "/dashboard/rentals", label: "Rental agreements", roles: ["renter", "owner"] },
  { to: "/dashboard/inquiries", label: "Inquiries", roles: ["renter", "owner"] },
  { to: "/dashboard/payments", label: "Payments", roles: ["renter", "owner"] },
  { to: "/dashboard/transactions", label: "Transactions", roles: ["renter", "owner"] },
  { to: "/dashboard/earnings", label: "Earnings", roles: ["owner"] },
  { to: "/dashboard/profile", label: "Profile & security", roles: ["renter", "owner", "admin"] },
];

const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Overview", roles: ["admin"] },
  { to: "/admin/users", label: "Users", roles: ["admin"] },
  { to: "/admin/properties", label: "Properties", roles: ["admin"] },
  { to: "/admin/rentals", label: "Rentals", roles: ["admin"] },
  { to: "/admin/payments", label: "Payments", roles: ["admin"] },
  { to: "/admin/transactions", label: "Transactions", roles: ["admin"] },
];

export function DashboardShell({
  title,
  description,
  actions,
  children,
  area = "dashboard",
  allow,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  area?: "dashboard" | "admin";
  allow?: Role[];
}) {
  const { role } = useAuth();
  const { checking } = useRequireAuth(allow);

  if (checking) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <LoadingState label="Checking your session…" />
      </div>
    );
  }

  const items = (area === "admin" ? ADMIN_NAV : NAV).filter((item) =>
    role ? item.roles.includes(role) : false,
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:py-12">
      <div className="grid gap-6 lg:grid-cols-[232px_minmax(0,1fr)] lg:gap-10">
        <nav className="min-w-0 lg:sticky lg:top-24 lg:self-start lg:rounded-2xl lg:border lg:border-border lg:bg-surface lg:p-3 lg:shadow-sm">
          <p className="eyebrow hidden px-3 pt-1 lg:block">{area === "admin" ? "Administration" : "Account"}</p>
          <div className="-mx-5 flex gap-1 overflow-x-auto border-b border-border px-5 pb-3 sm:-mx-8 sm:px-8 lg:mx-0 lg:mt-2 lg:flex-col lg:overflow-visible lg:border-0 lg:px-0 lg:pb-0">
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/dashboard" || item.to === "/admin" }}
                activeProps={{ className: "bg-primary text-primary-foreground hover:text-primary-foreground" }}
                className="shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
          {role !== "admin" ? null : (
            <Link
              to={area === "admin" ? "/dashboard" : "/admin"}
              className="mt-2 inline-block rounded-lg px-3 py-2 text-sm font-medium text-primary hover:underline lg:mt-3 lg:border-t lg:border-border lg:pt-3"
            >
              {area === "admin" ? "← My account" : "Admin console →"}
            </Link>
          )}
        </nav>

        <main className="min-w-0">
          <div className="mb-6 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">{title}</h1>
              {description ? (
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
            {actions}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
