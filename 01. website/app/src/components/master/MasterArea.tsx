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
import { areaApi, Area, Site, Pagination } from "../../lib/areaApi";
import { siteApi } from "../../lib/siteApi";
import { ApiError } from "../../lib/api";
import { buildPageList } from "../../lib/pagination";
import ActionModal from "../common/ActionModal";

const SORTABLE_COLUMNS: { key: string; label: string }[] = [
  { key: "areaName", label: "Area Name" },
  { key: "site", label: "Site" },
];

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

export default function MasterArea() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "">("");
  const [siteId, setSiteId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [goToInput, setGoToInput] = useState("");

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Area | null>(null);
  const [deleteModal, setDeleteModal] = useState<"confirm" | "success" | "failed" | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    siteApi.list().then((res) => setSites(res.data));
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      setQuery(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  async function fetchAreas() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await areaApi.list({ query, status, siteId, page, pageSize, sortBy, sortDir });
      setAreas(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Failed to load areas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAreas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status, siteId, page, pageSize, sortBy, sortDir]);

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
    setSiteId("");
    setPage(1);
  }

  function handleDeleteClick(area: Area) {
    setDeleteTarget(area);
    setDeleteModal("confirm");
    setOpenMenuId(null);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await areaApi.remove(deleteTarget.id);
      setDeleteModal("success");
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Failed to delete area");
      setDeleteModal("failed");
    } finally {
      setDeleting(false);
    }
  }

  function handleModalClose() {
    const wasSuccess = deleteModal === "success";
    setDeleteModal(null);
    setDeleteTarget(null);
    if (wasSuccess) fetchAreas();
  }

  const from = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const to = Math.min(pagination.page * pagination.pageSize, pagination.total);

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6" onClick={() => setOpenMenuId(null)}>
      <div className="text-sm text-gray-500">
        Master Data <span className="mx-1">&gt;</span> <span className="text-[#5B5FC7] font-semibold">Area</span>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Area</h1>
          <p className="text-sm text-gray-500 mt-1">Manage area data in a centralized system</p>
        </div>
        <div className="flex gap-3">
          <a
            href={areaApi.exportUrl()}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 bg-white rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </a>
          <Link
            to="/master/area/create"
            className="flex items-center gap-2 bg-[#5B5FC7] hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            Create
          </Link>
        </div>
      </div>

      {/* Filter Data */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
        <h3 className="text-sm font-bold text-gray-700">Filter Data</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as "active" | "inactive" | ""); setPage(1); }}
            className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 focus:border-[#5B5FC7]"
          >
            <option value="">Select Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by Area Name"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 focus:border-[#5B5FC7]"
            />
          </div>

          <select
            value={siteId}
            onChange={(e) => { setSiteId(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/30 focus:border-[#5B5FC7]"
          >
            <option value="">Select Site</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-xl px-4 py-3">
          {errorMsg}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
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
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-500">Loading...</td></tr>
              ) : areas.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-500">No areas found.</td></tr>
              ) : (
                areas.map((area, idx) => (
                  <tr key={area.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-gray-500">{from + idx}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">{area.areaName}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{area.site.name}</td>
                    <td className="px-5 py-3.5 text-sm"><StatusBadge isActive={area.isActive} /></td>
                    <td className="px-5 py-3.5 text-right relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === area.id ? null : area.id); }}
                        className="p-1.5 rounded-lg bg-[#5B5FC7] text-white hover:bg-indigo-700 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === area.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-5 top-11 z-10 w-40 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                        >
                          <Link to={`/master/area/${area.id}`} className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            View Detail
                          </Link>
                          <Link to={`/master/area/${area.id}/edit`} className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(area)}
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
          title="Area successfully deleted"
          message={`"${deleteTarget?.areaName}" has been removed.`}
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
