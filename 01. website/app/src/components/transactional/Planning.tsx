import { useState } from "react";
import { Plus, Search, Calendar, ChevronRight, Anchor, MapPin, Target, Pencil, Trash2, X } from "lucide-react";
import { Link } from "react-router";
import ActionModal from "../common/ActionModal";
import { useBargingDocuments, type BargingDocument } from "../../lib/bargingStore";

export default function Planning() {
  const { documents, updateDocument, removeDocument } = useBargingDocuments();
  const [search, setSearch] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [editPlan, setEditPlan] = useState<BargingDocument | null>(null);
  const [editForm, setEditForm] = useState({ eta: "", target: "", density: "" });
  const [editError, setEditError] = useState("");
  const [editConfirm, setEditConfirm] = useState(false);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  const [deletePlan, setDeletePlan] = useState<BargingDocument | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  const filteredPlans = documents.filter((p) => {
    const keyword = search.trim().toLowerCase();
    if (keyword && !p.id.toLowerCase().includes(keyword) && !p.barge.toLowerCase().includes(keyword)) {
      return false;
    }
    if (dateFrom && p.createdDate < dateFrom) return false;
    if (dateTo && p.createdDate > dateTo) return false;
    return true;
  });

  const openEdit = (plan: BargingDocument) => {
    setEditPlan(plan);
    setEditForm({ eta: plan.eta, target: String(plan.targetTonase), density: String(plan.materialDensity) });
    setEditError("");
  };

  const submitEdit = () => {
    if (!editForm.eta) { setEditError("ETA wajib diisi."); return; }
    const target = parseFloat(editForm.target);
    if (!target || target <= 0) { setEditError("Target Tonnage harus lebih dari 0."); return; }
    const density = parseFloat(editForm.density);
    if (!density || density <= 0) { setEditError("Material Density harus lebih dari 0."); return; }
    setEditError("");
    setEditConfirm(true);
  };

  const confirmEdit = () => {
    if (!editPlan) return;
    const target = parseFloat(editForm.target);
    const density = parseFloat(editForm.density);
    updateDocument(editPlan.id, { eta: editForm.eta, targetTonase: target, materialDensity: density });
    setEditConfirm(false);
    setEditSuccess(editPlan.id);
    setEditPlan(null);
  };

  const confirmDelete = () => {
    if (!deletePlan) return;
    removeDocument(deletePlan.id);
    setDeleteSuccess(deletePlan.id);
    setDeletePlan(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Barging Process List</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track all ongoing barging operations
          </p>
        </div>
        <Link to="/transactional/operation/create" className="bg-[#5B5FC7] hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-indigo-500/20">
          <Plus className="w-4 h-4 stroke-[3]" />
          Create New Document
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 relative">
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by ID or Barge name..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5B5FC7] focus:border-[#5B5FC7] shadow-sm transition-all"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowDateFilter(v => !v)}
              className={`flex items-center gap-2 text-sm font-semibold border px-4 py-2.5 rounded-xl transition-colors shadow-sm bg-white ${
                dateFrom || dateTo ? "text-[#5B5FC7] border-[#5B5FC7]" : "text-gray-600 border-gray-300 hover:bg-gray-100"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Filter Date
            </button>
            {showDateFilter && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-gray-200 shadow-lg p-4 z-20 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">From</label>
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">To</label>
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]" />
                </div>
                <div className="flex justify-between pt-1">
                  <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-xs font-bold text-gray-500 hover:text-gray-700">Clear</button>
                  <button onClick={() => setShowDateFilter(false)} className="text-xs font-bold text-[#5B5FC7] hover:text-indigo-700">Apply</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Document ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vessels</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Target</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-400 font-medium">
                    No barging documents found.
                  </td>
                </tr>
              ) : filteredPlans.map((plan) => {
                const canEdit = plan.status === "Planned";
                const canDelete = plan.status === "Planned" || plan.status === "Arrived";
                return (
                <tr key={plan.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md">{plan.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-600">{plan.createdDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" /> {plan.area}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-[#5B5FC7] flex items-center gap-1.5"><Anchor className="w-3.5 h-3.5" /> {plan.barge}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-gray-400" /> {plan.targetTonase.toLocaleString()} MT</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                      plan.status === 'Departed' ? 'bg-emerald-100 text-emerald-800' :
                      plan.status === 'Closed' ? 'bg-sky-100 text-sky-800' :
                      plan.status === 'On Progress' ? 'bg-indigo-100 text-indigo-800' :
                      plan.status === 'Invalid' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {plan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => canEdit && openEdit(plan)}
                        disabled={!canEdit}
                        title={canEdit ? "Edit document" : "Only editable while status is Planned"}
                        className="inline-flex items-center justify-center p-2 text-gray-500 bg-white border border-gray-300 hover:text-[#5B5FC7] hover:border-[#5B5FC7] hover:bg-indigo-50 rounded-lg transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => canDelete && setDeletePlan(plan)}
                        disabled={!canDelete}
                        title={canDelete ? "Delete document" : "Only deletable while status is Planned or Arrived"}
                        className="inline-flex items-center justify-center p-2 text-gray-500 bg-white border border-gray-300 hover:text-rose-600 hover:border-rose-400 hover:bg-rose-50 rounded-lg transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/transactional/operation/${plan.id}`}
                        className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-bold text-gray-600 bg-white border border-gray-300 hover:text-[#5B5FC7] hover:border-[#5B5FC7] hover:bg-indigo-50 rounded-lg transition-all shadow-sm group-hover:shadow group-hover:-translate-y-0.5"
                      >
                        View Detail <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>
      </div>

      {editPlan && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Edit Document</h3>
                <p className="text-xs text-gray-500 mt-0.5">Document ID: {editPlan.id}</p>
              </div>
              <button onClick={() => setEditPlan(null)} className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 p-1.5 rounded-lg transition-colors border border-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Barge</label>
                  <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500">{editPlan.barge}</div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Area</label>
                  <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500">{editPlan.area}</div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">ETA <span className="text-red-500">*</span></label>
                <input
                  type="datetime-local"
                  value={editForm.eta}
                  onChange={e => setEditForm(f => ({ ...f, eta: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7] focus:border-[#5B5FC7] shadow-sm font-medium text-gray-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Target Tonnage <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={editForm.target}
                    onChange={e => setEditForm(f => ({ ...f, target: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7] focus:border-[#5B5FC7] shadow-sm font-medium text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Material Density <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.density}
                    onChange={e => setEditForm(f => ({ ...f, density: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7] focus:border-[#5B5FC7] shadow-sm font-medium text-gray-900"
                  />
                </div>
              </div>
              {editError && <p className="text-sm font-semibold text-rose-600">{editError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditPlan(null)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitEdit}
                  className="bg-[#5B5FC7] hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-500/20"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editConfirm && (
        <ActionModal
          variant="confirm"
          title="Simpan Perubahan?"
          message={`Perubahan pada dokumen "${editPlan?.id}" akan disimpan.`}
          onConfirm={confirmEdit}
          onCancel={() => setEditConfirm(false)}
        />
      )}

      {editSuccess && (
        <ActionModal
          variant="success"
          title="Berhasil Diperbarui"
          message={`Barge doc "${editSuccess}" successfully updated.`}
          onClose={() => setEditSuccess(null)}
        />
      )}

      {deletePlan && (
        <ActionModal
          variant="confirm"
          title="Hapus Dokumen?"
          message={`Dokumen: ${deletePlan.id} — Barge: ${deletePlan.barge} — Status: ${deletePlan.status}`}
          onConfirm={confirmDelete}
          onCancel={() => setDeletePlan(null)}
        />
      )}

      {deleteSuccess && (
        <ActionModal
          variant="success"
          title="Berhasil Dihapus"
          message={`Barge doc "${deleteSuccess}" successfully deleted.`}
          onClose={() => setDeleteSuccess(null)}
        />
      )}
    </div>
  );
}
