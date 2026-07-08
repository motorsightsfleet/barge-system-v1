import SimpleMasterListPage from "../common/SimpleMasterListPage";
import { brandApi } from "../../lib/brandApi";

export default function MasterBrand() {
  return (
    <SimpleMasterListPage
      title="Brand"
      subtitle="Manage brand data in a centralized system"
      breadcrumb={[{ label: "Master Data" }, { label: "Population" }, { label: "Brand" }]}
      basePath="/master/population/brand"
      api={brandApi}
      searchPlaceholder="Search by Brand Name"
    />
  );
}
