import ComingSoonPage from "../common/ComingSoonPage";

export default function MasterUnit() {
  return (
    <ComingSoonPage
      title="Unit"
      breadcrumb={[{ label: "Master Data" }, { label: "Population" }, { label: "Unit" }]}
      backPath="/dashboard"
      note="The Unit list, create, and update flow (with auto-fill from Variant Specification) is coming in the next stage of this module."
    />
  );
}
