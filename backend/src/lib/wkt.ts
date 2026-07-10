const COORD = String.raw`-?\d+(?:\.\d+)?\s+-?\d+(?:\.\d+)?`;
const POLYGON_PATTERN = new RegExp(`^POLYGON\\s*\\(\\(\\s*(${COORD})(\\s*,\\s*${COORD})*\\s*\\)\\)$`, "i");

export function isValidPolygonWkt(value: string): boolean {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!POLYGON_PATTERN.test(trimmed)) return false;

  const pointCount = (trimmed.match(/-?\d+(?:\.\d+)?\s+-?\d+(?:\.\d+)?/g) ?? []).length;
  return pointCount >= 3;
}
