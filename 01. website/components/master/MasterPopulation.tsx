import { Plus, Search, Edit2, Trash2, Filter, Truck, Pickaxe, Settings2, ShieldCheck, AlertCircle } from "lucide-react";

const mockPopulation = [
  { unitCode: "DT-001", category: "Dump Truck", unitType: "HD785", fleetNumber: "HD785", plateNumber: "B 9123 XYZ", vendor: "PT Mining Logistics", opStatus: "Available", lifeStatus: "Active", remark: "Ready Operation" },
  { unitCode: "DT-002", category: "Dump Truck", unitType: "HD785", fleetNumber: "HD786", plateNumber: "B 9124 XYZ", vendor: "PT Mining Logistics", opStatus: "Breakdown", lifeStatus: "Active", remark: "Engine issue" },
  { unitCode: "EX-001", category: "Excavator", unitType: "PC2000", fleetNumber: "PC2000", plateNumber: "-", vendor: "PT Bumi Mineral", opStatus: "Operating", lifeStatus: "Active", remark: "Loading at Jetty Timur" },
  { unitCode: "EX-002", category: "Excavator", unitType: "PC1250", fleetNumber: "PC1250", plateNumber: "-", vendor: "PT Bumi Mineral", opStatus: "Maintenance", lifeStatus: "Active", remark: "Scheduled PM" },
];

export default function MasterPopulation() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Master Population</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Manage heavy equipment population, vehicles, and operational status
          </p>
        </div>
        <button className="bg-[#5B5FC7] hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Add New Unit
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
              placeholder="Search unit code or type..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]/20 focus:border-[#5B5FC7] transition-all shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            Filter Status
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Unit Details</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Type / Fleet</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Plate & Vendor</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Op Status</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Life Status</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {mockPopulation.map((item) => (
                <tr key={item.unitCode} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.category === 'Dump Truck' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-[#5B5FC7]'}`}>
                        {item.category === 'Dump Truck' ? <Truck className="w-5 h-5" /> : <Pickaxe className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="text-[13px] font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-colors">
                          {item.unitCode}
                        </span>
                        <div className="text-xs font-semibold text-gray-500 mt-1">{item.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-[13px] font-bold text-gray-900">{item.unitType}</div>
                    <div className="text-xs font-medium text-gray-500 mt-0.5">{item.fleetNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-[13px] font-bold text-gray-700 bg-gray-50 px-2.5 py-1 rounded inline-block border border-gray-100">{item.plateNumber}</div>
                    <div className="text-xs font-medium text-gray-500 mt-1">{item.vendor}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                      item.opStatus === 'Available' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/50' : 
                      item.opStatus === 'Operating' ? 'bg-blue-100 text-blue-800 border border-blue-200/50' :
                      item.opStatus === 'Maintenance' ? 'bg-amber-100 text-amber-800 border border-amber-200/50' :
                      'bg-red-100 text-red-800 border border-red-200/50'
                    }`}>
                      {item.opStatus === 'Available' && <ShieldCheck className="w-3 h-3" />}
                      {item.opStatus === 'Operating' && <Settings2 className="w-3 h-3" />}
                      {item.opStatus === 'Maintenance' && <AlertCircle className="w-3 h-3" />}
                      {item.opStatus === 'Breakdown' && <AlertCircle className="w-3 h-3" />}
                      {item.opStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                      item.lifeStatus === 'Active' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/50' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {item.lifeStatus}
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
          <div className="text-sm font-semibold text-gray-500">Showing <span className="text-gray-900">1</span> to <span className="text-gray-900">{mockPopulation.length}</span> of <span className="text-gray-900">{mockPopulation.length}</span> entries</div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 transition-colors shadow-sm">Previous</button>
            <button className="px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 transition-colors shadow-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}