import { Outlet, Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Ship,
  Database,
  MapPin,
  Clock,
  Truck,
  FileText,
  Play,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Menu,
  User,
  Anchor,
  ClipboardCheck,
  Bell,
  Search
} from 'lucide-react';
import { useState } from 'react';

// Reference Data, Engine, Variant Specification, and Unit Model Variant used to be four
// separate sidebar entries. They're all "configuration" data feeding the Unit registry
// and now share one tab bar (see PopulationConfigTabs), so the sidebar only needs one
// "Konfigurasi Unit" entry that matches any of their routes.
const POPULATION_CONFIG_PATHS = [
  '/master/population/reference-data',
  '/master/population/engine',
  '/master/population/unit-model-variant',
  '/master/population/variant-specification',
];

const POPULATION_SUBMENU = [
  { label: 'Unit', path: '/master/population/unit', matchPaths: undefined as string[] | undefined },
  { label: 'Konfigurasi Unit', path: '/master/population/reference-data', matchPaths: POPULATION_CONFIG_PATHS },
];

export default function Layout() {
  const location = useLocation();
  const [masterExpanded, setMasterExpanded] = useState(true);
  const [transactionalExpanded, setTransactionalExpanded] = useState(true);
  const [populationExpanded, setPopulationExpanded] = useState(
    location.pathname.startsWith('/master/population')
  );

  const isActive = (path: string) => location.pathname === path;
  const isActiveSection = (section: string) => location.pathname.startsWith(section);
  const isPopulationSubActive = (item: (typeof POPULATION_SUBMENU)[number]) =>
    (item.matchPaths ?? [item.path]).some((p) => location.pathname.startsWith(p));

  const getPageTitle = () => {
    if (location.pathname === '/dashboard') return 'Dashboard';
    if (location.pathname.startsWith('/master/population')) {
      const match = POPULATION_SUBMENU.find((item) => (item.matchPaths ?? [item.path]).some((p) => location.pathname.startsWith(p)));
      return match ? `Population - ${match.label}` : 'Population';
    }
    if (location.pathname.startsWith('/master/area')) return 'Master Area';
    if (location.pathname.startsWith('/master/barge')) return 'Master Barge';
    if (location.pathname.startsWith('/master/shift')) return 'Master Shift';
    if (location.pathname.startsWith('/transactional/operation')) return 'Barging Process';
    return '';
  };

  return (
    <div className="flex h-screen bg-[#f5f7fb]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2d3748] text-white flex flex-col z-20 shadow-lg">
        {/* Logo Header */}
        <div className="p-6 border-b border-gray-700 h-16 flex items-center bg-[#242c3a]">
          <div className="flex items-center gap-3">
            <Ship className="w-8 h-8 text-[#5B5FC7]" />
            <div>
              <h1 className="text-xl font-bold">Inline</h1>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Barge System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          {/* Dashboard */}
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-6 py-3 transition-colors ${
              isActive('/dashboard')
                ? 'bg-[#5B5FC7]/10 text-[#5B5FC7] border-r-4 border-[#5B5FC7]'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>

          {/* Master Data Section */}
          <div className="mt-8">
            <div className="px-6 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              Master Data
            </div>
            <button
              onClick={() => setMasterExpanded(!masterExpanded)}
              className="w-full flex items-center justify-between px-6 py-3 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-gray-400" />
                <span className="font-medium">Master Data</span>
              </div>
              {masterExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            </button>

            {masterExpanded && (
              <div className="mt-1 space-y-1">
                <div>
                  <button
                    onClick={() => setPopulationExpanded(!populationExpanded)}
                    className="w-full flex items-center justify-between px-12 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="w-4 h-4" />
                      <span className={isActiveSection('/master/population') ? 'text-[#5B5FC7] font-semibold' : ''}>Population</span>
                    </div>
                    {populationExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>

                  {populationExpanded && (
                    <div className="mt-1 space-y-1">
                      {POPULATION_SUBMENU.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center gap-3 pl-16 pr-6 py-2 text-[13px] transition-colors ${
                            isPopulationSubActive(item) ? 'text-[#5B5FC7] font-semibold' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isPopulationSubActive(item) ? 'bg-[#5B5FC7]' : 'bg-transparent'}`}></div>
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  to="/master/area"
                  className={`flex items-center gap-3 px-12 py-2.5 text-sm transition-colors ${
                    isActive('/master/area')
                      ? 'text-[#5B5FC7] font-semibold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${isActive('/master/area') ? 'bg-[#5B5FC7]' : 'bg-transparent'}`}></div>
                  <span>Area</span>
                </Link>

                <Link
                  to="/master/barge"
                  className={`flex items-center gap-3 px-12 py-2.5 text-sm transition-colors ${
                    isActive('/master/barge')
                      ? 'text-[#5B5FC7] font-semibold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${isActive('/master/barge') ? 'bg-[#5B5FC7]' : 'bg-transparent'}`}></div>
                  <span>Barge</span>
                </Link>

                <Link
                  to="/master/shift"
                  className={`flex items-center gap-3 px-12 py-2.5 text-sm transition-colors ${
                    isActive('/master/shift')
                      ? 'text-[#5B5FC7] font-semibold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${isActive('/master/shift') ? 'bg-[#5B5FC7]' : 'bg-transparent'}`}></div>
                  <span>Shift</span>
                </Link>

              </div>
            )}
          </div>

          {/* Transactional Section */}
          <div className="mt-8">
            <div className="px-6 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              Transactional
            </div>
            <button
              onClick={() => setTransactionalExpanded(!transactionalExpanded)}
              className="w-full flex items-center justify-between px-6 py-3 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="font-medium">Barging Process</span>
              </div>
              {transactionalExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            </button>

            {transactionalExpanded && (
              <div className="mt-1 space-y-1">
                <Link
                  to="/transactional/operation"
                  className={`flex items-center gap-3 px-12 py-2.5 text-sm transition-colors ${
                    isActive('/transactional/operation') || location.pathname.startsWith('/transactional/operation/')
                      ? 'text-[#5B5FC7] font-semibold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${isActive('/transactional/operation') || location.pathname.startsWith('/transactional/operation/') ? 'bg-[#5B5FC7]' : 'bg-transparent'}`}></div>
                  <span>Barging Process</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-gray-700 lg:hidden">
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center text-sm">
              <span className="text-gray-400 font-medium">Pages</span>
              <span className="mx-2 text-gray-300">/</span>
              <span className="text-gray-700 font-semibold">{getPageTitle()}</span>
            </div>
          </div>

          {/* Account Profile Area */}
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-8 w-px bg-gray-200"></div>

            <button className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-2 rounded-xl transition-all">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5B5FC7] to-indigo-800 flex items-center justify-center text-white font-bold shadow-sm">
                AD
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-bold text-gray-700 leading-tight">Administrator</p>
                <p className="text-[11px] font-semibold text-gray-400">Super Admin</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
