import { Link, Navigate, useParams } from "react-router";
import SimpleMasterListPage from "../common/SimpleMasterListPage";
import { brandApi } from "../../lib/brandApi";
import { unitTypeApi } from "../../lib/unitTypeApi";
import { unitModelApi } from "../../lib/unitModelApi";

// Brand, Unit Type, and Unit Model are structurally identical (name + status) and were
// previously three separate sub-menu pages. They now share one page with a type tab,
// reducing Population's sub-menu from 7 to 5 entries without changing how each type behaves.
export const REFERENCE_DATA_TABS = [
  { type: "brand", label: "Brand", searchPlaceholder: "Search by Brand Name", api: brandApi },
  { type: "unit-type", label: "Unit Type", searchPlaceholder: "Search by Unit Type Name", api: unitTypeApi },
  { type: "unit-model", label: "Unit Model", searchPlaceholder: "Search by Unit Model Name", api: unitModelApi },
] as const;

export type ReferenceDataTabType = (typeof REFERENCE_DATA_TABS)[number]["type"];

export default function MasterReferenceData() {
  const { type } = useParams();
  const tab = REFERENCE_DATA_TABS.find((t) => t.type === type);

  if (!tab) {
    return <Navigate to={`/master/population/reference-data/${REFERENCE_DATA_TABS[0].type}`} replace />;
  }

  return (
    <div>
      <div className="max-w-[1600px] mx-auto px-8 pt-6">
        <div className="flex gap-1 border-b border-gray-200">
          {REFERENCE_DATA_TABS.map((t) => (
            <Link
              key={t.type}
              to={`/master/population/reference-data/${t.type}`}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                t.type === tab.type ? "border-[#5B5FC7] text-[#5B5FC7]" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      <SimpleMasterListPage
        key={tab.type}
        title={tab.label}
        subtitle={`Manage ${tab.label.toLowerCase()} data in a centralized system`}
        breadcrumb={[{ label: "Master Data" }, { label: "Population" }, { label: "Reference Data" }, { label: tab.label }]}
        basePath={`/master/population/reference-data/${tab.type}`}
        api={tab.api}
        searchPlaceholder={tab.searchPlaceholder}
      />
    </div>
  );
}
