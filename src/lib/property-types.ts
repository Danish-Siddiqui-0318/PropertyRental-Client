/**
 * Property types accepted by the AD Property Rental backend.
 *
 * The `value` of every entry is the exact string stored in the database
 * (lowercase) and is what must be sent to the API. The `label` is display
 * text only and never leaves the browser.
 */
export type PropertyTypeOption = { value: string; label: string };

export const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "room", label: "Room" },
  { value: "portion", label: "Portion" },
] as const;

/** The exact lowercase database value for any label or stored variant. */
export function toPropertyTypeValue(raw: string | null | undefined): string {
  const needle = (raw ?? "").trim().toLowerCase();
  const match = PROPERTY_TYPES.find((type) => type.value === needle);
  return match ? match.value : (raw ?? "").trim();
}

/** Display text for a stored value; unknown values fall back to the value itself. */
export function propertyTypeLabel(raw: string | null | undefined): string {
  const value = toPropertyTypeValue(raw);
  const match = PROPERTY_TYPES.find((type) => type.value === value);
  if (match) return match.label;
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
}

/** Options for a select, keeping an unrecognised stored value visible. */
export function propertyTypeOptions(current: string | null | undefined): PropertyTypeOption[] {
  const value = toPropertyTypeValue(current);
  if (value && !PROPERTY_TYPES.some((type) => type.value === value)) {
    return [{ value, label: propertyTypeLabel(value) }, ...PROPERTY_TYPES];
  }
  return [...PROPERTY_TYPES];
}
