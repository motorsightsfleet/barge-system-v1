import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Polygon, useMap } from "react-leaflet";
import type { LatLngExpression, LatLngBoundsExpression } from "leaflet";
import { Search } from "lucide-react";
import { parsePolygonPoints } from "../../lib/wkt";

const USE_MOCK = import.meta.env.VITE_MOCK_API === "true";

function InvalidateSizeOnMount() {
  const map = useMap();
  useEffect(() => {
    // Guards against Leaflet's classic "gray tiles" bug when the map mounts
    // inside a container whose final size isn't settled yet (e.g. a form layout).
    const timer = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length >= 3) {
      const bounds: LatLngBoundsExpression = points.map(([lng, lat]) => [lat, lng]);
      map.fitBounds(bounds, { padding: [24, 24] });
    }
  }, [points, map]);
  return null;
}

function LocationSearch() {
  const map = useMap();
  const [term, setTerm] = useState("");
  const [searching, setSearching] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!term.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(term)}`
      );
      const results = await res.json();
      if (results[0]) {
        map.flyTo([Number(results[0].lat), Number(results[0].lon)], 14);
      }
    } catch {
      // best-effort search; ignore failures
    } finally {
      setSearching(false);
    }
  }

  return (
    <form
      onSubmit={handleSearch}
      className="absolute top-2 left-2 z-[1000] flex items-center gap-1.5 bg-white rounded-lg shadow-md px-2 py-1.5"
    >
      <Search className="w-3.5 h-3.5 text-gray-400" />
      <input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search location..."
        className="text-xs outline-none w-36"
      />
      {searching && <span className="text-[10px] text-gray-400">...</span>}
    </form>
  );
}

function StaticPolygonPreview({ points, height }: { points: [number, number][]; height: number }) {
  if (points.length < 3) {
    return (
      <div
        style={{ height }}
        className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-sm text-gray-400 text-center px-4"
      >
        Enter valid polygon coordinates to preview
      </div>
    );
  }

  const lngs = points.map((p) => p[0]);
  const lats = points.map((p) => p[1]);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const padX = (maxLng - minLng) * 0.15 || 0.001;
  const padY = (maxLat - minLat) * 0.15 || 0.001;

  const W = 400;
  const H = height;
  function project([lng, lat]: [number, number]) {
    const x = ((lng - (minLng - padX)) / (maxLng + padX - (minLng - padX))) * W;
    const y = H - ((lat - (minLat - padY)) / (maxLat + padY - (minLat - padY))) * H;
    return [x, y];
  }
  const polygonPoints = points.map((p) => project(p).join(",")).join(" ");

  return (
    <div style={{ height }} className="rounded-xl border border-gray-200 bg-[#eef1f8] overflow-hidden relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
        <defs>
          <pattern id="polygon-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#dbe1f0" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#polygon-grid)" />
        <polygon points={polygonPoints} fill="#5B5FC7" fillOpacity="0.35" stroke="#5B5FC7" strokeWidth="2" />
      </svg>
      <span className="absolute bottom-2 right-2 text-[10px] font-semibold text-gray-400 bg-white/70 px-1.5 py-0.5 rounded">
        Preview (no basemap in demo mode)
      </span>
    </div>
  );
}

// Default view when no valid polygon has been entered yet — centered on the
// mining/barging sites used across this app's seed data (Sulawesi coastal area).
const DEFAULT_CENTER: LatLngExpression = [-3.13, 116.46];
const DEFAULT_ZOOM = 9;

interface PolygonMapProps {
  wkt: string;
  height?: number;
}

export default function PolygonMap({ wkt, height = 260 }: PolygonMapProps) {
  const points = useMemo(() => parsePolygonPoints(wkt), [wkt]);
  const valid = points.length >= 3;

  if (USE_MOCK) {
    return <StaticPolygonPreview points={valid ? points : []} height={height} />;
  }

  const latLngs: LatLngExpression[] = points.map(([lng, lat]) => [lat, lng]);

  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-gray-200 relative">
      <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <InvalidateSizeOnMount />
        {valid && (
          <>
            <Polygon positions={latLngs} pathOptions={{ color: "#5B5FC7", fillColor: "#5B5FC7", fillOpacity: 0.3 }} />
            <FitBounds points={points} />
          </>
        )}
        <LocationSearch />
      </MapContainer>
    </div>
  );
}
