import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/ui/primitives";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Transaction } from "@/lib/types";

export function TransactionTable({ rows, showParties }: { rows: Transaction[]; showParties?: boolean }) {
  return (
    <DataTable<Transaction>
      rows={rows}
      rowKey={(t) => t.TransactionID}
      columns={[
        { key: "id", header: "#", cell: (t) => t.TransactionID },
        ...(showParties
          ? [
              { key: "property", header: "Property", cell: (t: Transaction) => t.PropertyTitle ?? "—" },
              { key: "parties", header: "Renter → Owner", cell: (t: Transaction) => `${t.RenterName ?? "—"} → ${t.OwnerName ?? "—"}` },
            ]
          : []),
        { key: "ref", header: "Reference", cell: (t) => <span className="break-all text-xs">{t.TransactionReference ?? "—"}</span> },
        { key: "method", header: "Method", cell: (t) => t.PaymentMethod ?? "—" },
        { key: "date", header: "Date", cell: (t) => formatDateTime(t.TransactionDate ?? t.CreatedAt) },
        { key: "amount", header: "Amount", cell: (t) => <span className="font-display font-bold">{formatCurrency(t.Amount)}</span> },
        { key: "status", header: "Status", cell: (t) => <StatusBadge status={t.Status} /> },
      ]}
    />
  );
}
