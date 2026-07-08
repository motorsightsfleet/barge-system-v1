import { Plus, Search, Calendar, ChevronRight, Anchor, MapPin, Target, LayoutGrid } from "lucide-react";
import { Link } from "react-router";

const mockPlans = [
  { id: "BRG-001", date: "2026-05-28", area: "Jetty Timur", barge: "SEA TITAN", tugboat: "TB. MERDEKA 01", targetTonase: "5000 MT", status: "Draft" },
  { id: "BRG-002", date: "2026-05-28", area: "Jetty Barat", barge: "RIVER KING", tugboat: "TB. NUSANTARA", targetTonase: "3500 MT", status: "Arrived" },
  { id: "BRG-003", date: "2026-05-29", area: "Jetty Timur", barge: "OCEAN BLUE", tugboat: "TB. PACIFIC", targetTonase: "4000 MT", status: "Operation" },
];

export default function Planning() {
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
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID or Barge name..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5B5FC7] focus:border-[#5B5FC7] shadow-sm transition-all"
            />
          </div>
          <button className="flex items-center gap-2 text-sm font-semibold text-gray-600 border border-gray-300 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors shadow-sm bg-white">
            <Calendar className="w-4 h-4" />
            Filter Date
          </button>
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
              {mockPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md">{plan.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-600">{plan.date}</td>
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
                    <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-gray-400" /> {plan.targetTonase}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                      plan.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 
                      plan.status === 'Operation' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {plan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/transactional/operation/${plan.id}`}
                      className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-bold text-gray-600 bg-white border border-gray-300 hover:text-[#5B5FC7] hover:border-[#5B5FC7] hover:bg-indigo-50 rounded-lg transition-all shadow-sm group-hover:shadow group-hover:-translate-y-0.5"
                    >
                      View Detail <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}