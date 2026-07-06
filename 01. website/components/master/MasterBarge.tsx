import { Plus, Search, Edit2, Trash2, Ship, Package } from "lucide-react";

const mockBarges = [
  { id: "BG-001", name: "SEA TITAN", capacity: 5000, remark: "Ready Operation", status: "Active" },
  { id: "BG-002", name: "RIVER KING", capacity: 3500, remark: "In Transit", status: "Active" },
  { id: "BG-003", name: "OCEAN BLUE", capacity: 4000, remark: "Maintenance required", status: "Inactive" },
];

export default function MasterBarge() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Master Barge</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Manage barge fleet portfolio and capacity specifications
          </p>
        </div>
        <button className="bg-[#5B5FC7] hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Add New Barge
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search barge code or name..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/20 focus:border-[#5B5FC7] transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Barge Code</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Barge Name</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Capacity (MT)</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Remark</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {mockBarges.map((barge) => (
                <tr key={barge.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-[13px] font-bold text-gray-900 bg-gray-100 px-2.5 py-1.5 rounded-lg border border-gray-200 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-colors">
                      {barge.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-[#5B5FC7] flex items-center justify-center">
                        <Ship className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-gray-900">{barge.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-[13px] font-bold text-gray-700">{barge.capacity.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">{barge.remark}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                      barge.status === 'Active' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/50' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {barge.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-[#5B5FC7] hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="text-sm font-semibold text-gray-500">Showing <span className="text-gray-900">1</span> to <span className="text-gray-900">{mockBarges.length}</span> of <span className="text-gray-900">{mockBarges.length}</span> entries</div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 transition-colors shadow-sm">Previous</button>
            <button className="px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 transition-colors shadow-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}