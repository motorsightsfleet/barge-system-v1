import SimpleMasterListPage from "../common/SimpleMasterListPage";
import { unitModelApi } from "../../lib/unitModelApi";

export default function MasterUnitModel() {
  return (
    <SimpleMasterListPage
      title="Unit Model"
      subtitle="Manage unit model data in a centralized system"
      breadcrumb={[{ label: "Master Data" }, { label: "Population" }, { label: "Unit Model" }]}
      basePath="/master/population/unit-model"
      api={unitModelApi}
      searchPlaceholder="Search by Unit Model Name"
    />
  );
}
