import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard-shell";
import { emptyProperty, PropertyForm, toPayload } from "@/components/property-form";
import { Panel } from "@/components/ui/primitives";
import { apiRequest } from "@/lib/api";

export const Route = createFileRoute("/dashboard/properties/new")({
  head: () => ({
    meta: [
      { title: "Add a property — AD Property Rental" },
      { name: "description", content: "List a new rental property with photos." },
      { property: "og:title", content: "Add a property — AD Property Rental" },
      { property: "og:description", content: "List a new rental property with photos." },
    ],
  }),
  component: NewProperty,
});

function NewProperty() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  return (
    <DashboardShell title="Add property" description="Photos are uploaded to the server together with the listing." allow={["owner"]}>
      <Panel className="max-w-3xl">
        <PropertyForm
          initial={emptyProperty}
          submitLabel="Publish property"
          withPhotos
          onSubmit={async (values, photos) => {
            const fd = new FormData();
            Object.entries(toPayload(values)).forEach(([k, v]) => fd.append(k, String(v)));
            photos.forEach((file) => fd.append("photos", file));
            await apiRequest("/properties", { method: "POST", auth: true, formData: fd });
            void qc.invalidateQueries({ queryKey: ["my-properties"] });
            void qc.invalidateQueries({ queryKey: ["properties"] });
            void navigate({ to: "/dashboard/properties" });
          }}
        />
      </Panel>
    </DashboardShell>
  );
}
