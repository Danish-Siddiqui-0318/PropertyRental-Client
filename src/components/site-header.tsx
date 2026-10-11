import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/properties", label: "Browse" },
] as const;

export function SiteHeader() {
  const { isAuthenticated, role, profile, logout, ready } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const links = [
    ...publicLinks,
    ...(isAuthenticated ? ([{ to: "/dashboard", label: "Dashboard" }] as const) : []),
    ...(role === "admin" ? ([{ to: "/admin", label: "Admin" }] as const) : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight">
          <span className="text-primary">AD</span>
          <span>PROPERTY RENTAL</span>
        </Link>

        <nav className="hidden gap-8 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn("transition-colors hover:text-foreground")}
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: link.to === "/" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!ready ? null : isAuthenticated ? (
            <>
              <Link
                to="/dashboard/profile"
                className="font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
              >
                {profile?.name ?? "Account"}
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/register" className="font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground">
                Register
              </Link>
              <Link to="/login">
                <Button variant="pill">Sign in</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          className="rounded-lg p-2 text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-surface-2 px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-3 font-display text-sm font-semibold uppercase tracking-wider">
            {links.map((link) => (
              <Link key={link.to} to={link.to} className="text-muted-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard/profile" className="font-display text-sm font-semibold uppercase text-muted-foreground">
                  {profile?.name ?? "Account"}
                </Link>
                <Button variant="outline" size="sm" onClick={logout}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="primary" size="sm" className="w-full">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="sm" className="w-full">
                    Create account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
