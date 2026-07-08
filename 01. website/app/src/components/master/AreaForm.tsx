import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { areaApi, AREA_CATEGORIES, Site } from "../../lib/areaApi";
import { siteApi } from "../../lib/siteApi";
import { ApiError } from "../../lib/api";
import ActionModal, { ActionModalVariant } from "../common/ActionModal";
import PolygonMap from "../common/PolygonMap";

interface FormState {
  areaName: string;
  siteId: string;
  category: string;
  polygonCoordinates: string;
  isActive: boolean;
}

const EMPTY_FORM: FormState = { areaName: "", siteId: "", category: "", polygonCoordinates: "", isActive: true };

export default function AreaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [sites, setSites] = useState<Site[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);

  const [modal, setModal] = useState<ActionModalVariant | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  useEffect(() => {
    siteApi.list().then((res) => setSites(res.data));
  }, []);

  useEffect(() => {
    if (!id) return;
    areaApi
      .getOne(id)
      .then((res) => {
        setForm({
          areaName: res.data.areaName,
          siteId: res.data.siteId,
          category: res.data.category,
          polygonCoordinates: res.data.polygonCoordinates,
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
      areaName: form.areaName,
      siteId: form.siteId,
      category: form.category,
      polygonCoordinates: form.polygonCoordinates,
      isActive: form.isActive,
    };

    try {
      if (isEdit && id) {
        await areaApi.update(id, payload);
        setResultMessage("Area successfully updated");
      } else {
        await areaApi.create(payload);
        setResultMessage("Area successfully created");
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
    if (wasSuccess) navigate("/master/area");
  }

  if (loading) {
    return <div className="p-8 max-w-[1600px] mx-auto text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="text-sm text-gray-500">
        Master Data <span className="mx-1">&gt;</span>{" "}
        <Link to="/master/area" className="hover:text-[#5B5FC7]">Area</Link>{" "}
        <span className="mx-1">&gt;</span>{" "}
        <span className="text-[#5B5FC7] font-semibold">{isEdit ? "Update Area" : "Create Area"}</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">{isEdit ? "Update Area" : "Create Area"}</h1>

      <form onSubmit={handleSubmitClick} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Area Name<span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.areaName}
              onChange={(e) => setForm({ ...form, areaName: e.target.value })}
              placeholder="Enter Area Name"
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                fieldErrors.areaName ? "border-rose-400" : "border-gray-300"
              }`}
            />
            {fieldErrors.areaName && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.areaName}</p>}
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
              Category<span className="text-rose-500">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                fieldErrors.category ? "border-rose-400" : "border-gray-300"
              }`}
            >
              <option value="">Select Category</option>
              {AREA_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {fieldErrors.category && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.category}</p>}
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Status</p>
              <p className="text-xs text-gray-500 mt-0.5">If inactive, this Area cannot be assigned or used.</p>
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

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Polygon Coordinates<span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={form.polygonCoordinates}
            onChange={(e) => setForm({ ...form, polygonCoordinates: e.target.value })}
            placeholder="Enter Polygon Coordinate(WKT), e.g. POLYGON((116.4500 -3.1200, 116.4521 -3.1192, 116.4548 -3.1195, ...))"
            className={`w-full px-4 py-3 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 resize-none ${
              fieldErrors.polygonCoordinates ? "border-rose-400" : "border-gray-300"
            }`}
          />
          {fieldErrors.polygonCoordinates && (
            <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.polygonCoordinates}</p>
          )}

          <div className="mt-4">
            <PolygonMap wkt={form.polygonCoordinates} height={300} />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            to="/master/area"
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
        <ActionModal variant="success" title={resultMessage} message="You'll be redirected to the area list." onClose={handleModalClose} />
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
