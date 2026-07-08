import SimpleMasterFormPage from "../common/SimpleMasterFormPage";
import { brandApi } from "../../lib/brandApi";

export default function BrandForm() {
  return (
    <SimpleMasterFormPage
      entityLabel="Brand"
      breadcrumb={(isEdit) => [
        { label: "Master Data" },
        { label: "Population" },
        { label: "Brand", path: "/master/population/brand" },
        { label: isEdit ? "Update Brand" : "Create Brand" },
      ]}
      basePath="/master/population/brand"
      api={brandApi}
      namePlaceholder="Enter Brand Name"
    />
  );
}
