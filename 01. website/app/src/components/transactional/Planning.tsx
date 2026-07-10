import { useState } from "react";
import { Plus, Search, ChevronRight, Anchor, Pencil, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router";
import ActionModal from "../common/ActionModal";
import { useBargingDocuments, type BargingDocument } from "../../lib/bargingStore";

export default function Planning() {
  const navigate = useNavigate();
  const { documents, removeDocument } = useBargingDocuments();
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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

  const confirmDelete = () => {
    if (!deletePlan) return;
    removeDocument(deletePlan.id);
    setDeleteSuccess(deletePlan.id);
    setDeletePlan(null);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h1 className="text-base font-bold text-gray-900">Barging Process List</h1>
          <Link to="/transactional/operation/create" className="bg-[#5B5FC7] hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all">
            <Plus className="w-3.5 h-3.5 stroke-[3]" /> Create
          </Link>
        </div>

        <div className="px-4 pb-3 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by Doc ID or Barge name..."
              className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#5B5FC7] focus:border-[#5B5FC7]"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Date</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-2 py-1 border border-gray-300 rounded-lg text-xs" />
            <span>–</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-2 py-1 border border-gray-300 rounded-lg text-xs" />
          </div>
          <button
            onClick={() => { setSearch(""); setDateFrom(""); setDateTo(""); }}
            className="text-xs font-bold text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 whitespace-nowrap"
          >
            Clear Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200">
                <th className="px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Doc ID</th>
                <th className="px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Barge</th>
                <th className="px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Material</th>
                <th className="px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Target Tonnage</th>
                <th className="px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">ETA</th>
                <th className="px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">ATA</th>
                <th className="px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400 font-medium">
                    No barging documents found.
                  </td>
                </tr>
              ) : filteredPlans.map((plan) => {
                const canEdit = plan.status === "Planned";
                const canDelete = plan.status === "Planned" || plan.status === "Arrived";
                return (
                <tr key={plan.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs font-bold text-gray-900">{plan.id}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs font-bold text-[#5B5FC7] flex items-center gap-1"><Anchor className="w-3 h-3" /> {plan.barge}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">{plan.material || "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700 font-semibold">{plan.targetTonase.toLocaleString()} MT</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">{plan.eta ? plan.eta.replace("T", " ") : "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">{plan.ata ? plan.ata.replace("T", " ") : "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      plan.status === 'Departed' ? 'bg-emerald-100 text-emerald-800' :
                      plan.status === 'Closed' ? 'bg-sky-100 text-sky-800' :
                      plan.status === 'On Progress' ? 'bg-indigo-100 text-indigo-800' :
                      plan.status === 'Invalid' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {plan.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => canEdit && navigate(`/transactional/operation/${plan.id}/edit`)}
                        disabled={!canEdit}
                        title={canEdit ? "Edit document" : "Only editable while status is Planned"}
                        className="inline-flex items-center justify-center p-1.5 text-gray-500 border border-gray-300 hover:text-[#5B5FC7] hover:border-[#5B5FC7] rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => canDelete && setDeletePlan(plan)}
                        disabled={!canDelete}
                        title={canDelete ? "Delete document" : "Only deletable while status is Planned or Arrived"}
                        className="inline-flex items-center justify-center p-1.5 text-gray-500 border border-gray-300 hover:text-rose-600 hover:border-rose-400 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        to={`/transactional/operation/${plan.id}`}
                        className="inline-flex items-center justify-center px-2.5 py-1.5 text-xs font-bold text-gray-600 border border-gray-300 hover:text-[#5B5FC7] hover:border-[#5B5FC7] rounded-lg transition-colors"
                      >
                        View Detail <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>
      </div>

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
