import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { unitApi, UNIT_STATUSES } from "../../lib/unitApi";
import { siteApi } from "../../lib/siteApi";
import type { Site } from "../../lib/areaTypes";
import { variantSpecificationApi, VariantSpecification } from "../../lib/variantSpecificationApi";
import { engineApi, Engine } from "../../lib/engineApi";
import { ApiError } from "../../lib/api";
import ActionModal, { ActionModalVariant } from "../common/ActionModal";
import { ArrowLeft, PencilLine, RotateCcw, X } from "lucide-react";

interface FormState {
  unitCode: string;
  siteId: string;
  variantSpecificationId: string;
  unitStatus: string;
  serialNumber: string;
  arriveDate: string;
  isActive: boolean;
  // Per-field overrides. Empty string = not overridden (inherit from the selected variant specification).
  engineOverrideId: string;
  capacityVesselOverride: string;
  axleConfigurationOverride: string;
  totalWheelOverride: string;
  wheelSizeOverride: string;
}

const EMPTY_FORM: FormState = {
  unitCode: "",
  siteId: "",
  variantSpecificationId: "",
  unitStatus: "",
  serialNumber: "",
  arriveDate: "",
  isActive: true,
  engineOverrideId: "",
  capacityVesselOverride: "",
  axleConfigurationOverride: "",
  totalWheelOverride: "",
  wheelSizeOverride: "",
};

