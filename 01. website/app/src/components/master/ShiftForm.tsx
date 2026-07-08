import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { shiftApi } from "../../lib/shiftApi";
import { ApiError } from "../../lib/api";
import ActionModal, { ActionModalVariant } from "../common/ActionModal";

interface FormState {
  shiftName: string;
  shiftStart: string;
  shiftEnd: string;
  isActive: boolean;
}

const EMPTY_FORM: FormState = { shiftName: "", shiftStart: "", shiftEnd: "", isActive: true };

export default function ShiftForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);

  const [modal, setModal] = useState<ActionModalVariant | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    shiftApi
      .getOne(id)
      .then((res) => {
        setForm({
          shiftName: res.data.shiftName,
          shiftStart: res.data.shiftStart,
          shiftEnd: res.data.shiftEnd,
          isActive: res.data.isActive,
        });
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

    const payload = {
      shiftName: form.shiftName,
      shiftStart: form.shiftStart,
      shiftEnd: form.shiftEnd,
      isActive: form.isActive,
    };

    try {
      if (isEdit && id) {
        await shiftApi.update(id, payload);
        setResultMessage("Shift successfully updated");
      } else {
        await shiftApi.create(payload);
        setResultMessage("Shift successfully created");
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
        setResultMessage("Please check and modify the data you entered before resubmitting.");
      }
      setModal("failed");
    } finally {
      setSubmitting(false);
    }
  }

  function handleModalClose() {
    const wasSuccess = modal === "success";
    setModal(null);
    if (wasSuccess) navigate("/master/shift");
  }

  if (loading) {
    return <div className="p-8 max-w-[1600px] mx-auto text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="text-sm text-gray-500">
        Master Data <span className="mx-1">&gt;</span>{" "}
        <Link to="/master/shift" className="hover:text-[#5B5FC7]">Shift</Link>{" "}
        <span className="mx-1">&gt;</span>{" "}
        <span className="text-[#5B5FC7] font-semibold">{isEdit ? "Update Shift" : "Create Shift"}</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">{isEdit ? "Update Shift" : "Create Shift"}</h1>

      <form onSubmit={handleSubmitClick} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Shift Name<span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.shiftName}
              onChange={(e) => setForm({ ...form, shiftName: e.target.value })}
              placeholder="Enter Shift Name"
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                fieldErrors.shiftName ? "border-rose-400" : "border-gray-300"
              }`}
            />
            {fieldErrors.shiftName && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.shiftName}</p>}
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Status</p>
              <p className="text-xs text-gray-500 mt-0.5">If inactive, this Shift cannot be assigned or used.</p>
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

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Shift Start<span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              value={form.shiftStart}
              onChange={(e) => setForm({ ...form, shiftStart: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                fieldErrors.shiftStart ? "border-rose-400" : "border-gray-300"
              }`}
            />
            {fieldErrors.shiftStart && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.shiftStart}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Shift End<span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              value={form.shiftEnd}
              onChange={(e) => setForm({ ...form, shiftEnd: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                fieldErrors.shiftEnd ? "border-rose-400" : "border-gray-300"
              }`}
            />
            {fieldErrors.shiftEnd && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.shiftEnd}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-10">
          <Link
            to="/master/shift"
            className="px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#5B5FC7] hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors"
          >
            Submit
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
        <ActionModal variant="success" title={resultMessage} message="You'll be redirected to the shift list." onClose={handleModalClose} />
      )}
      {modal === "failed" && (
        <ActionModal
          variant="failed"
          title={`${isEdit ? "Update" : "Create"} failed`}
          message={resultMessage || "Please check and modify the data you entered before resubmitting."}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
