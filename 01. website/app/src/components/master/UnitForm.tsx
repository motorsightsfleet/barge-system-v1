import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { unitApi, UNIT_STATUSES } from "../../lib/unitApi";
import { siteApi } from "../../lib/siteApi";
import type { Site } from "../../lib/areaTypes";
import { variantSpecificationApi, VariantSpecification } from "../../lib/variantSpecificationApi";
import { ApiError } from "../../lib/api";
import ActionModal, { ActionModalVariant } from "../common/ActionModal";
import { ArrowLeft } from "lucide-react";

interface FormState {
  unitCode: string;
  siteId: string;
  variantSpecificationId: string;
  unitStatus: string;
  serialNumber: string;
  arriveDate: string;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  unitCode: "",
  siteId: "",
  variantSpecificationId: "",
  unitStatus: "",
  serialNumber: "",
  arriveDate: "",
  isActive: true,
};

export default function UnitForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [sites, setSites] = useState<Site[]>([]);
  const [specs, setSpecs] = useState<VariantSpecification[]>([]);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);

  const [modal, setModal] = useState<ActionModalVariant | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  useEffect(() => {
    siteApi.list().then((res) => setSites(res.data));
    variantSpecificationApi.list({ pageSize: 100 }).then((res) => setSpecs(res.data));
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
        });
      })
      .catch((err) => setFormError(err instanceof ApiError ? err.message : "Failed to load unit"))
      .finally(() => setLoading(false));
  }, [id]);

  const selectedSpec = useMemo(
    () => specs.find((s) => s.id === form.variantSpecificationId) ?? null,
    [specs, form.variantSpecificationId]
  );

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

      {formError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-xl px-4 py-3">
          {formError}
        </div>
      )}

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
                  onChange={(e) => setForm({ ...form, variantSpecificationId: e.target.value })}
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
          <div>
            <h3 className="text-sm font-bold text-gray-700">Specification</h3>
            <p className="text-xs text-gray-500 mt-0.5">Inherited from the selected variant specification.</p>
          </div>

          {!selectedSpec ? (
            <div className="text-sm text-gray-400 italic">No variant specification selected yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <SpecReadOnlyField label="Engine" value={selectedSpec.engine.name} />
              <SpecReadOnlyField label="Capacity Vessel" value={String(selectedSpec.capacityVessel)} />
              <SpecReadOnlyField label="Axle Configuration" value={selectedSpec.axleConfiguration} />
              <SpecReadOnlyField label="Total Wheel" value={String(selectedSpec.totalWheel)} />
              <SpecReadOnlyField label="Wheel Size" value={String(selectedSpec.wheelSize)} />
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

function SpecReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <p className="text-sm font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