export default function UnitForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [sites, setSites] = useState<Site[]>([]);
  const [specs, setSpecs] = useState<VariantSpecification[]>([]);
  const [engines, setEngines] = useState<Engine[]>([]);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [specEditMode, setSpecEditMode] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);

  const [modal, setModal] = useState<ActionModalVariant | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  useEffect(() => {
    siteApi.list().then((res) => setSites(res.data));
    variantSpecificationApi.list({ pageSize: 100 }).then((res) => setSpecs(res.data));
    engineApi.list({ pageSize: 100 }).then((res) => setEngines(res.data));
  }, []);

  useEffect(() => {
    if (!id) return;
    unitApi
      .getOne(id)
      .then((res) => {
        const unit = res.data;
        setForm({
          unitCode: unit.unitCode,
          siteId: unit.siteId,
          variantSpecificationId: unit.variantSpecificationId,
          unitStatus: unit.unitStatus,
          serialNumber: unit.serialNumber,
          arriveDate: unit.arriveDate.slice(0, 10),
          isActive: unit.isActive,
          engineOverrideId: unit.engineOverrideId ?? "",
          capacityVesselOverride: unit.capacityVesselOverride !== null ? String(unit.capacityVesselOverride) : "",
          axleConfigurationOverride: unit.axleConfigurationOverride ?? "",
          totalWheelOverride: unit.totalWheelOverride !== null ? String(unit.totalWheelOverride) : "",
          wheelSizeOverride: unit.wheelSizeOverride !== null ? String(unit.wheelSizeOverride) : "",
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const selectedSpec = useMemo(
    () => specs.find((s) => s.id === form.variantSpecificationId) ?? null,
    [specs, form.variantSpecificationId]
  );

  const isOverridden = {
    engine: form.engineOverrideId !== "",
    capacityVessel: form.capacityVesselOverride !== "",
    axleConfiguration: form.axleConfigurationOverride !== "",
    totalWheel: form.totalWheelOverride !== "",
    wheelSize: form.wheelSizeOverride !== "",
  };

  const resolved = selectedSpec
    ? {
        engineName: form.engineOverrideId
          ? engines.find((e) => e.id === form.engineOverrideId)?.name ?? selectedSpec.engine.name
          : selectedSpec.engine.name,
        capacityVessel: isOverridden.capacityVessel ? form.capacityVesselOverride : String(selectedSpec.capacityVessel),
        axleConfiguration: isOverridden.axleConfiguration ? form.axleConfigurationOverride : selectedSpec.axleConfiguration,
        totalWheel: isOverridden.totalWheel ? form.totalWheelOverride : String(selectedSpec.totalWheel),
        wheelSize: isOverridden.wheelSize ? form.wheelSizeOverride : String(selectedSpec.wheelSize),
      }
    : null;

  function handleSpecChange(variantSpecificationId: string) {
    setForm((prev) => ({
      ...prev,
      variantSpecificationId,
      // A new specification invalidates any overrides tuned for the previous one.
      engineOverrideId: "",
      capacityVesselOverride: "",
      axleConfigurationOverride: "",
      totalWheelOverride: "",
      wheelSizeOverride: "",
    }));
    setSpecEditMode(false);
  }

  function handleOverrideChange(field: "capacityVesselOverride" | "axleConfigurationOverride" | "totalWheelOverride" | "wheelSizeOverride", rawValue: string, baseValue: string) {
    setForm((prev) => ({ ...prev, [field]: rawValue === baseValue ? "" : rawValue }));
  }

  function handleEngineOverrideChange(engineId: string) {
    setForm((prev) => ({
      ...prev,
      engineOverrideId: engineId === selectedSpec?.engineId ? "" : engineId,
    }));
  }

  function handleResetToDefault() {
    setForm((prev) => ({
      ...prev,
      engineOverrideId: "",
      capacityVesselOverride: "",
      axleConfigurationOverride: "",
      totalWheelOverride: "",
      wheelSizeOverride: "",
    }));
  }

  function handleSubmitClick(e: React.FormEvent) {
    e.preventDefault();
    setModal("confirm");
  }

  async function handleConfirmSubmit() {
    setSubmitting(true);
    setFieldErrors({});

    const payload = {
      unitCode: form.unitCode,
      siteId: form.siteId,
      variantSpecificationId: form.variantSpecificationId,
      unitStatus: form.unitStatus,
      serialNumber: form.serialNumber,
      arriveDate: form.arriveDate,
      isActive: form.isActive,
      engineOverrideId: form.engineOverrideId === "" ? null : form.engineOverrideId,
      capacityVesselOverride: form.capacityVesselOverride === "" ? null : Number(form.capacityVesselOverride),
      axleConfigurationOverride: form.axleConfigurationOverride === "" ? null : form.axleConfigurationOverride,
      totalWheelOverride: form.totalWheelOverride === "" ? null : Number(form.totalWheelOverride),
      wheelSizeOverride: form.wheelSizeOverride === "" ? null : Number(form.wheelSizeOverride),
    };

    try {
      if (isEdit && id) {
        await unitApi.update(id, payload);
        setResultMessage("Data Unit successfully updated");
      } else {
        await unitApi.create(payload);
        setResultMessage("Data Unit successfully created");
      }
      setModal("success");
    } catch (err) {
      if (err instanceof ApiError) {
        setResultMessage(err.message);
        if (err.errors) {
          const mapped: Record<string, string> = {};
          err.errors.forEach((e) => { mapped[e.field] = e.message; });
          setFieldErrors(mapped);
        }
      } else {
        setResultMessage("Please check and modify the following information before resubmit.");
      }
      setModal("failed");
    } finally {
      setSubmitting(false);
    }
  }

  function handleModalClose() {
    const wasSuccess = modal === "success";
    setModal(null);
    if (wasSuccess) navigate("/master/population/unit");
  }

  if (loading) {
    return <div className="p-8 max-w-[1600px] mx-auto text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/master/population/unit" className="flex items-center gap-1.5 text-xs font-bold text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali
        </Link>
        <span className="text-xs text-gray-500">Master Data → Population → Unit → {isEdit ? "Update Unit" : "Create Unit"}</span>
      </div>

      <form onSubmit={handleSubmitClick} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-8">
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-4">Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Unit Code<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.unitCode}
                  onChange={(e) => setForm({ ...form, unitCode: e.target.value })}
                  placeholder="e.g. MS-DT-001"
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                    fieldErrors.unitCode ? "border-rose-400" : "border-gray-300"
                  }`}
                />
                {fieldErrors.unitCode && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.unitCode}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Serial Number<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.serialNumber}
                  onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                  placeholder="Enter serial number"
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                    fieldErrors.serialNumber ? "border-rose-400" : "border-gray-300"
                  }`}
                />
                {fieldErrors.serialNumber && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.serialNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Site<span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.siteId}
                  onChange={(e) => setForm({ ...form, siteId: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                    fieldErrors.siteId ? "border-rose-400" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Site</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {fieldErrors.siteId && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.siteId}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Unit Status<span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.unitStatus}
                  onChange={(e) => setForm({ ...form, unitStatus: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                    fieldErrors.unitStatus ? "border-rose-400" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Unit Status</option>
                  {UNIT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {fieldErrors.unitStatus && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.unitStatus}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Variant Specification<span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.variantSpecificationId}
                  onChange={(e) => handleSpecChange(e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                    fieldErrors.variantSpecificationId ? "border-rose-400" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Variant Specification</option>
                  {specs.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
                {fieldErrors.variantSpecificationId && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.variantSpecificationId}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Arrive Date<span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.arriveDate}
                  onChange={(e) => setForm({ ...form, arriveDate: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                    fieldErrors.arriveDate ? "border-rose-400" : "border-gray-300"
                  }`}
                />
                {fieldErrors.arriveDate && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.arriveDate}</p>}
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between md:max-w-xs">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Status</p>
                  <p className="text-xs text-gray-500 mt-0.5">If inactive, this unit is considered decommissioned.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${form.isActive ? "bg-[#5B5FC7]" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      form.isActive ? "translate-x-[22px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-700">Specification</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {selectedSpec ? "Auto-filled from the selected variant specification. Override any field if this unit differs." : "Select a variant specification to see its details."}
              </p>
            </div>
            {selectedSpec && (
              specEditMode ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset to Default
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpecEditMode(false)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gray-500 hover:bg-gray-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Done
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSpecEditMode(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#5B5FC7] bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  <PencilLine className="w-3.5 h-3.5" />
                  Edit Specification
                </button>
              )
            )}
          </div>

          {!selectedSpec ? (
            <div className="text-sm text-gray-400 italic">No variant specification selected yet.</div>
          ) : !specEditMode ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <SpecReadOnlyField label="Engine" value={resolved!.engineName} overridden={isOverridden.engine} />
              <SpecReadOnlyField label="Capacity Vessel" value={resolved!.capacityVessel} overridden={isOverridden.capacityVessel} />
              <SpecReadOnlyField label="Axle Configuration" value={resolved!.axleConfiguration} overridden={isOverridden.axleConfiguration} />
              <SpecReadOnlyField label="Total Wheel" value={resolved!.totalWheel} overridden={isOverridden.totalWheel} />
              <SpecReadOnlyField label="Wheel Size" value={resolved!.wheelSize} overridden={isOverridden.wheelSize} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  Engine
                  {isOverridden.engine && <OverrideBadge />}
                </label>
                <select
                  value={form.engineOverrideId || selectedSpec.engineId}
                  onChange={(e) => handleEngineOverrideChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30"
                >
                  {engines.map((eng) => (
                    <option key={eng.id} value={eng.id}>{eng.name} ({eng.brand.name})</option>
                  ))}
                </select>
                {fieldErrors.engineOverrideId && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.engineOverrideId}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  Capacity Vessel
                  {isOverridden.capacityVessel && <OverrideBadge />}
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.capacityVesselOverride || String(selectedSpec.capacityVessel)}
                  onChange={(e) => handleOverrideChange("capacityVesselOverride", e.target.value, String(selectedSpec.capacityVessel))}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                    fieldErrors.capacityVesselOverride ? "border-rose-400" : "border-gray-300"
                  }`}
                />
                {fieldErrors.capacityVesselOverride && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.capacityVesselOverride}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  Axle Configuration
                  {isOverridden.axleConfiguration && <OverrideBadge />}
                </label>
                <input
                  type="text"
                  value={form.axleConfigurationOverride || selectedSpec.axleConfiguration}
                  onChange={(e) => handleOverrideChange("axleConfigurationOverride", e.target.value, selectedSpec.axleConfiguration)}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                    fieldErrors.axleConfigurationOverride ? "border-rose-400" : "border-gray-300"
                  }`}
                />
                {fieldErrors.axleConfigurationOverride && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.axleConfigurationOverride}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  Total Wheel
                  {isOverridden.totalWheel && <OverrideBadge />}
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.totalWheelOverride || String(selectedSpec.totalWheel)}
                  onChange={(e) => handleOverrideChange("totalWheelOverride", e.target.value, String(selectedSpec.totalWheel))}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                    fieldErrors.totalWheelOverride ? "border-rose-400" : "border-gray-300"
                  }`}
                />
                {fieldErrors.totalWheelOverride && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.totalWheelOverride}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  Wheel Size
                  {isOverridden.wheelSize && <OverrideBadge />}
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.wheelSizeOverride || String(selectedSpec.wheelSize)}
                  onChange={(e) => handleOverrideChange("wheelSizeOverride", e.target.value, String(selectedSpec.wheelSize))}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                    fieldErrors.wheelSizeOverride ? "border-rose-400" : "border-gray-300"
                  }`}
                />
                {fieldErrors.wheelSizeOverride && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.wheelSizeOverride}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Link
            to="/master/population/unit"
            className="px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#5B5FC7] hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors"
          >
            Save
          </button>
        </div>
      </form>

      {modal === "confirm" && (
        <ActionModal
          variant="confirm"
          title="Are you sure?"
          message={`Any data you want to ${isEdit ? "update" : "create"} this data?`}
          loading={submitting}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setModal(null)}
        />
      )}
      {modal === "success" && (
        <ActionModal variant="success" title={resultMessage} message="You'll be redirected to the unit list." onClose={handleModalClose} />
      )}
      {modal === "failed" && (
        <ActionModal
          variant="failed"
          title="Submission Failed"
          message={resultMessage || "Please check and modify the following information before resubmit."}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

function OverrideBadge() {
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">Custom</span>
  );
}

function SpecReadOnlyField({ label, value, overridden }: { label: string; value: string; overridden: boolean }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold text-gray-500">{label}</p>
        {overridden && <OverrideBadge />}
      </div>
      <p className="text-sm font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
