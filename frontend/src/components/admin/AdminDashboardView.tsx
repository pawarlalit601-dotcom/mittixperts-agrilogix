import React from 'react';
import {
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  LifeBuoy,
  Truck,
  MapPin,
  CheckCircle2,
  DollarSign,
  Activity,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminDashboardView: React.FC = () => {
  const {
    networkOverview,
    shipments,
    selectedShipment,
    setSelectedShipmentId,
    setActiveTab,
    confirmReroute,
    activateCropRescue
  } = useApp();

  const overview = networkOverview || {
    activeShipments: 12,
    highRiskCount: 2,
    produceRescuedKg: 3400,
    valueSavedTodayInr: 145000
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900">
              Agrilogix Control Center & Network Operations
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold border border-purple-200">
              Maharashtra Central Hub
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time fleet telemetry, freshness forecasting, and evidence-based case review
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('risk')}
            className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 cursor-pointer flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>2 Priority Advisories</span>
          </button>
        </div>
      </div>

      {/* 4 Network Overview Cards Strictly Required by Prompt:
          - Active Shipments: 12
          - Priority Attention: 2
          - Produce Rescued Today: 3,400 kg
          - Value Saved: ₹1,45,000
      */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Shipments: 12 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Active Shipments</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono-data mt-1">
            {overview.activeShipments}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across 4 transport corridors
          </div>
        </div>

        {/* High Risk: 2 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Priority Attention</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-600 font-mono-data mt-1 flex items-center gap-2">
            <span>{overview.highRiskCount}</span>
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping inline-block" />
          </div>
          <div className="text-[11px] text-red-600 font-semibold mt-1">
            Kasara Ghat schedule updates
          </div>
        </div>

        {/* Produce Rescued Today: 3,400 kg */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Produce Rescued</span>
            <LifeBuoy className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono-data mt-1">
            {overview.produceRescuedKg.toLocaleString()} kg
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            Zero agricultural dump
          </div>
        </div>

        {/* Value Saved: ₹1,45,000 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Value Saved</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-900 font-mono-data mt-1">
            ₹{overview.valueSavedTodayInr.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Direct farmer revenue protected
          </div>
        </div>
      </div>

      {/* Live Network Map Showing Multiple Trucks */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Live Network Map & Multi-Vehicle Transit Corridors
            </h3>
            <p className="text-xs text-slate-500">
              Real-time monitoring across Western Maharashtra highway corridors (NH-160, SH-44, NH-48)
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Normal (10)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse inline-block" />
              <span className="text-red-600 font-bold">Freshness Attention (2)</span>
            </span>
          </div>
        </div>

        {/* Interactive Map Visual */}
        <div className="relative w-full h-72 sm:h-80 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center p-6">
          {/* Subtle Grid */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="admin-map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#a855f7" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#admin-map-grid)" />
            </svg>
          </div>

          {/* Road Corridors */}
          <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none">
            <line x1="15%" y1="20%" x2="45%" y2="50%" stroke="#475569" strokeWidth="4" />
            <line x1="45%" y1="50%" x2="85%" y2="80%" stroke="#475569" strokeWidth="4" />
            <line x1="45%" y1="50%" x2="80%" y2="35%" stroke="#10b981" strokeWidth="3" strokeDasharray="6 4" />
          </svg>

          {/* Key Hub Markers */}
          <div className="absolute top-[18%] left-[12%] text-center">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 border border-white flex items-center justify-center text-white text-[10px] font-bold shadow-md">
              N
            </div>
            <span className="text-[10px] text-slate-300 font-bold mt-1 block">Nashik Farm</span>
          </div>

          <div className="absolute bottom-[16%] right-[12%] text-center">
            <div className="w-7 h-7 rounded-lg bg-blue-600 border border-white flex items-center justify-center text-white text-[10px] font-bold shadow-md">
              M
            </div>
            <span className="text-[10px] text-slate-300 font-bold mt-1 block">Mumbai APMC</span>
          </div>

          <div className="absolute top-[30%] right-[18%] text-center">
            <div className="w-7 h-7 rounded-lg bg-purple-600 border border-white flex items-center justify-center text-white text-[10px] font-bold shadow-md">
              P
            </div>
            <span className="text-[10px] text-emerald-400 font-bold mt-1 block">Pune Terminal (Rescue)</span>
          </div>

          {/* Truck 1: TG102 (Flagship at Kasara) */}
          <div
            onClick={() => setSelectedShipmentId('shipment-tomato-102')}
            className="absolute top-[46%] left-[43%] p-2 rounded-2xl bg-slate-900/90 border-2 border-red-500 shadow-2xl cursor-pointer hover:scale-110 transition flex items-center gap-2 text-white"
          >
            <div className="w-6 h-6 rounded-lg bg-red-600 flex items-center justify-center text-xs">
              <Truck className="w-3.5 h-3.5" />
            </div>
            <div className="text-left text-[11px] leading-tight pr-1">
              <div className="font-mono font-bold text-red-400">#TG102 (Freshness Attention)</div>
              <div className="text-[9px] text-slate-300">Tomato &bull; 1,000 kg &bull; ETA 7h</div>
            </div>
          </div>

          {/* Truck 2: Grapes (Normal) */}
          <div
            onClick={() => setSelectedShipmentId('shipment-grapes-204')}
            className="absolute top-[32%] left-[28%] p-2 rounded-2xl bg-slate-900/90 border border-emerald-500 shadow-lg cursor-pointer hover:scale-105 transition flex items-center gap-2 text-white"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-xs">
              <Truck className="w-3.5 h-3.5" />
            </div>
            <div className="text-left text-[11px] leading-tight pr-1">
              <div className="font-mono font-bold text-emerald-400">#GP204 (Safe)</div>
              <div className="text-[9px] text-slate-300">Grapes &bull; 800 kg</div>
            </div>
          </div>

          {/* Truck 3: Onion (Approaching) */}
          <div
            onClick={() => setSelectedShipmentId('shipment-onion-301')}
            className="absolute bottom-[28%] right-[32%] p-2 rounded-2xl bg-slate-900/90 border border-blue-500 shadow-lg cursor-pointer hover:scale-105 transition flex items-center gap-2 text-white"
          >
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-xs">
              <Truck className="w-3.5 h-3.5" />
            </div>
            <div className="text-left text-[11px] leading-tight pr-1">
              <div className="font-mono font-bold text-blue-400">#ON301 (Normal)</div>
              <div className="text-[9px] text-slate-300">Onion &bull; 2,500 kg</div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Risk Feed & Quick Intervene Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Risk Feed */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-base font-bold text-slate-900">
                Live Operations Advisory & Freshness Events
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Auto-updating via BLE gateways
            </span>
          </div>

          <div className="space-y-3">
            {/* Urgent Incident #1: TG102 */}
            <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                    PRIORITY ATTENTION
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    Batch #TG102 &bull; 1,000 kg Tomatoes
                  </h4>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Kasara Ghat highway landslide. Schedule update: projected arrival (7h 20m) is beyond the freshness window (4h 30m); review the suggested route adjustment.
                </p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-red-700 font-mono font-bold">
                  <span>Freshness Forecast: 65%</span>
                  <span>&bull;</span>
                  <span>Value Impact: ₹42,000</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => confirmReroute('market-b')}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
                >
                  Confirm Pune Freshness Reroute
                </button>
              </div>
            </div>

            {/* Warning Incident #2: GP204 */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                    ATTENTION REQUIRED
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    Batch #GP204 &bull; 800 kg Thompson Grapes
                  </h4>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Minor temperature excursion to 23°C in Reefer compartment. Automatic chiller setpoint override sent.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('fleet')}
                className="px-4 py-2 rounded-xl border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-semibold cursor-pointer shrink-0"
              >
                Inspect Chiller
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Admin Emergency Intervention Panel */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Freshness Protection Coordination
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AgriFlow's AI orchestrator matches shipments needing support with registered wholesale buyers inside safe travel windows.
            </p>

            <div className="mt-4 p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Consignment:</span>
                <span className="font-mono font-bold text-white">#TG102</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Recommended Destination:</span>
                <span className="font-bold text-emerald-400">Pune Terminal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Value Preserved:</span>
                <span className="font-mono font-bold text-emerald-400">₹44,000 (100%)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => confirmReroute('market-b')}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
          >
            <LifeBuoy className="w-4 h-4" />
            <span>APPLY ROUTE ADJUSTMENT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
