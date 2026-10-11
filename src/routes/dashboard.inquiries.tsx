import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { DashboardShell } from "@/components/dashboard-shell";
import { Alert, Button, EmptyState, ErrorState, LoadingState, Panel, StatusBadge, Textarea } from "@/components/ui/primitives";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { ownerInquiriesQuery, renterInquiriesQuery } from "@/lib/queries";
import type { Inquiry } from "@/lib/types";

export const Route = createFileRoute("/dashboard/inquiries")({
  head: () => ({
    meta: [
      { title: "Inquiries — AD Property Rental" },
      { name: "description", content: "Messages between renters and property owners." },
      { property: "og:title", content: "Inquiries — AD Property Rental" },
      { property: "og:description", content: "Messages between renters and property owners." },
    ],
  }),
  component: () => (
    <DashboardShell title="Inquiries" description="Questions sent about properties and the owners' replies." allow={["renter", "owner"]}>
      <Inquiries />
    </DashboardShell>
  ),
});

function Inquiries() {
  const { role } = useAuth();
  const query = useQuery(role === "owner" ? ownerInquiriesQuery() : renterInquiriesQuery());

  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  if (!query.data.length)
    return (
      <EmptyState
        title="No inquiries yet"
        description={role === "owner" ? "Renter questions about your properties will appear here." : "Send an inquiry from any property page."}
      />
    );

  return (
    <div className="space-y-4">
      {query.data.map((inq) => (
        <InquiryItem key={inq.InquiryID} inquiry={inq} canReply={role === "owner"} />
      ))}
    </div>
  );
}

function InquiryItem({ inquiry, canReply }: { inquiry: Inquiry; canReply: boolean }) {
  const qc = useQueryClient();
  const [reply, setReply] = useState("");
  const mutation = useMutation({
    mutationFn: () =>
      apiRequest(`/properties/inquiries/${inquiry.InquiryID}/reply`, {
        method: "PUT",
        auth: true,
        body: { ownerReply: reply },
      }),
    onSuccess: () => {
      setReply("");
      void qc.invalidateQueries({ queryKey: ["owner-inquiries"] });
    },
  });

  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            to="/properties/$propertyId"
            params={{ propertyId: String(inquiry.PropertyID) }}
            className="font-display text-lg font-bold hover:text-primary"
          >
            {inquiry.PropertyTitle ?? `Property #${inquiry.PropertyID}`}
          </Link>
          <p className="text-xs text-muted-foreground">
            {canReply
              ? `From ${inquiry.RenterName ?? "renter"}${inquiry.RenterEmail ? ` · ${inquiry.RenterEmail}` : ""}${inquiry.RenterPhone ? ` · ${inquiry.RenterPhone}` : ""}`
              : `To ${inquiry.OwnerName ?? "owner"}${inquiry.OwnerEmail ? ` · ${inquiry.OwnerEmail}` : ""}`}
            {" · "}
            {formatDateTime(inquiry.CreatedAt)}
          </p>
        </div>
        <StatusBadge status={inquiry.Status} />
      </div>

      <p className="mt-4 whitespace-pre-line text-sm">{inquiry.Message}</p>

      {inquiry.OwnerReply ? (
        <div className="mt-4 rounded-2xl border-l-2 border-primary bg-primary/5 p-4">
          <p className="eyebrow">Owner reply · {formatDateTime(inquiry.RepliedAt)}</p>
          <p className="mt-1 whitespace-pre-line text-sm">{inquiry.OwnerReply}</p>
        </div>
      ) : null}

      {canReply && !inquiry.OwnerReply ? (
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <Textarea required value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply…" maxLength={1000} />
          {mutation.isError ? <Alert>{(mutation.error as Error).message}</Alert> : null}
          <Button type="submit" size="sm" disabled={mutation.isPending}>
            {mutation.isPending ? "Sending…" : "Send reply"}
          </Button>
        </form>
      ) : null}
    </Panel>
  );
}
