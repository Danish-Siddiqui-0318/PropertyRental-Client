import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard-shell";
import { DataTable } from "@/components/data-table";
import { primaryPhoto } from "@/components/property-card";
import { useState } from "react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, Button, EmptyState, ErrorState, LoadingState, StatusBadge } from "@/components/ui/primitives";
import { apiRequest } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { myPropertiesQuery } from "@/lib/queries";
import { propertyTypeLabel } from "@/lib/property-types";
import type { Property } from "@/lib/types";

export const Route = createFileRoute("/dashboard/properties/")({
  head: () => ({
    meta: [
      { title: "My properties — AD Property Rental" },
      { name: "description", content: "Manage the properties you list on AD Property Rental." },
      { property: "og:title", content: "My properties — AD Property Rental" },
      { property: "og:description", content: "Manage the properties you list on AD Property Rental." },
    ],
  }),
  component: () => (
    <DashboardShell
      title="My properties"
      description="Every property you own, including rented ones."
      allow={["owner"]}
      actions={
        <Link to="/dashboard/properties/new">
          <Button variant="flame">Add property</Button>
        </Link>
      }
    >
      <MyProperties />
    </DashboardShell>
  ),
});

function MyProperties() {
  const qc = useQueryClient();
  const [target, setTarget] = useState<Property | null>(null);
  const { data, isPending, isError, error, refetch } = useQuery(myPropertiesQuery());

  const del = useMutation({
    mutationFn: (id: number) => apiRequest(`/properties/${id}`, { method: "DELETE", auth: true }),
    onError: (e) => toast.error((e as Error).message),
    onSuccess: () => {
      toast.success("Property deleted");
      setTarget(null);
      void qc.invalidateQueries({ queryKey: ["my-properties"] });
      void qc.invalidateQueries({ queryKey: ["properties"] });
    },
  });

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!data.length)
    return <EmptyState title="No properties yet" description="Add your first property to start receiving rental requests." />;

  return (
    <div className="space-y-4">
      {del.isError ? <Alert>{(del.error as Error).message}</Alert> : null}
      <AlertDialog open={Boolean(target)} onOpenChange={(o) => { if (!o && !del.isPending) setTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this property?</AlertDialogTitle>
            <AlertDialogDescription>
              "{target?.Title}" and its photos will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={del.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={del.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => { e.preventDefault(); if (target) del.mutate(target.PropertyID); }}
            >
              {del.isPending ? "Deleting…" : "Delete property"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DataTable<Property>
        rows={data}
        rowKey={(p) => p.PropertyID}
        columns={[
          {
            key: "title",
            header: "Property",
            cell: (p) => {
              const photo = primaryPhoto(p);
              return (
                <div className="flex items-center gap-3 text-left">
                  {photo ? (
                    <img src={photo} alt="" className="hidden size-12 rounded-lg object-cover md:block" />
                  ) : null}
                  <div>
                    <Link to="/properties/$propertyId" params={{ propertyId: String(p.PropertyID) }} className="font-display font-semibold hover:text-primary">
                      {p.Title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{p.City}</p>
                  </div>
                </div>
              );
            },
          },
          { key: "type", header: "Type", cell: (p) => propertyTypeLabel(p.PropertyType) },
          { key: "rent", header: "Rent", cell: (p) => <span className="font-display font-bold text-primary">{formatCurrency(p.MonthlyRent)}</span> },
          { key: "photos", header: "Photos", cell: (p) => p.photos?.length ?? 0 },
          { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.Status} /> },
          {
            key: "actions",
            header: "Actions",
            align: "right",
            cell: (p) => (
              <div className="flex justify-end gap-2">
                <Link to="/dashboard/properties/$propertyId" params={{ propertyId: String(p.PropertyID) }}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={del.isPending}
                  onClick={() => setTarget(p)}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
