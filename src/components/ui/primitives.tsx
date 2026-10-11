import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-150 active:translate-y-px focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        primary: "rounded-lg bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        flame: "rounded-lg bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        outline:
          "rounded-lg border border-input bg-surface text-foreground hover:border-primary/40 hover:bg-primary/5",
        ghost: "rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5",
        danger:
          "rounded-lg border border-destructive/50 text-destructive hover:bg-destructive/10",
        pill: "rounded-lg bg-primary px-5 py-2 text-primary-foreground shadow-sm hover:bg-primary/90",
      },
      size: {
        sm: "h-9 px-3.5",
        md: "h-11 px-5",
        lg: "h-12 px-7",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

const fieldClass =
  "w-full rounded-lg border border-input bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 aria-[invalid=true]:border-destructive";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint ? <span className="mt-1 block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClass, className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldClass, "pr-8", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClass, "min-h-28 resize-y", className)} {...props} />;
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-surface p-6 shadow-sm", className)}>{children}</div>
  );
}

export function StatusBadge({ status }: { status?: string | null }) {
  const value = (status ?? "unknown").toLowerCase();
  const tone =
    ["available", "active", "paid", "succeeded", "approved", "completed", "replied"].includes(value)
      ? "bg-success/12 text-success ring-success/25"
      : ["pending", "due", "unpaid", "processing"].includes(value)
        ? "bg-warning/15 text-[color:var(--warning-strong)] ring-warning/30"
        : ["failed", "cancelled", "canceled", "rejected", "terminated", "overdue"].includes(value)
          ? "bg-destructive/10 text-destructive ring-destructive/25"
          : "bg-muted text-muted-foreground ring-border";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset before:size-1.5 before:rounded-full before:bg-current before:content-['']",
        tone,
      )}
    >
      {status ?? "—"}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block size-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary",
        className,
      )}
    />
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-muted-foreground">
      <Spinner />
      {label}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-input bg-surface/60 px-6 py-12 text-center">
      <h3 className="font-display text-lg font-medium">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  const message =
    error instanceof Error ? error.message : "Something went wrong while contacting the server.";
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-8 text-center">
      <h3 className="font-display text-lg font-medium text-destructive">
        We couldn’t load this
      </h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-foreground/80">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function Alert({ tone = "error", children }: { tone?: "error" | "success"; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        tone === "error"
          ? "border-destructive/40 bg-destructive/10 text-foreground"
          : "border-success/30 bg-success/10 text-foreground",
      )}
    >
      {children}
    </div>
  );
}
