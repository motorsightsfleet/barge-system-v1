const COORD = String.raw`-?\d+(?:\.\d+)?\s+-?\d+(?:\.\d+)?`;
const POLYGON_PATTERN = new RegExp(`^POLYGON\\s*\\(\\(\\s*(${COORD})(\\s*,\\s*${COORD})*\\s*\\)\\)$`, "i");

export function isValidPolygonWkt(value: string): boolean {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!POLYGON_PATTERN.test(trimmed)) return false;
  const pointCount = (trimmed.match(/-?\d+(?:\.\d+)?\s+-?\d+(?:\.\d+)?/g) ?? []).length;
  return pointCount >= 3;
}

export function parsePolygonPoints(value: string): [number, number][] {
  const inner = value.trim().replace(/^POLYGON\s*\(\(/i, "").replace(/\)\)$/, "");
  return inner
    .split(",")
    .map((pair) => pair.trim().split(/\s+/).map(Number))
    .filter((p) => p.length === 2 && p.every((n) => !Number.isNaN(n))) as [number, number][];
}

// Inverse of parsePolygonPoints — closes the ring (repeats the first point at the end)
// to match the convention used by this app's seed/example WKT data.
export function pointsToWkt(points: [number, number][]): string {
  const ring = points.length > 0 && points[0].join(" ") !== points[points.length - 1].join(" ") ? [...points, points[0]] : points;
  return `POLYGON((${ring.map(([lng, lat]) => `${lng.toFixed(6)} ${lat.toFixed(6)}`).join(", ")}))`;
}
