import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Polygon, useMap } from "react-leaflet";
import L from "leaflet";
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

// Draws a plain graph-paper grid as genuine Leaflet tiles (canvas-generated, no network
// request) instead of real satellite/street imagery. Used wherever the app can't reach
// an external tile server — e.g. this component's own demo/Artifact build, which runs
// under a CSP that blocks all cross-origin requests, or a deployment on a site with no
// internet access. Because it's a real L.GridLayer, it still pans/zooms correctly with
// the map, unlike a static CSS background.
const NoBasemapGridLayer = L.GridLayer.extend({
  createTile(this: L.GridLayer) {
    const tile = document.createElement("canvas");
    const size = this.getTileSize();
    tile.width = size.x;
    tile.height = size.y;
    const ctx = tile.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#eef1f8";
      ctx.fillRect(0, 0, size.x, size.y);
      ctx.strokeStyle = "#dbe1f0";
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, size.x - 1, size.y - 1);
    }
    return tile;
  },
});

function NoBasemapGrid() {
  const map = useMap();
  useEffect(() => {
    // @types/leaflet models Class.extend()'s return type loosely (it's a dynamic JS
    // mixin pattern), so its constructor signature doesn't type-check precisely here.
    const GridLayerCtor = NoBasemapGridLayer as unknown as new (options?: L.GridLayerOptions) => L.GridLayer;
    const layer = new GridLayerCtor({ tileSize: 128 });
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map]);
  return null;
}

function LocationSearch() {
  const map = useMap();
  const [term, setTerm] = useState("");
  const [searching, setSearching] = useState(false);

  async function handleSearch() {
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

  // A plain <div>, not <form> — PolygonMap renders inside AreaForm's own <form>, and
  // nested <form> elements are invalid HTML: the browser silently drops the inner one,
  // so pressing Enter here would otherwise submit the outer Area form instead of
  // searching. Enter-to-search is handled manually via onKeyDown instead.
  return (
    <div className="absolute top-2 left-2 z-[1000] flex items-center gap-1.5 bg-white rounded-lg shadow-md px-2 py-1.5">
      <Search className="w-3.5 h-3.5 text-gray-400" />
      <input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSearch();
          }
        }}
        placeholder="Search location..."
        className="text-xs outline-none w-36"
      />
      {searching && <span className="text-[10px] text-gray-400">...</span>}
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
  const latLngs: LatLngExpression[] = points.map(([lng, lat]) => [lat, lng]);

  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-gray-200 relative">
      <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        {USE_MOCK ? (
          <NoBasemapGrid />
        ) : (
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        )}
        <InvalidateSizeOnMount />
        {valid && (
          <>
            <Polygon positions={latLngs} pathOptions={{ color: "#5B5FC7", fillColor: "#5B5FC7", fillOpacity: 0.3 }} />
            <FitBounds points={points} />
          </>
        )}
        {!USE_MOCK && <LocationSearch />}
      </MapContainer>
      {USE_MOCK && (
        <span className="absolute bottom-2 right-2 z-[1000] text-[10px] font-semibold text-gray-400 bg-white/70 px-1.5 py-0.5 rounded pointer-events-none">
          No basemap in demo mode
        </span>
      )}
    </div>
  );
}
