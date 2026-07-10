import { Navigate, useParams } from "react-router";
import SimpleMasterListPage from "../common/SimpleMasterListPage";
import PopulationConfigTabs from "./PopulationConfigTabs";
import { brandApi } from "../../lib/brandApi";
import { unitModelApi } from "../../lib/unitModelApi";

// Brand and Unit Model are structurally identical (name + status) and share one page
// with a type tab. Unit Type used to be a third tab here, but it only ever fed the
// Variant Specification form and wasn't used as a filter anywhere, so it's now created
// inline from that form (via CreatableSelect) instead of needing its own management page.
export const REFERENCE_DATA_TABS = [
  { type: "brand", label: "Brand", searchPlaceholder: "Search by Brand Name", api: brandApi },
  { type: "unit-model", label: "Unit Model", searchPlaceholder: "Search by Unit Model Name", api: unitModelApi },
] as const;

export default function MasterReferenceData() {
  const { type } = useParams();
  const tab = REFERENCE_DATA_TABS.find((t) => t.type === type);

  if (!tab) {
    return <Navigate to={`/master/population/reference-data/${REFERENCE_DATA_TABS[0].type}`} replace />;
  }

  return (
    <div>
      <PopulationConfigTabs />

      <SimpleMasterListPage
        key={tab.type}
        title={tab.label}
        breadcrumb={[{ label: "Master Data" }, { label: "Population" }, { label: "Konfigurasi Unit", path: "/master/population/reference-data" }, { label: tab.label }]}
        basePath={`/master/population/reference-data/${tab.type}`}
        api={tab.api}
        searchPlaceholder={tab.searchPlaceholder}
      />
    </div>
  );
}
