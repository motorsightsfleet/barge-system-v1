import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { variantSpecificationApi } from "../../lib/variantSpecificationApi";
import { unitTypeApi } from "../../lib/unitTypeApi";
import { unitModelApi } from "../../lib/unitModelApi";
import { unitModelVariantApi, UnitModelVariant } from "../../lib/unitModelVariantApi";
import { engineApi, Engine } from "../../lib/engineApi";
import { ApiError } from "../../lib/api";
import ActionModal, { ActionModalVariant } from "../common/ActionModal";

interface RefOption {
  id: string;
  name: string;
}

interface FormState {
  unitTypeId: string;
  unitModelId: string;
  unitModelVariantId: string;
  engineId: string;
  capacityVessel: string;
  axleConfiguration: string;
  totalWheel: string;
  wheelSize: string;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  unitTypeId: "",
  unitModelId: "",
  unitModelVariantId: "",
  engineId: "",
  capacityVessel: "",
  axleConfiguration: "",
  totalWheel: "",
  wheelSize: "",
  isActive: true,
};

export default function VariantSpecificationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [unitTypes, setUnitTypes] = useState<RefOption[]>([]);
  const [unitModels, setUnitModels] = useState<RefOption[]>([]);
  const [allVariants, setAllVariants] = useState<UnitModelVariant[]>([]);
  const [engines, setEngines] = useState<Engine[]>([]);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);

  const [modal, setModal] = useState<ActionModalVariant | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  useEffect(() => {
    unitTypeApi.list({ pageSize: 100 }).then((res) => setUnitTypes(res.data as unknown as RefOption[]));
    unitModelApi.list({ pageSize: 100 }).then((res) => setUnitModels(res.data as unknown as RefOption[]));
    unitModelVariantApi.list({ pageSize: 100 }).then((res) => setAllVariants(res.data));
    engineApi.list({ pageSize: 100 }).then((res) => setEngines(res.data));
  }, []);

  useEffect(() => {
    if (!id) return;
    variantSpecificationApi
      .getOne(id)
      .then((res) => {
        const spec = res.data;
        setForm({
          unitTypeId: spec.unitTypeId,
          unitModelId: spec.unitModelId,
          unitModelVariantId: spec.unitModelVariantId,
          engineId: spec.engineId,
          capacityVessel: String(spec.capacityVessel),
          axleConfiguration: spec.axleConfiguration,
          totalWheel: String(spec.totalWheel),
          wheelSize: String(spec.wheelSize),
          isActive: spec.isActive,
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Cascading: only show variants that belong to the selected unit model.
  const availableVariants = useMemo(
    () => allVariants.filter((v) => v.unitModelId === form.unitModelId),
    [allVariants, form.unitModelId]
  );

  function handleUnitModelChange(unitModelId: string) {
    setForm((prev) => ({
      ...prev,
      unitModelId,
      // Reset the variant selection if it no longer belongs to the newly selected model.
      unitModelVariantId: allVariants.find((v) => v.id === prev.unitModelVariantId)?.unitModelId === unitModelId ? prev.unitModelVariantId : "",
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
      unitTypeId: form.unitTypeId,
      unitModelId: form.unitModelId,
      unitModelVariantId: form.unitModelVariantId,
      engineId: form.engineId,
      capacityVessel: form.capacityVessel === "" ? undefined : Number(form.capacityVessel),
      axleConfiguration: form.axleConfiguration,
      totalWheel: form.totalWheel === "" ? undefined : Number(form.totalWheel),
      wheelSize: form.wheelSize === "" ? undefined : Number(form.wheelSize),
      isActive: form.isActive,
    };

    try {
      if (isEdit && id) {
        await variantSpecificationApi.update(id, payload);
        setResultMessage("Data Variant Specification successfully updated");
      } else {
        await variantSpecificationApi.create(payload);
        setResultMessage("Data Variant Specification successfully created");
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
    if (wasSuccess) navigate("/master/population/variant-specification");
  }

  if (loading) {
    return <div className="p-8 max-w-[1600px] mx-auto text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="text-sm text-gray-500">
        Master Data <span className="mx-1">&gt;</span> Population <span className="mx-1">&gt;</span>{" "}
        <Link to="/master/population/variant-specification" className="hover:text-[#5B5FC7]">Variant Specification</Link>{" "}
        <span className="mx-1">&gt;</span>{" "}
        <span className="text-[#5B5FC7] font-semibold">{isEdit ? "Update Variant Specification" : "Create Variant Specification"}</span>
      </div>

      <form onSubmit={handleSubmitClick} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-8">
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-4">Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Unit Type<span className="text-rose-500">*</span>
              </label>
              <select
                value={form.unitTypeId}
                onChange={(e) => setForm({ ...form, unitTypeId: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                  fieldErrors.unitTypeId ? "border-rose-400" : "border-gray-300"
                }`}
              >
                <option value="">Select Unit Type</option>
                {unitTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              {fieldErrors.unitTypeId && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.unitTypeId}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Engine<span className="text-rose-500">*</span>
              </label>
              <select
                value={form.engineId}
                onChange={(e) => setForm({ ...form, engineId: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                  fieldErrors.engineId ? "border-rose-400" : "border-gray-300"
                }`}
              >
                <option value="">Select Engine</option>
                {engines.map((e) => (
                  <option key={e.id} value={e.id}>{e.name} ({e.brand.name})</option>
                ))}
              </select>
              {fieldErrors.engineId && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.engineId}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Unit Model<span className="text-rose-500">*</span>
              </label>
              <select
                value={form.unitModelId}
                onChange={(e) => handleUnitModelChange(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                  fieldErrors.unitModelId ? "border-rose-400" : "border-gray-300"
                }`}
              >
                <option value="">Select Unit Model</option>
                {unitModels.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              {fieldErrors.unitModelId && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.unitModelId}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Unit Model Variant<span className="text-rose-500">*</span>
              </label>
              <select
                value={form.unitModelVariantId}
                onChange={(e) => setForm({ ...form, unitModelVariantId: e.target.value })}
                disabled={!form.unitModelId}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 disabled:bg-gray-50 disabled:text-gray-400 ${
                  fieldErrors.unitModelVariantId ? "border-rose-400" : "border-gray-300"
                }`}
              >
                <option value="">{form.unitModelId ? "Select Unit Model Variant" : "Select a Unit Model first"}</option>
                {availableVariants.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              {fieldErrors.unitModelVariantId && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.unitModelVariantId}</p>}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-4">Specification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Capacity Vessel<span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                value={form.capacityVessel}
                onChange={(e) => setForm({ ...form, capacityVessel: e.target.value })}
                placeholder="Enter capacity vessel"
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                  fieldErrors.capacityVessel ? "border-rose-400" : "border-gray-300"
                }`}
              />
              {fieldErrors.capacityVessel && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.capacityVessel}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Axle Configuration<span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.axleConfiguration}
                onChange={(e) => setForm({ ...form, axleConfiguration: e.target.value })}
                placeholder="e.g. 8x4"
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                  fieldErrors.axleConfiguration ? "border-rose-400" : "border-gray-300"
                }`}
              />
              {fieldErrors.axleConfiguration && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.axleConfiguration}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Total Wheel<span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                value={form.totalWheel}
                onChange={(e) => setForm({ ...form, totalWheel: e.target.value })}
                placeholder="Enter total wheel"
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                  fieldErrors.totalWheel ? "border-rose-400" : "border-gray-300"
                }`}
              />
              {fieldErrors.totalWheel && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.totalWheel}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Wheel Size<span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                value={form.wheelSize}
                onChange={(e) => setForm({ ...form, wheelSize: e.target.value })}
                placeholder="Enter wheel size"
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                  fieldErrors.wheelSize ? "border-rose-400" : "border-gray-300"
                }`}
              />
              {fieldErrors.wheelSize && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.wheelSize}</p>}
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between md:max-w-xs">
              <div>
                <p className="text-sm font-semibold text-gray-800">Status</p>
                <p className="text-xs text-gray-500 mt-0.5">If inactive, this specification cannot be assigned or used.</p>
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

        <div className="flex justify-end gap-3">
          <Link
            to="/master/population/variant-specification"
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
        <ActionModal variant="success" title={resultMessage} message="You'll be redirected to the variant specification list." onClose={handleModalClose} />
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
