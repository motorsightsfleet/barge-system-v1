import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Plus,
  Download,
  Search,
  ChevronsUpDown,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { bargeApi, Barge, BargeStatus, BARGE_TYPES, Pagination } from "../../lib/bargeApi";
import { ApiError } from "../../lib/api";
import { buildPageList } from "../../lib/pagination";
import ActionModal from "../common/ActionModal";

const SORTABLE_COLUMNS: { key: string; label: string }[] = [
  { key: "code", label: "Barge Code" },
  { key: "name", label: "Barge Name" },
  { key: "owner", label: "Barge Owner" },
  { key: "capacityMt", label: "Capacity" },
];

function StatusBadge({ status }: { status: BargeStatus }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
        status === "AVAILABLE" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"
      }`}
    >
      {status === "AVAILABLE" ? "Available" : "Unavailable"}
    </span>
  );
}

export default function MasterBarge() {
  const [barges, setBarges] = useState<Barge[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<BargeStatus | "">("");
  const [type, setType] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [goToInput, setGoToInput] = useState("");

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Barge | null>(null);
  const [deleteModal, setDeleteModal] = useState<"confirm" | "success" | "failed" | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => {
      setQuery(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  async function fetchBarges() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await bargeApi.list({ query, status, type, page, pageSize, sortBy, sortDir });
      setBarges(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Failed to load barges");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBarges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status, type, page, pageSize, sortBy, sortDir]);

  function toggleSort(key: string) {
    if (sortBy === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function handleReset() {
    setSearchInput("");
    setQuery("");
    setStatus("");
    setType("");
    setPage(1);
  }

  function handleDeleteClick(barge: Barge) {
    setDeleteTarget(barge);
    setDeleteModal("confirm");
    setOpenMenuId(null);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await bargeApi.remove(deleteTarget.id);
      setDeleteModal("success");
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Failed to delete barge");
      setDeleteModal("failed");
    } finally {
      setDeleting(false);
    }
  }

  function handleModalClose() {
    const wasSuccess = deleteModal === "success";
    setDeleteModal(null);
    setDeleteTarget(null);
    if (wasSuccess) fetchBarges();
  }

  const from = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const to = Math.min(pagination.page * pagination.pageSize, pagination.total);

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6" onClick={() => setOpenMenuId(null)}>
      <div className="text-sm text-gray-500">
        Master Data <span className="mx-1">&gt;</span> <span className="text-[#5B5FC7] font-semibold">Barge</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-base font-bold text-gray-900">Barge</h1>
          <div className="flex gap-2">
            <a
              href={bargeApi.exportUrl()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 border border-gray-300 bg-white rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </a>
            <Link
              to="/master/barge/create"
              className="flex items-center gap-1.5 bg-[#5B5FC7] hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Create
            </Link>
          </div>
        </div>

        <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by Barge Code, Barge Name, and Barge Owner"
              className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 focus:border-[#5B5FC7]"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as BargeStatus | ""); setPage(1); }}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 focus:border-[#5B5FC7]"
          >
            <option value="">Select Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="UNAVAILABLE">Unavailable</option>
          </select>
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 focus:border-[#5B5FC7]"
          >
            <option value="">Select Type</option>
            {BARGE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button
            onClick={handleReset}
            className="text-xs font-bold text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 whitespace-nowrap"
          >
            Reset
          </button>
        </div>

        {errorMsg && (
          <div className="mx-4 mt-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-xl px-4 py-3">
            {errorMsg}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#5B5FC7] text-white">
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">No</th>
                {SORTABLE_COLUMNS.map((col) => (
                  <th key={col.key} className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">
                    <button onClick={() => toggleSort(col.key)} className="flex items-center gap-1.5 hover:opacity-80">
                      {col.label}
                      <ChevronsUpDown className="w-3.5 h-3.5" />
                    </button>
                  </th>
                ))}
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Type</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-500">Loading...</td></tr>
              ) : barges.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-500">No barges found.</td></tr>
              ) : (
                barges.map((barge, idx) => (
                  <tr key={barge.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-gray-500">{from + idx}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">{barge.code}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">{barge.name}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{barge.owner}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{barge.capacityMt.toLocaleString("id-ID")} MT</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{barge.type}</td>
                    <td className="px-5 py-3.5 text-sm"><StatusBadge status={barge.status} /></td>
                    <td className="px-5 py-3.5 text-right relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === barge.id ? null : barge.id); }}
                        className="p-1.5 rounded-lg bg-[#5B5FC7] text-white hover:bg-indigo-700 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === barge.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-5 top-11 z-10 w-36 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                        >
                          <Link
                            to={`/master/barge/${barge.id}/edit`}
                            className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(barge)}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>{from}-{to} of {pagination.total} items</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none"
            >
              <option value={10}>10/page</option>
              <option value={20}>20/page</option>
              <option value={50}>50/page</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {buildPageList(pagination.page, pagination.totalPages).map((p, idx) =>
              p === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-sm text-gray-400">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                    p === pagination.page ? "bg-[#5B5FC7] text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const target = Number(goToInput);
                if (target >= 1 && target <= pagination.totalPages) setPage(target);
                setGoToInput("");
              }}
              className="flex items-center gap-2 ml-3"
            >
              <span className="text-sm text-gray-500">Go to</span>
              <input
                type="number"
                min={1}
                max={pagination.totalPages}
                value={goToInput}
                onChange={(e) => setGoToInput(e.target.value)}
                className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30"
              />
            </form>
          </div>
        </div>
      </div>

      {deleteModal === "confirm" && (
        <ActionModal
          variant="confirm"
          title="Are you sure?"
          message="Any data you want to delete this data?"
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={handleModalClose}
        />
      )}
      {deleteModal === "success" && (
        <ActionModal
          variant="success"
          title="Data Barge successfully deleted"
          message="This item has been removed."
          onClose={handleModalClose}
        />
      )}
      {deleteModal === "failed" && (
        <ActionModal
          variant="failed"
          title="Delete failed"
          message={deleteError || "Please check and modify the data you entered before resubmitting."}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
