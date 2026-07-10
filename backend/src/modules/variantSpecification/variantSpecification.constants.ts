export const VARIANT_SPEC_SORTABLE_FIELDS = ["capacityVessel", "totalWheel", "wheelSize", "createdAt"] as const;

export function buildVariantSpecLabel(parts: {
  unitTypeName: string;
  unitModelName: string;
  unitModelVariantName: string;
  engineName: string;
  axleConfiguration: string;
}): string {
  return [parts.unitTypeName, parts.unitModelName, parts.unitModelVariantName, parts.engineName, parts.axleConfiguration].join(
    " | "
  );
}
