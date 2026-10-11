import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ImageOff } from "lucide-react";
import { useState } from "react";

import {
  Alert,
  Button,
  Field,
  Input,
  LoadingState,
  ErrorState,
  Panel,
  StatusBadge,
  Textarea,
} from "@/components/ui/primitives";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { bedsLabel, formatCurrency, formatDate } from "@/lib/format";
import { propertyTypeLabel } from "@/lib/property-types";
import { propertyQuery } from "@/lib/queries";

export const Route = createFileRoute("/properties/$propertyId")({
  head: () => ({
    meta: [
      { title: "Property details — AD Property Rental" },
      {
        name: "description",
        content:
          "Photos, rent, location and owner details for this AD Property Rental listing, with inquiry and rental request options.",
      },
      { property: "og:title", content: "Property details — AD Property Rental" },
      {
        property: "og:description",
        content: "Photos, rent, location and owner details for this rental listing.",
      },
    ],
  }),
  component: PropertyDetail,
});

function PropertyDetail() {
  const { propertyId } = Route.useParams();
  const id = Number(propertyId);
  const { data: property, isPending, isError, error, refetch } = useQuery(propertyQuery(id));
  const [activePhoto, setActivePhoto] = useState(0);

  if (isPending) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <LoadingState label="Loading property…" />
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <ErrorState error={error} onRetry={() => void refetch()} />
        <div className="mt-4 text-center">
          <Link to="/properties" className="font-display text-xs font-bold uppercase text-primary">
            ← Back to all properties
          </Link>
        </div>
      </div>
    );
  }

  const photos = property.photos ?? [];
  const current = photos[activePhoto] ?? photos[0];

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <Link
        to="/properties"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        ← All properties
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
        <div className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="break-words font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
                {property.Title}
              </h1>
              <p className="mt-2 text-base text-muted-foreground">
                {property.Address}, {property.City}
              </p>
            </div>
            <StatusBadge status={property.Status} />
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface-2 shadow-sm">
            {current ? (
              <img
                src={current.PhotoURL}
                alt={property.Title}
                className="aspect-[16/10] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImageOff className="size-7" />
                <span className="text-[10px] uppercase tracking-[0.2em]">
                  No photos uploaded
                </span>
              </div>
            )}
          </div>

          {photos.length > 1 ? (
            <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
              {photos.map((photo, index) => (
                <button
                  key={photo.PhotoID}
                  type="button"
                  onClick={() => setActivePhoto(index)}
                  aria-label={`Show photo ${index + 1}`}
                  className={`overflow-hidden rounded-lg border-2 transition-opacity ${
                    index === activePhoto ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={photo.PhotoURL}
                    alt={`${property.Title} photo ${index + 1}`}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}

          <dl className="mt-8 grid grid-cols-2 divide-border overflow-hidden rounded-2xl border border-border bg-surface sm:grid-cols-4 sm:divide-x">
            <Fact label="Monthly rent" value={formatCurrency(property.MonthlyRent)} highlight />
            <Fact label="Bedrooms" value={property.Bedrooms ?? "—"} />
            <Fact label="Bathrooms" value={property.Bathrooms ?? "—"} />
            <Fact label="Type" value={propertyTypeLabel(property.PropertyType)} />
          </dl>

          {property.Description ? (
            <div className="mt-8">
              <h2 className="font-display text-xl font-medium tracking-tight">
                About this property
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {property.Description}
              </p>
            </div>
          ) : null}

          <p className="mt-6 text-xs text-muted-foreground">
            Listed {formatDate(property.CreatedAt)} ·{" "}
            {bedsLabel(property.Bedrooms, property.Bathrooms, property.PropertyType)}
          </p>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Panel className="p-5">
            <p className="eyebrow">Listed by</p>
            <p className="mt-1 font-display text-lg font-bold">
              {property.owner?.Name ?? `Owner #${property.OwnerID}`}
            </p>
            <div className="mt-3"><StatusBadge status={property.Status} /></div>
            <p className="mt-4 border-t border-border pt-4 font-display text-3xl font-semibold text-primary">
              {formatCurrency(property.MonthlyRent)}
              <span className="text-sm font-normal text-muted-foreground"> /mo</span>
            </p>
          </Panel>

          <InquiryPanel propertyId={id} />
          <RentalRequestPanel
            propertyId={id}
            monthlyRent={Number(property.MonthlyRent)}
            available={property.Status?.toLowerCase() === "available"}
          />
        </aside>
      </div>
    </div>
  );
}

function Fact({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="border-b border-border p-4 sm:border-b-0">
      <dt className="eyebrow">{label}</dt>
      <dd
        className={`mt-1 truncate font-display text-lg font-semibold ${highlight ? "text-primary" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function InquiryPanel({ propertyId }: { propertyId: number }) {
  const { isAuthenticated, role } = useAuth();
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: (text: string) =>
      apiRequest<{ message: string }>(`/properties/${propertyId}/inquiries`, {
        method: "POST",
        auth: true,
        body: { message: text },
      }),
    onSuccess: () => setMessage(""),
  });

  if (!isAuthenticated) {
    return (
      <Panel className="p-5">
        <p className="eyebrow">Contact the owner</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in as a renter to send an inquiry about this property.
        </p>
        <Link to="/login" className="mt-4 block">
          <Button variant="outline" size="sm" className="w-full">
            Sign in
          </Button>
        </Link>
      </Panel>
    );
  }

  if (role !== "renter") {
    return (
      <Panel className="p-5">
        <p className="eyebrow">Contact the owner</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Only renter accounts can send inquiries.
        </p>
      </Panel>
    );
  }

  return (
    <Panel className="p-5">
      <p className="eyebrow">Send an inquiry</p>
      <form
        className="mt-3 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(message);
        }}
      >
        <Textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask the owner about availability, viewings or terms…"
          maxLength={1000}
        />
        {mutation.isError ? <Alert>{(mutation.error as Error).message}</Alert> : null}
        {mutation.isSuccess ? (
          <Alert tone="success">Inquiry sent. The owner can reply from their dashboard.</Alert>
        ) : null}
        <Button type="submit" size="sm" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Sending…" : "Send inquiry"}
        </Button>
      </form>
    </Panel>
  );
}

function RentalRequestPanel({
  propertyId,
  monthlyRent,
  available,
}: {
  propertyId: number;
  monthlyRent: number;
  available: boolean;
}) {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    monthlyRent: String(monthlyRent),
    securityDeposit: String(monthlyRent),
    paymentDueDay: "5",
  });

  const mutation = useMutation({
    mutationFn: () =>
      apiRequest<{ message: string }>("/rentals/request", {
        method: "POST",
        auth: true,
        body: {
          propertyId,
          startDate: form.startDate,
          endDate: form.endDate,
          monthlyRent: Number(form.monthlyRent),
          securityDeposit: Number(form.securityDeposit),
          paymentDueDay: Number(form.paymentDueDay),
        },
      }),
    onSuccess: () => {
      void navigate({ to: "/dashboard/rentals" });
    },
  });

  if (!isAuthenticated || role !== "renter") return null;

  return (
    <Panel className="p-5">
      <p className="eyebrow">Request this rental</p>
      {!available ? (
        <p className="mt-2 text-sm text-muted-foreground">
          This property is not currently marked available.
        </p>
      ) : null}
      <form
        className="mt-3 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start date">
            <Input
              type="date"
              required
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </Field>
          <Field label="End date">
            <Input
              type="date"
              required
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Monthly rent">
            <Input
              type="number"
              min={0}
              required
              value={form.monthlyRent}
              onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })}
            />
          </Field>
          <Field label="Security deposit">
            <Input
              type="number"
              min={0}
              required
              value={form.securityDeposit}
              onChange={(e) => setForm({ ...form, securityDeposit: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Payment due day" hint="Day of the month, 1–28.">
          <Input
            type="number"
            min={1}
            max={28}
            required
            value={form.paymentDueDay}
            onChange={(e) => setForm({ ...form, paymentDueDay: e.target.value })}
          />
        </Field>
        {mutation.isError ? <Alert>{(mutation.error as Error).message}</Alert> : null}
        <Button
          type="submit"
          variant="flame"
          size="sm"
          className="w-full"
          disabled={mutation.isPending || !available}
        >
          {mutation.isPending ? "Submitting…" : "Submit rental request"}
        </Button>
      </form>
    </Panel>
  );
}
