import { Link, useLocation } from "react-router";

// Brand, Unit Model, Engine, Unit Model Variant, and Variant Specification are all
// "configuration" data feeding the Unit registry, previously five separate sidebar
// entries. They now live under one shared tab bar (rendered at the top of each of
// their existing list pages) so the sidebar only needs one "Konfigurasi Unit" entry
// instead of four. Each tab still points at its own pre-existing route — nothing about
// how these pages fetch, filter, create, or edit data has changed.
const CONFIG_TABS = [
  { path: "/master/population/reference-data/brand", label: "Brand" },
  { path: "/master/population/reference-data/unit-model", label: "Unit Model" },
  { path: "/master/population/engine", label: "Engine" },
  { path: "/master/population/unit-model-variant", label: "Unit Model Variant" },
  { path: "/master/population/variant-specification", label: "Variant Specification" },
] as const;

export const POPULATION_CONFIG_PATHS = [
  "/master/population/reference-data",
  "/master/population/engine",
  "/master/population/unit-model-variant",
  "/master/population/variant-specification",
];

export default function PopulationConfigTabs() {
  const location = useLocation();

  return (
    <div className="max-w-[1600px] mx-auto px-8 pt-6">
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {CONFIG_TABS.map((tab) => {
          const active = location.pathname === tab.path || location.pathname.startsWith(`${tab.path}/`);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap transition-colors ${
                active ? "border-[#5B5FC7] text-[#5B5FC7]" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
