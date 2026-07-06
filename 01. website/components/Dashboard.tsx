import {
  Ship,
  TrendingUp,
  Clock,
  AlertCircle,
  Anchor,
  MapPin,
  Target,
  ChevronRight,
  BarChart3,
  CheckCircle2,
  Package,
  Activity,
  Timer
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Link } from "react-router";

const weeklyData = [
  { name: "Mon", tonnage: 4000 },
  { name: "Tue", tonnage: 3000 },
  { name: "Wed", tonnage: 2000 },
  { name: "Thu", tonnage: 2780 },
  { name: "Fri", tonnage: 1890 },
  { name: "Sat", tonnage: 2390 },
  { name: "Sun", tonnage: 3490 },
];

const statusData = [
  { name: "Operation", value: 45 },
  { name: "Completed", value: 30 },
  { name: "Draft", value: 15 },
  { name: "Ready", value: 10 },
];

const COLORS = ["#5B5FC7", "#10b981", "#f59e0b", "#3b82f6"];

const recentOperations = [
  {
    id: "BRG-001",
    barge: "SEA TITAN",
    area: "Jetty Timur",
    population: "EXC-200, EXC-201",
    status: "Operation",
    progress: 75,
    target: "5000 MT",
    finalTonnage: "-",
    duration: "In Progress",
  },
  {
    id: "BRG-002",
    barge: "RIVER KING",
    area: "Jetty Barat",
    population: "EXC-105",
    status: "Completed",
    progress: 100,
    target: "3500 MT",
    finalTonnage: "3550 MT",
    duration: "14h 30m",
  },
  {
    id: "BRG-003",
    barge: "OCEAN BLUE",
    area: "Jetty Timur",
    population: "Unassigned",
    status: "Draft",
    progress: 0,
    target: "4000 MT",
    finalTonnage: "-",
    duration: "-",
  },
  {
    id: "BRG-004",
    barge: "PACIFIC STAR",
    area: "Jetty Utara",
    population: "EXC-302",
    status: "Ready",
    progress: 10,
    target: "4500 MT",
    finalTonnage: "-",
    duration: "-",
  },
];

export default function Dashboard() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Real-time insights of barging operations and population performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50/50 px-5 py-2.5 rounded-xl border border-indigo-100 shadow-sm text-sm font-bold text-[#5B5FC7] flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {new Date("2026-06-11").toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-[#5B5FC7] to-indigo-800 p-6 rounded-2xl shadow-md text-white relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white border border-white/20">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-100 uppercase tracking-wider mb-1">Active Population</p>
              <h3 className="text-3xl font-black text-white">24 <span className="text-sm font-bold text-indigo-200">Units</span></h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md hover:border-emerald-200 group">
          <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tonnage Today</p>
            <h3 className="text-3xl font-black text-gray-900">14.5k <span className="text-sm font-bold text-gray-400">MT</span></h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md hover:border-blue-200 group">
          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Completed Ops</p>
            <h3 className="text-3xl font-black text-gray-900">8 <span className="text-sm font-bold text-gray-400">Barges</span></h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md hover:border-amber-200 group">
          <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Avg Loading Time</p>
            <h3 className="text-3xl font-black text-gray-900">16.2 <span className="text-sm font-bold text-gray-400">Hrs</span></h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#5B5FC7]" />
              Weekly Tonnage Performance
            </h3>
            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold rounded-lg focus:ring-[#5B5FC7] focus:border-[#5B5FC7] block px-3 py-2 outline-none">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTonnage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B5FC7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#5B5FC7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }} dx={10} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontWeight: 600 }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Area type="monotone" dataKey="tonnage" stroke="#5B5FC7" strokeWidth={3} fillOpacity={1} fill="url(#colorTonnage)" activeDot={{ r: 6, fill: "#5B5FC7", stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#5B5FC7]" />
            Operation Stages
          </h3>
          <p className="text-xs font-semibold text-gray-500 mb-6">Current distribution of all barging activities</p>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontWeight: 600 }}
                  itemStyle={{ fontWeight: 600 }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Operations Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Barging Activities & Records</h3>
            <p className="text-xs font-semibold text-gray-500 mt-1">Live tracking of ongoing and completed operations</p>
          </div>
          <Link to="/transactional/operation" className="text-sm font-bold text-white bg-[#5B5FC7] hover:bg-indigo-700 px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm">
            Manage Operations <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-white border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">
                  Doc ID
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">
                  Barge & Location
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">
                  Population
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">
                  Total Tonnage
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">
                  Loading Duration
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {recentOperations.map((op) => (
                <tr key={op.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-[13px] font-bold text-gray-900 bg-gray-100 px-2.5 py-1.5 rounded-lg border border-gray-200 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-colors">{op.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#5B5FC7] flex items-center gap-1.5">
                        <Anchor className="w-3.5 h-3.5" /> {op.barge}
                      </span>
                      <span className="text-[12px] font-semibold text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {op.area}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg inline-block border border-gray-100">
                      {op.population}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                        op.status === "Operation"
                          ? "bg-indigo-100 text-indigo-800 border border-indigo-200/50"
                          : op.status === "Completed"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200/50"
                          : op.status === "Draft"
                          ? "bg-amber-100 text-amber-800 border border-amber-200/50"
                          : "bg-blue-100 text-blue-800 border border-blue-200/50"
                      }`}
                    >
                      {op.status === "Completed" && <CheckCircle2 className="w-3 h-3" />}
                      {op.status === "Operation" && <Activity className="w-3 h-3" />}
                      {op.status === "Draft" && <Package className="w-3 h-3" />}
                      {op.status === "Ready" && <Ship className="w-3 h-3" />}
                      {op.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {op.status === "Completed" ? (
                        <span className="text-sm font-black text-emerald-600 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> {op.finalTonnage}
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-gray-600">
                          {op.status === "Draft" ? "-" : op.target}
                        </span>
                      )}
                      {op.status !== "Completed" && op.status !== "Draft" && (
                        <div className="w-24 bg-gray-100 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 bg-[#5B5FC7]`}
                            style={{ width: `${op.progress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-bold flex items-center gap-1.5 ${op.status === 'Completed' ? 'text-gray-900' : 'text-gray-500'}`}>
                      <Timer className={`w-4 h-4 ${op.status === 'Completed' ? 'text-amber-500' : 'text-gray-400'}`} />
                      {op.duration}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/transactional/operation/${op.id}`}
                      className="inline-flex items-center justify-center px-3 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 hover:text-[#5B5FC7] hover:border-[#5B5FC7] hover:bg-indigo-50 rounded-lg transition-all shadow-sm group-hover:shadow"
                    >
                      View Details
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