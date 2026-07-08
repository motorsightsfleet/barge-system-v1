import SimpleMasterFormPage from "../common/SimpleMasterFormPage";
import { unitTypeApi } from "../../lib/unitTypeApi";

export default function UnitTypeForm() {
  return (
    <SimpleMasterFormPage
      entityLabel="Unit Type"
      breadcrumb={(isEdit) => [
        { label: "Master Data" },
        { label: "Population" },
        { label: "Unit Type", path: "/master/population/unit-type" },
        { label: isEdit ? "Update Unit Type" : "Create Unit Type" },
      ]}
      basePath="/master/population/unit-type"
      api={unitTypeApi}
      namePlaceholder="Enter Unit Type Name"
    />
  );
}
