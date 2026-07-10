import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { areaApi, Area } from "../../lib/areaApi";
import PolygonMap from "../common/PolygonMap";

export default function AreaDetail() {
  const { id } = useParams();
  const [area, setArea] = useState<Area | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullWkt, setShowFullWkt] = useState(false);

  useEffect(() => {
    if (!id) return;
    areaApi.getOne(id).then((res) => setArea(res.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-8 max-w-[1600px] mx-auto text-sm text-gray-500">Loading...</div>;
  }

  if (!area) {
    return <div className="p-8 max-w-[1600px] mx-auto text-sm text-gray-500">Area not found.</div>;
  }

  const wktTruncated = area.polygonCoordinates.length > 120 && !showFullWkt;

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="text-sm text-gray-500">
        <Link to="/master/area" className="hover:text-[#5B5FC7]">Area</Link>{" "}
        <span className="mx-1">&gt;</span> <span className="text-[#5B5FC7] font-semibold">Detail</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
        <span className="text-sm font-bold text-gray-900">{area.areaName}</span>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${area.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${area.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
          {area.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-4">Information Area</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Area Name</p>
              <p className="text-sm font-bold text-gray-900">{area.areaName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Site</p>
              <p className="text-sm font-bold text-gray-900">{area.site.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Category</p>
              <p className="text-sm font-bold text-gray-900">{area.category}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1">Polygon Coordinates</p>
          <p className="text-sm text-gray-600 font-mono break-words">
            {wktTruncated ? `${area.polygonCoordinates.slice(0, 120)}...` : area.polygonCoordinates}{" "}
            {area.polygonCoordinates.length > 120 && (
              <button
                onClick={() => setShowFullWkt(!showFullWkt)}
                className="text-[#5B5FC7] font-semibold hover:underline"
              >
                {showFullWkt ? "Show less" : "Read more"}
              </button>
            )}
          </p>
        </div>

        <PolygonMap wkt={area.polygonCoordinates} height={320} />
      </div>

      <div className="flex justify-center">
        <Link
          to="/master/area"
          className="px-8 py-2.5 bg-[#5B5FC7] hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors"
        >
          Close
        </Link>
      </div>
    </div>
  );
}
