import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  align?: "right";
  hideOnMobile?: boolean;
};

/**
 * Responsive table: a real table on desktop, stacked label/value rows on
 * small screens so dashboards stay readable on phones.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  caption?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <table className="hidden w-full md:table">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-b border-border bg-surface-2/70 text-left">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`whitespace-nowrap px-5 py-3 text-xs font-medium text-muted-foreground ${
                  col.align === "right" ? "text-right" : ""
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-t border-border/60 transition-colors hover:bg-surface-2/50">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-5 py-4 align-middle text-sm ${
                    col.align === "right" ? "text-right" : ""
                  }`}
                >
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="divide-y divide-border/60 md:hidden">
        {rows.map((row) => (
          <div key={rowKey(row)} className="space-y-2 p-4">
            {columns.map((col) => (
              <div key={col.key} className="flex items-start justify-between gap-4">
                <span className="shrink-0 pt-0.5 text-xs font-medium text-muted-foreground">{col.header}</span>
                <span className="min-w-0 break-words text-right text-sm">{col.cell(row)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: ReactNode;
  tone?: "primary" | "accent";
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={`mt-1 truncate font-display text-2xl font-semibold sm:text-3xl ${
          tone === "primary" ? "text-primary" : tone === "accent" ? "text-accent" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
