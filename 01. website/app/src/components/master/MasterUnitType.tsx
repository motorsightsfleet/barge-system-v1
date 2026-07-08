import SimpleMasterListPage from "../common/SimpleMasterListPage";
import { unitTypeApi } from "../../lib/unitTypeApi";

export default function MasterUnitType() {
  return (
    <SimpleMasterListPage
      title="Unit Type"
      subtitle="Manage unit type data in a centralized system"
      breadcrumb={[{ label: "Master Data" }, { label: "Population" }, { label: "Unit Type" }]}
      basePath="/master/population/unit-type"
      api={unitTypeApi}
      searchPlaceholder="Search by Unit Type Name"
    />
  );
}
