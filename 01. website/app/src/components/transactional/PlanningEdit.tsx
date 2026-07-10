import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import ActionModal from "../common/ActionModal";
import { useBargingDocuments } from "../../lib/bargingStore";

export default function PlanningEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { documents, updateDocument } = useBargingDocuments();
  const doc = documents.find(d => d.id === id);

  const [form, setForm] = useState({ eta: "", target: "", density: "" });
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  // initEditPage(): only editable while status is Planned, otherwise bounce to list.
  useEffect(() => {
    if (!doc || doc.status !== "Planned") {
      navigate("/transactional/operation", { replace: true });
      return;
    }
    setForm({ eta: doc.eta, target: String(doc.targetTonase), density: String(doc.materialDensity) });
  }, [doc?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!doc) return null;

  function saveEdit() {
    if (!form.eta) { setError("ETA wajib diisi."); return; }
    const target = parseFloat(form.target);
    if (!target || target <= 0) { setError("Target Tonnage harus lebih dari 0."); return; }
    const density = parseFloat(form.density);
    if (!density || density <= 0) { setError("Material Density harus lebih dari 0."); return; }
    setError("");
    setShowConfirm(true);
  }

  function confirmSaveEdit() {
    if (!doc) return;
    const target = parseFloat(form.target);
    const density = parseFloat(form.density);
    updateDocument(doc.id, { eta: form.eta, targetTonase: target, materialDensity: density });
    setShowConfirm(false);
    setSuccess(true);
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/transactional/operation" className="flex items-center gap-1.5 text-xs font-bold text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali
        </Link>
        <span className="text-xs text-gray-500">Transactional → Barging Process → Edit Barge Document</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <p className="text-xs text-gray-500 mb-4">Document ID: {doc.id}</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Barge</label>
            <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500">{doc.barge}</div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Material</label>
            <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500">{doc.material || "—"}</div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">ETA</label>
            <input
              type="datetime-local"
              value={form.eta}
              onChange={e => setForm(f => ({ ...f, eta: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7] focus:border-[#5B5FC7]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Target Tonnage</label>
            <input
              type="number"
              value={form.target}
              onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7] focus:border-[#5B5FC7]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Material Density</label>
            <input
              type="number"
              step="0.1"
              value={form.density}
              onChange={e => setForm(f => ({ ...f, density: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7] focus:border-[#5B5FC7]"
            />
          </div>
        </div>

        {error && <p className="text-sm font-semibold text-rose-600 mt-4">{error}</p>}

        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
          <Link to="/transactional/operation" className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors">
            Batal
          </Link>
          <button
            onClick={saveEdit}
            className="bg-[#5B5FC7] hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-500/20"
          >
            Save
          </button>
        </div>
      </div>

      {showConfirm && (
        <ActionModal
          variant="confirm"
          title="Simpan Perubahan?"
          message={`Perubahan pada dokumen "${doc.id}" akan disimpan.`}
          onConfirm={confirmSaveEdit}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {success && (
        <ActionModal
          variant="success"
          title="Berhasil Diperbarui"
          message={`Barge doc "${doc.id}" successfully updated.`}
          onClose={() => navigate("/transactional/operation")}
        />
      )}
    </div>
  );
}
