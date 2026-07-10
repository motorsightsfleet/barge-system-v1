import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { bargeApi, BARGE_TYPES, BargeStatus } from "../../lib/bargeApi";
import { ApiError } from "../../lib/api";
import ActionModal, { ActionModalVariant } from "../common/ActionModal";

interface FormState {
  code: string;
  name: string;
  owner: string;
  capacityMt: string;
  type: string;
  status: BargeStatus;
}

const EMPTY_FORM: FormState = { code: "", name: "", owner: "", capacityMt: "", type: "", status: "AVAILABLE" };

export default function BargeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);

  const [modal, setModal] = useState<ActionModalVariant | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    bargeApi
      .getOne(id)
      .then((res) => {
        setForm({
          code: res.data.code,
          name: res.data.name,
          owner: res.data.owner,
          capacityMt: String(res.data.capacityMt),
          type: res.data.type,
          status: res.data.status,
        });
      })
      .catch((err) => setFormError(err instanceof ApiError ? err.message : "Failed to load barge"))
      .finally(() => setLoading(false));
  }, [id]);

  function handleSubmitClick(e: React.FormEvent) {
    e.preventDefault();
    setModal("confirm");
  }

  async function handleConfirmSubmit() {
    setSubmitting(true);
    setFieldErrors({});
    setFormError(null);

    const payload = {
      name: form.name,
      owner: form.owner,
      capacityMt: Number(form.capacityMt),
      type: form.type,
      status: form.status,
    };

    try {
      if (isEdit && id) {
        await bargeApi.update(id, payload);
        setResultMessage("Data Barge successfully updated");
      } else {
        await bargeApi.create(payload);
        setResultMessage("Data Barge successfully created");
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
    if (wasSuccess) navigate("/master/barge");
  }

  if (loading) {
    return <div className="p-8 max-w-[1600px] mx-auto text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="text-sm text-gray-500">
        Master Data <span className="mx-1">&gt;</span>{" "}
        <Link to="/master/barge" className="hover:text-[#5B5FC7]">Barge</Link>{" "}
        <span className="mx-1">&gt;</span>{" "}
        <span className="text-[#5B5FC7] font-semibold">{isEdit ? "Update Barge" : "Create Barge"}</span>
      </div>

      {formError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-xl px-4 py-3">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmitClick} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Barge Code</label>
            <input
              type="text"
              disabled
              value={form.code}
              placeholder="Auto-generated"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Barge Name<span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter barge name"
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                fieldErrors.name ? "border-rose-400" : "border-gray-300"
              }`}
            />
            {fieldErrors.name && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Barge Owner<span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.owner}
              onChange={(e) => setForm({ ...form, owner: e.target.value })}
              placeholder="Enter Barge owner name"
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                fieldErrors.owner ? "border-rose-400" : "border-gray-300"
              }`}
            />
            {fieldErrors.owner && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.owner}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Capacity<span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                value={form.capacityMt}
                onChange={(e) => setForm({ ...form, capacityMt: e.target.value })}
                placeholder="Enter barge capacity"
                className={`w-full px-4 py-2.5 pr-12 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                  fieldErrors.capacityMt ? "border-rose-400" : "border-gray-300"
                }`}
              />
              <span className="absolute right-4 top-2.5 text-xs font-bold text-gray-400">MT</span>
            </div>
            {fieldErrors.capacityMt && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.capacityMt}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Type<span className="text-rose-500">*</span>
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                fieldErrors.type ? "border-rose-400" : "border-gray-300"
              }`}
            >
              <option value="">Select Barge Type</option>
              {BARGE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {fieldErrors.type && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.type}</p>}
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Status</p>
              <p className="text-xs text-gray-500 mt-0.5">If inactive, this Barge cannot be assigned or used.</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, status: form.status === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE" })}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                form.status === "AVAILABLE" ? "bg-[#5B5FC7]" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  form.status === "AVAILABLE" ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-10">
          <Link
            to="/master/barge"
            className="px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-[#5B5FC7] hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-colors"
          >
            {submitting ? "Saving..." : "Save"}
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
        <ActionModal variant="success" title={resultMessage} message="You'll be redirected to the barge list." onClose={handleModalClose} />
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
