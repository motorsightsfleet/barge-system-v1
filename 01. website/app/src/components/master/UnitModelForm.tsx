import SimpleMasterFormPage from "../common/SimpleMasterFormPage";
import { unitModelApi } from "../../lib/unitModelApi";

export default function UnitModelForm() {
  return (
    <SimpleMasterFormPage
      entityLabel="Unit Model"
      breadcrumb={(isEdit) => [
        { label: "Master Data" },
        { label: "Population" },
        { label: "Unit Model", path: "/master/population/unit-model" },
        { label: isEdit ? "Update Unit Model" : "Create Unit Model" },
      ]}
      basePath="/master/population/unit-model"
      api={unitModelApi}
      namePlaceholder="Enter Unit Model Name"
    />
  );
}
