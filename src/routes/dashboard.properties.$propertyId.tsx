import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";

import { DashboardShell } from "@/components/dashboard-shell";
import { PropertyForm, toPayload } from "@/components/property-form";
import { Alert, Button, ErrorState, Input, LoadingState, Panel } from "@/components/ui/primitives";
import { apiRequest } from "@/lib/api";
import { propertyQuery } from "@/lib/queries";

export const Route = createFileRoute("/dashboard/properties/$propertyId")({
  head: () => ({
    meta: [
      { title: "Edit property — AD Property Rental" },
      { name: "description", content: "Update listing details and manage property photos." },
      { property: "og:title", content: "Edit property — AD Property Rental" },
      { property: "og:description", content: "Update listing details and manage property photos." },
    ],
  }),
  component: () => (
    <DashboardShell title="Edit property" allow={["owner"]}>
      <EditProperty />
    </DashboardShell>
  ),
});

function EditProperty() {
  const { propertyId } = Route.useParams();
  const id = Number(propertyId);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data, isPending, isError, error, refetch } = useQuery(propertyQuery(id));
  const [files, setFiles] = useState<File[]>([]);

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["property", id] });
    void qc.invalidateQueries({ queryKey: ["my-properties"] });
    void qc.invalidateQueries({ queryKey: ["properties"] });
  };

  const upload = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      files.forEach((f) => fd.append("photos", f));
      return apiRequest(`/properties/${id}/photos`, { method: "POST", auth: true, formData: fd });
    },
    onSuccess: () => {
      setFiles([]);
      refresh();
    },
  });

  const removePhoto = useMutation({
    mutationFn: (photoId: number) =>
      apiRequest(`/properties/${id}/photos/${photoId}`, { method: "DELETE", auth: true }),
    onSuccess: refresh,
  });

  if (isPending) return <LoadingState />;
  if (isError || !data) return <ErrorState error={error} onRetry={() => void refetch()} />;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Panel>
        <PropertyForm
          initial={{
            title: data.Title,
            description: data.Description ?? "",
            propertyType: data.PropertyType,
            address: data.Address,
            city: data.City,
            bedrooms: String(data.Bedrooms ?? 0),
            bathrooms: String(data.Bathrooms ?? 0),
            monthlyRent: String(data.MonthlyRent),
          }}
          submitLabel="Save changes"
          onSubmit={async (values) => {
            await apiRequest(`/properties/${id}`, { method: "PUT", auth: true, body: toPayload(values) });
            refresh();
            void navigate({ to: "/dashboard/properties" });
          }}
        />
      </Panel>

      <Panel className="self-start">
        <h2 className="font-display text-lg font-medium tracking-tight">Photos</h2>
        {data.photos.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No photos uploaded yet.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {data.photos.map((photo) => (
              <div key={photo.PhotoID} className="relative overflow-hidden rounded-xl border border-border">
                <img src={photo.PhotoURL} alt="" className="aspect-square w-full object-cover" />
                {photo.IsPrimary ? (
                  <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase text-primary-foreground">
                    Cover
                  </span>
                ) : null}
                <button
                  type="button"
                  aria-label="Delete photo"
                  disabled={removePhoto.isPending}
                  onClick={() => {
                    if (window.confirm("Delete this photo?")) removePhoto.mutate(photo.PhotoID);
                  }}
                  className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        {removePhoto.isError ? <div className="mt-3"><Alert>{(removePhoto.error as Error).message}</Alert></div> : null}

        <form
          className="mt-5 space-y-3 border-t border-border pt-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (files.length) upload.mutate();
          }}
        >
          <Input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 10))} />
          {upload.isError ? <Alert>{(upload.error as Error).message}</Alert> : null}
          {upload.isSuccess ? <Alert tone="success">Photos uploaded.</Alert> : null}
          <Button type="submit" variant="outline" size="sm" disabled={!files.length || upload.isPending}>
            {upload.isPending ? "Uploading…" : "Upload photos"}
          </Button>
        </form>
      </Panel>
    </div>
  );
}
