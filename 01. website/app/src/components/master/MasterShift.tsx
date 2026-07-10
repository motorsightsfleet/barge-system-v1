import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Plus,
  Download,
  Search,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { shiftApi, Shift, Pagination } from "../../lib/shiftApi";
import { ApiError } from "../../lib/api";
import { buildPageList } from "../../lib/pagination";
import RowActionMenu from "../common/RowActionMenu";
import ActionModal from "../common/ActionModal";

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
        isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

export default function MasterShift() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "">("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [goToInput, setGoToInput] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Shift | null>(null);
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

  async function fetchShifts() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await shiftApi.list({ query, status, page, pageSize, sortBy, sortDir });
      setShifts(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Failed to load shifts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchShifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status, page, pageSize, sortBy, sortDir]);

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
    setPage(1);
  }

  function handleDeleteClick(shift: Shift) {
    setDeleteTarget(shift);
    setDeleteModal("confirm");
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await shiftApi.remove(deleteTarget.id);
      setDeleteModal("success");
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Failed to delete shift");
      setDeleteModal("failed");
    } finally {
      setDeleting(false);
    }
  }

  function handleModalClose() {
    const wasSuccess = deleteModal === "success";
    setDeleteModal(null);
    setDeleteTarget(null);
    if (wasSuccess) fetchShifts();
  }

  const from = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const to = Math.min(pagination.page * pagination.pageSize, pagination.total);

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="text-sm text-gray-500">
        Master Data <span className="mx-1">&gt;</span> <span className="text-[#5B5FC7] font-semibold">Shift</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-base font-bold text-gray-900">Shift</h1>
          <div className="flex gap-2">
            <a
              href={shiftApi.exportUrl()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 border border-gray-300 bg-white rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </a>
            <Link
              to="/master/shift/create"
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
              placeholder="Search by Shift Name"
              className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 focus:border-[#5B5FC7]"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as "active" | "inactive" | ""); setPage(1); }}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 focus:border-[#5B5FC7]"
          >
            <option value="">Select Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">
                  <button onClick={() => toggleSort("shiftName")} className="flex items-center gap-1.5 hover:opacity-80">
                    Shift Name
                    <ChevronsUpDown className="w-3.5 h-3.5" />
                  </button>
                </th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Shift Start</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Shift End</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-500">Loading...</td></tr>
              ) : shifts.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-500">No shifts found.</td></tr>
              ) : (
                shifts.map((shift, idx) => (
                  <tr key={shift.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-gray-500">{from + idx}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">{shift.shiftName}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" />{shift.shiftStart}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" />{shift.shiftEnd}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm"><StatusBadge isActive={shift.isActive} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <RowActionMenu>
                        <Link to={`/master/shift/${shift.id}/edit`} className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(shift)}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </RowActionMenu>
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
          title="Data Shift successfully deleted"
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
