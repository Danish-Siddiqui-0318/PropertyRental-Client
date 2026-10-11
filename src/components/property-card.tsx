import { Link } from "@tanstack/react-router";
import { ImageOff } from "lucide-react";

import { StatusBadge } from "@/components/ui/primitives";
import { bedsLabel, formatCurrency } from "@/lib/format";
import { propertyTypeLabel } from "@/lib/property-types";
import type { Property } from "@/lib/types";

export function primaryPhoto(property: Property): string | null {
  const photos = property.photos ?? [];
  const primary = photos.find((p) => p.IsPrimary) ?? photos[0];
  return primary?.PhotoURL ?? null;
}

export function PropertyCard({ property }: { property: Property }) {
  const photo = primaryPhoto(property);

  return (
    <Link
      to="/properties/$propertyId"
      params={{ propertyId: String(property.PropertyID) }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        {photo ? (
          <img
            src={photo}
            alt={property.Title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="size-6" />
            <span className="text-[10px] uppercase tracking-[0.2em]">No photo</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-bold leading-tight">{property.Title}</h3>
          <span className="whitespace-nowrap font-display font-bold text-primary">
            {formatCurrency(property.MonthlyRent)}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {bedsLabel(property.Bedrooms, property.Bathrooms, property.PropertyType)}
        </p>
        <p className="text-sm text-muted-foreground">{propertyTypeLabel(property.PropertyType)} · {property.City}</p>
        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <StatusBadge status={property.Status} />
          <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity group-hover:opacity-90">
            View details
          </span>
        </div>
      </div>
    </Link>
  );
}
