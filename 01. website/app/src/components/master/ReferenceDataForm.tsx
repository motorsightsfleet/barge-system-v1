import { Navigate, useParams } from "react-router";
import SimpleMasterFormPage from "../common/SimpleMasterFormPage";
import { REFERENCE_DATA_TABS } from "./MasterReferenceData";

export default function ReferenceDataForm() {
  const { type } = useParams();
  const tab = REFERENCE_DATA_TABS.find((t) => t.type === type);

  if (!tab) {
    return <Navigate to={`/master/population/reference-data/${REFERENCE_DATA_TABS[0].type}`} replace />;
  }

  return (
    <SimpleMasterFormPage
      key={tab.type}
      entityLabel={tab.label}
      breadcrumb={(isEdit) => [
        { label: "Master Data" },
        { label: "Population" },
        { label: "Reference Data" },
        { label: tab.label, path: `/master/population/reference-data/${tab.type}` },
        { label: isEdit ? `Update ${tab.label}` : `Create ${tab.label}` },
      ]}
      basePath={`/master/population/reference-data/${tab.type}`}
      api={tab.api}
      namePlaceholder={`Enter ${tab.label} Name`}
    />
  );
}
