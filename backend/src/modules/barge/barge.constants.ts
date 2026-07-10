export const BARGE_CODE_PREFIX = "MS-BS-";

export const BARGE_TYPES = ["Nickel Carrier", "Coal Carrier"] as const;

export const BARGE_STATUSES = ["AVAILABLE", "UNAVAILABLE"] as const;

export const BARGE_SORTABLE_FIELDS = [
  "code",
  "name",
  "owner",
  "capacityMt",
  "type",
  "status",
  "createdAt",
] as const;
