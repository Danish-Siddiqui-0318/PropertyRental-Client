import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";

import { PropertyCard } from "@/components/property-card";
import {
  Button,
  EmptyState,
  ErrorState,
  Field,
  Input,
  LoadingState,
  Select,
} from "@/components/ui/primitives";
import { propertiesQuery } from "@/lib/queries";

type Search = {
  q?: string | undefined;
  city?: string | undefined;
  type?: string | undefined;
  bedrooms?: string | undefined;
  maxRent?: string | undefined;
  sort?: string | undefined;
};

export const Route = createFileRoute("/properties/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    city: typeof search["city"] === "string" ? search["city"] : undefined,
    type: typeof search["type"] === "string" ? search["type"] : undefined,
    bedrooms: typeof search["bedrooms"] === "string" ? search["bedrooms"] : undefined,
    maxRent: typeof search["maxRent"] === "string" ? search["maxRent"] : undefined,
    sort: typeof search["sort"] === "string" ? search["sort"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Browse rental properties — AD Property Rental" },
      {
        name: "description",
        content:
          "Search every available rental property by city, type, bedrooms and monthly rent.",
      },
      { property: "og:title", content: "Browse rental properties — AD Property Rental" },
      {
        property: "og:description",
        content:
          "Search every available rental property by city, type, bedrooms and monthly rent.",
      },
    ],
  }),
  component: PropertiesPage,
});

function PropertiesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/properties/" });
  const { data, isPending, isError, error, refetch } = useQuery(propertiesQuery());

  const properties = data ?? [];

  const cities = useMemo(
    () => Array.from(new Set(properties.map((p) => p.City).filter(Boolean))).sort(),
    [properties],
  );
  const types = useMemo(
    () => Array.from(new Set(properties.map((p) => p.PropertyType).filter(Boolean))).sort(),
    [properties],
  );

  const filtered = useMemo(() => {
    const q = (search.q ?? "").trim().toLowerCase();
    const minBeds = search.bedrooms ? Number(search.bedrooms) : null;
    const maxRent = search.maxRent ? Number(search.maxRent) : null;

    const result = properties.filter((p) => {
      if (q) {
        const haystack = `${p.Title} ${p.Description ?? ""} ${p.Address} ${p.City}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (search.city && p.City !== search.city) return false;
      if (search.type && p.PropertyType !== search.type) return false;
      if (minBeds !== null && (p.Bedrooms ?? 0) < minBeds) return false;
      if (maxRent !== null && Number(p.MonthlyRent) > maxRent) return false;
      return true;
    });

    if (search.sort === "rent-asc") result.sort((a, b) => Number(a.MonthlyRent) - Number(b.MonthlyRent));
    else if (search.sort === "rent-desc") result.sort((a, b) => Number(b.MonthlyRent) - Number(a.MonthlyRent));
    else
      result.sort(
        (a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime(),
      );

    return result;
  }, [properties, search]);

  function update(patch: Partial<Search>) {
    void navigate({
      search: (prev: Search) => {
        const next: Search = { ...prev, ...patch };
        (Object.keys(next) as (keyof Search)[]).forEach((key) => {
          if (!next[key]) delete next[key];
        });
        return next;
      },
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <h1 className="font-display text-4xl font-medium tracking-tight">
        Browse properties
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Every property currently listed as available on AD Property Rental.
      </p>

      <div className="mt-8 grid gap-4 rounded-3xl border border-border bg-surface/50 p-5 sm:grid-cols-2 lg:grid-cols-5">
        <Field label="Keyword" className="sm:col-span-2 lg:col-span-1">
          <Input
            value={search.q ?? ""}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Title, address…"
          />
        </Field>
        <Field label="City">
          <Select value={search.city ?? ""} onChange={(e) => update({ city: e.target.value })}>
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Property type">
          <Select value={search.type ?? ""} onChange={(e) => update({ type: e.target.value })}>
            <option value="">All types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Min bedrooms">
          <Select
            value={search.bedrooms ?? ""}
            onChange={(e) => update({ bedrooms: e.target.value })}
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={String(n)}>
                {n}+
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Max monthly rent">
          <Input
            type="number"
            min={0}
            value={search.maxRent ?? ""}
            onChange={(e) => update({ maxRent: e.target.value })}
            placeholder="No limit"
          />
        </Field>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">
          {isPending ? "Loading…" : `${filtered.length} of ${properties.length} properties`}
        </p>
        <div className="flex items-center gap-3">
          <Select
            value={search.sort ?? ""}
            onChange={(e) => update({ sort: e.target.value })}
            className="w-auto py-2"
          >
            <option value="">Newest first</option>
            <option value="rent-asc">Rent: low to high</option>
            <option value="rent-desc">Rent: high to low</option>
          </Select>
          <Button variant="ghost" size="sm" onClick={() => void navigate({ search: {} })}>
            Reset
          </Button>
        </div>
      </div>

      <div className="mt-6">
        {isPending ? (
          <LoadingState label="Loading properties…" />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No matching properties"
            description="Try widening your filters or clearing the search."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((property) => (
              <PropertyCard key={property.PropertyID} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
