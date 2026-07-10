import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { unitModelVariantApi, UnitModelRef } from "../../lib/unitModelVariantApi";
import { unitModelApi } from "../../lib/unitModelApi";
import { ApiError } from "../../lib/api";
import ActionModal, { ActionModalVariant } from "../common/ActionModal";

interface FormState {
  name: string;
  unitModelId: string;
  isActive: boolean;
}

const EMPTY_FORM: FormState = { name: "", unitModelId: "", isActive: true };

export default function UnitModelVariantForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [unitModels, setUnitModels] = useState<UnitModelRef[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);

  const [modal, setModal] = useState<ActionModalVariant | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  useEffect(() => {
    unitModelApi.list({ pageSize: 100 }).then((res) => setUnitModels(res.data as unknown as UnitModelRef[]));
  }, []);

  useEffect(() => {
    if (!id) return;
    unitModelVariantApi
      .getOne(id)
      .then((res) => {
        setForm({ name: res.data.name, unitModelId: res.data.unitModelId, isActive: res.data.isActive });
      })
      .finally(() => setLoading(false));
  }, [id]);

  function handleSubmitClick(e: React.FormEvent) {
    e.preventDefault();
    setModal("confirm");
  }

  async function handleConfirmSubmit() {
    setSubmitting(true);
    setFieldErrors({});

    const payload = { name: form.name, unitModelId: form.unitModelId, isActive: form.isActive };

    try {
      if (isEdit && id) {
        await unitModelVariantApi.update(id, payload);
        setResultMessage(`Data Unit Model Variant '${form.name}' successfully updated`);
      } else {
        await unitModelVariantApi.create(payload);
        setResultMessage(`Data Unit Model Variant '${form.name}' successfully created`);
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
    if (wasSuccess) navigate("/master/population/unit-model-variant");
  }

  if (loading) {
    return <div className="p-8 max-w-[1600px] mx-auto text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/master/population/unit-model-variant" className="flex items-center gap-1.5 text-xs font-bold text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali
        </Link>
        <span className="text-xs text-gray-500">Master Data → Population → Unit Model Variant → {isEdit ? "Update Unit Model Variant" : "Create Unit Model Variant"}</span>
      </div>

      <form onSubmit={handleSubmitClick} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Variant Name<span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter Variant Name (e.g. 8x4)"
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                fieldErrors.name ? "border-rose-400" : "border-gray-300"
              }`}
            />
            {fieldErrors.name && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Unit Model<span className="text-rose-500">*</span>
            </label>
            <select
              value={form.unitModelId}
              onChange={(e) => setForm({ ...form, unitModelId: e.target.value })}
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

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between md:col-span-2 md:max-w-xs">
            <div>
              <p className="text-sm font-semibold text-gray-800">Status</p>
              <p className="text-xs text-gray-500 mt-0.5">If inactive, this variant cannot be assigned or used.</p>
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

        <div className="flex justify-end gap-3 mt-10">
          <Link
            to="/master/population/unit-model-variant"
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
        <ActionModal variant="success" title={resultMessage} message="You'll be redirected to the unit model variant list." onClose={handleModalClose} />
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
