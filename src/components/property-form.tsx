import { useEffect, useMemo, useRef, useState } from "react";

import { Alert, Button, Field, Input, Select, Textarea } from "@/components/ui/primitives";
import { propertyTypeOptions, toPropertyTypeValue } from "@/lib/property-types";

export type PropertyFormValues = {
  title: string;
  description: string;
  propertyType: string;
  address: string;
  city: string;
  bedrooms: string;
  bathrooms: string;
  monthlyRent: string;
};

export const emptyProperty: PropertyFormValues = {
  title: "",
  description: "",
  propertyType: "apartment",
  address: "",
  city: "",
  bedrooms: "1",
  bathrooms: "1",
  monthlyRent: "",
};

export function PropertyForm({
  initial,
  submitLabel,
  withPhotos,
  onSubmit,
}: {
  initial: PropertyFormValues;
  submitLabel: string;
  withPhotos?: boolean;
  onSubmit: (values: PropertyFormValues, photos: File[]) => Promise<void>;
}) {
  const [values, setValues] = useState<PropertyFormValues>(() => ({
    ...initial,
    propertyType: toPropertyTypeValue(initial.propertyType),
  }));
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const set = (key: keyof PropertyFormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setValues({ ...values, [key]: e.target.value });

  const typeOptions = useMemo(() => propertyTypeOptions(values.propertyType), [values.propertyType]);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setPending(true);
        try {
          await onSubmit(values, photos);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setPending(false);
        }
      }}
    >
      <Field label="Title">
        <Input required maxLength={150} value={values.title} onChange={set("title")} />
      </Field>
      <Field label="Description">
        <Textarea required value={values.description} onChange={set("description")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Property type">
          <Select value={values.propertyType} onChange={set("propertyType")}>
            {typeOptions.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Monthly rent">
          <Input type="number" min={1} step="0.01" required value={values.monthlyRent} onChange={set("monthlyRent")} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Address">
          <Input required maxLength={255} value={values.address} onChange={set("address")} />
        </Field>
        <Field label="City">
          <Input required maxLength={100} value={values.city} onChange={set("city")} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Bedrooms">
          <Input type="number" min={0} required value={values.bedrooms} onChange={set("bedrooms")} />
        </Field>
        <Field label="Bathrooms">
          <Input type="number" min={0} required value={values.bathrooms} onChange={set("bathrooms")} />
        </Field>
      </div>
      {withPhotos ? <PhotoDropzone files={photos} onChange={setPhotos} /> : null}
      {error ? <Alert>{error}</Alert> : null}
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : submitLabel}</Button>
    </form>
  );
}

/** Payload sent to the API: the property type is always the exact database value. */
export function toPayload(values: PropertyFormValues) {
  return {
    title: values.title,
    description: values.description,
    propertyType: toPropertyTypeValue(values.propertyType),
    address: values.address,
    city: values.city,
    bedrooms: Number(values.bedrooms),
    bathrooms: Number(values.bathrooms),
    monthlyRent: Number(values.monthlyRent),
  };
}

export const MAX_PHOTOS = 10;

export function PhotoDropzone({ files, onChange, max = MAX_PHOTOS }: { files: File[]; onChange: (f: File[]) => void; max?: number }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);
  const add = (list: FileList | null) => {
    const imgs = Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
    onChange([...files, ...imgs].slice(0, max));
  };
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">Photos</p>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); }}
        className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${over ? "border-primary bg-primary/5" : "border-input hover:border-primary/60"}`}
      >
        <span className="font-display text-lg">Drop images here or click to browse</span>
        <span className="mt-1 text-xs text-muted-foreground">{files.length}/{max} selected · the first image becomes the cover</span>
      </button>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      {files.length ? (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {previews.map((src, i) => (
            <div key={src} className="group relative aspect-square overflow-hidden rounded-lg border">
              <img src={src} alt="" className="size-full object-cover" />
              {i === 0 ? <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">Cover</span> : null}
              <button type="button" aria-label="Remove photo" onClick={() => onChange(files.filter((_, j) => j !== i))}
                className="absolute right-1 top-1 rounded-full bg-background/90 px-2 text-sm opacity-90 hover:text-destructive">×</button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
