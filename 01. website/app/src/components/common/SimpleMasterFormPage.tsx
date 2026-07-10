import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import type { SimpleMasterEntity } from "../../lib/simpleMasterTypes";
import { ApiError } from "../../lib/api";
import ActionModal, { ActionModalVariant } from "./ActionModal";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface SimpleMasterApi {
  getOne: (id: string) => Promise<{ data: SimpleMasterEntity }>;
  create: (input: { name: string; isActive?: boolean }) => Promise<{ data: SimpleMasterEntity }>;
  update: (id: string, input: { name: string; isActive?: boolean }) => Promise<{ data: SimpleMasterEntity }>;
}

interface SimpleMasterFormPageProps {
  entityLabel: string;
  breadcrumb: (isEdit: boolean) => BreadcrumbItem[];
  basePath: string;
  api: SimpleMasterApi;
  namePlaceholder: string;
}

export default function SimpleMasterFormPage({ entityLabel, breadcrumb, basePath, api, namePlaceholder }: SimpleMasterFormPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);

  const [modal, setModal] = useState<ActionModalVariant | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    api
      .getOne(id)
      .then((res) => {
        setName(res.data.name);
        setIsActive(res.data.isActive);
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

    try {
      if (isEdit && id) {
        await api.update(id, { name, isActive });
        setResultMessage(`Data ${entityLabel} '${name}' successfully updated`);
      } else {
        await api.create({ name, isActive });
        setResultMessage(`Data ${entityLabel} '${name}' successfully created`);
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
    if (wasSuccess) navigate(basePath);
  }

  if (loading) {
    return <div className="p-8 max-w-[1600px] mx-auto text-sm text-gray-500">Loading...</div>;
  }

  const crumbs = breadcrumb(isEdit);

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to={basePath} className="flex items-center gap-1.5 text-xs font-bold text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali
        </Link>
        <span className="text-xs text-gray-500">{crumbs.map((item) => item.label).join(" → ")}</span>
      </div>

      <form onSubmit={handleSubmitClick} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {entityLabel} Name<span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={namePlaceholder}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 ${
                fieldErrors.name ? "border-rose-400" : "border-gray-300"
              }`}
            />
            {fieldErrors.name && <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.name}</p>}
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Status</p>
              <p className="text-xs text-gray-500 mt-0.5">If inactive, this {entityLabel.toLowerCase()} cannot be assigned or used.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${isActive ? "bg-[#5B5FC7]" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isActive ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-10">
          <Link
            to={basePath}
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
        <ActionModal variant="success" title={resultMessage} message={`You'll be redirected to the ${entityLabel.toLowerCase()} list.`} onClose={handleModalClose} />
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
