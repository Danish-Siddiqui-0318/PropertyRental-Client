import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import heroImage from "@/assets/hero-apartment.jpg";
import { PropertyCard } from "@/components/property-card";
import { Button, EmptyState, ErrorState, Input, LoadingState, Select } from "@/components/ui/primitives";
import { propertiesQuery } from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AD Property Rental" },
      {
        name: "description",
        content:
          "Search available rental homes, send inquiries to owners and manage rental agreements and payments in one place.",
      },
      { property: "og:title", content: "AD Property Rental — Find your next address" },
      {
        property: "og:description",
        content:
          "Search available rental homes, send inquiries to owners and manage rental agreements and payments in one place.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const { data, isPending, isError, error, refetch } = useQuery(propertiesQuery());

  const [city, setCity] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [maxRent, setMaxRent] = useState("");

  const featured = useMemo(() => (data ?? []).slice(0, 3), [data]);

  function search(e: React.FormEvent) {
    e.preventDefault();
    void navigate({
      to: "/properties",
      search: {
        city: city || undefined,
        bedrooms: bedrooms || undefined,
        maxRent: maxRent || undefined,
      },
    });
  }

  return (
    <>
      <section className="relative px-5 pb-20 pt-10 sm:px-8">
        <div className="pointer-events-none absolute -right-24 -top-32 h-[560px] w-[70%] -rotate-12 bg-gradient-to-br from-primary/25 via-surface to-transparent blur-2xl" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-7">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/40 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              {isPending
                ? "Loading inventory…"
                : isError
                  ? "Inventory unavailable"
                  : `Live inventory · ${data?.length ?? 0} available`}
            </div>
            <h1 className="font-display text-6xl font-medium leading-[0.92] tracking-tight lg:text-8xl">
              Find your <span className="text-primary">next</span> address.
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              Rent listed homes and apartments from verified owners. Request a rental, sign the
              agreement and pay securely.
            </p>

            <form
              onSubmit={search}
              className="mt-8 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface/60 p-3"
            >
              <label className="min-w-[180px] flex-1 rounded-xl bg-background/60 px-4 py-3">
                <span className="eyebrow">City</span>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Any city"
                  className="mt-0.5 border-0 bg-transparent p-0 font-display font-semibold focus:ring-0"
                />
              </label>
              <label className="min-w-[150px] flex-1 rounded-xl bg-background/60 px-4 py-3">
                <span className="eyebrow">Bedrooms</span>
                <Select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="mt-0.5 border-0 bg-transparent p-0 font-display font-semibold focus:ring-0"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </Select>
              </label>
              <label className="min-w-[150px] flex-1 rounded-xl bg-background/60 px-4 py-3">
                <span className="eyebrow">Max rent</span>
                <Input
                  type="number"
                  min={0}
                  value={maxRent}
                  onChange={(e) => setMaxRent(e.target.value)}
                  placeholder="No limit"
                  className="mt-0.5 border-0 bg-transparent p-0 font-display font-semibold focus:ring-0"
                />
              </label>
              <Button type="submit" variant="flame" size="lg">
                Search
              </Button>
            </form>
          </div>

          <div className="relative hidden lg:col-span-5 lg:block">
            <div className="absolute inset-0 -rotate-6 rounded-3xl bg-primary/10 blur-2xl" />
            <div className="relative -rotate-6 rounded-3xl border border-border bg-gradient-to-br from-foreground/10 to-foreground/[0.02] p-4 shadow-2xl">
              <img
                src={heroImage}
                alt="Sunlit apartment living room with tall windows"
                width={1200}
                height={1408}
                className="aspect-[5/6] w-full rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl font-medium tracking-tight">
            Latest listings
          </h2>
          <Link
            to="/properties"
            className="font-display text-sm font-semibold uppercase tracking-wide text-primary"
          >
            View all →
          </Link>
        </div>

        {isPending ? (
          <LoadingState label="Loading listings…" />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : featured.length === 0 ? (
          <EmptyState
            title="No properties listed yet"
            description="Once owners publish properties on the server they appear here."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {featured.map((property) => (
              <PropertyCard key={property.PropertyID} property={property} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
