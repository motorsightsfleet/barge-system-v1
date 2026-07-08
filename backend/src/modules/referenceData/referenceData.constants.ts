export const REFERENCE_DATA_TYPES = ["brand", "unit-type", "unit-model"] as const;

export type ReferenceDataType = (typeof REFERENCE_DATA_TYPES)[number];

export function isReferenceDataType(value: string): value is ReferenceDataType {
  return (REFERENCE_DATA_TYPES as readonly string[]).includes(value);
}
