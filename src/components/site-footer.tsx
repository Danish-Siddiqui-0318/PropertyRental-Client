import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-5 py-6 text-center text-xs uppercase tracking-widest text-muted-foreground sm:flex-row sm:justify-between sm:px-8 sm:text-left">
        <span className="font-display font-bold text-foreground">AD Property Rental</span>
        <div className="flex flex-wrap items-center justify-center gap-5">
          <Link to="/properties">Browse</Link>
          <Link to="/login">Sign in</Link>
          <Link to="/register">Register</Link>
        </div>
      </div>
    </footer>
  );
}
