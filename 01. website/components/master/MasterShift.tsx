import { Plus, Search, Edit2, Trash2, Clock, Sun, Moon } from "lucide-react";

const mockShifts = [
  { id: "SHF-A", name: "Shift A", startTime: "07:00", endTime: "19:00", remark: "Day Shift", status: "Active" },
  { id: "SHF-B", name: "Shift B", startTime: "19:00", endTime: "07:00", remark: "Night Shift", status: "Active" },
];

export default function MasterShift() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Master Shift</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Manage operational team shifts, rosters, and working hours
          </p>
        </div>
        <button className="bg-[#5B5FC7] hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Add New Shift
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
              placeholder="Search shift code or name..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/20 focus:border-[#5B5FC7] transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Shift Details</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Working Hours</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Remark</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {mockShifts.map((shift) => (
                <tr key={shift.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${shift.name.includes('Shift A') ? 'bg-amber-100 text-amber-500' : 'bg-indigo-100 text-[#5B5FC7]'}`}>
                        {shift.name.includes('Shift A') ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="text-[13px] font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-colors">
                          {shift.id}
                        </span>
                        <div className="text-sm font-bold text-gray-900 mt-1">{shift.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {shift.startTime}
                      </div>
                      <span className="text-gray-300 font-bold">-</span>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {shift.endTime}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">{shift.remark}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                      shift.status === 'Active' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/50' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {shift.status}
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
          <div className="text-sm font-semibold text-gray-500">Showing <span className="text-gray-900">1</span> to <span className="text-gray-900">{mockShifts.length}</span> of <span className="text-gray-900">{mockShifts.length}</span> entries</div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 transition-colors shadow-sm">Previous</button>
            <button className="px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 transition-colors shadow-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}