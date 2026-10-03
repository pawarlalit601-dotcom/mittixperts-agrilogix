import React from 'react';
import {
  AlertTriangle,
  LifeBuoy,
  Clock,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Store
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FarmerCropRescueView: React.FC = () => {
  const {
    selectedShipment,
    confirmReroute,
    setActiveTab,
    activateCropRescue
  } = useApp();

  const isRescueTriggered =
    selectedShipment.rescueActivated ||
    selectedShipment.status === 'RESCUE_ACTIVE' ||
    selectedShipment.status === 'AT_RISK';

  const currentEtaHours = (selectedShipment.estimatedTravelTimeMinutes / 60).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Warning Banner: 🚨 CROP RESCUE MODE */}
      <div className="bg-red-500 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <LifeBuoy className="w-8 h-8 text-white animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-white text-red-700 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  PRIORITY SUPPORT
                </span>
                <span className="text-red-100 text-xs font-semibold">
                  Batch #TG102 (1,000 kg Tomatoes)
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mt-1 tracking-tight">
                FRESHNESS-BASED REROUTING READY
              </h2>
              <p className="text-xs sm:text-sm text-red-100 mt-1 max-w-xl">
                Schedule update: current ETA is beyond the produce freshness window. Rerouting to the recommended market can preserve ₹8,500 in harvest value.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => confirmReroute('market-b')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-red-50 text-red-700 font-black text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <span>CONFIRM FRESHNESS REROUTE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Status Indicators Strictly Matching Specification */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Destination */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Current Destination
          </div>
          <div className="text-lg font-bold text-slate-900 truncate">
            {selectedShipment.currentDestinationName || 'Mumbai Central APMC'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Via Kasara Ghat NH-160
          </div>
        </div>

        {/* Current ETA: 7h 20m */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Current ETA
          </div>
          <div className="text-2xl font-black text-red-600 font-mono-data">
            7h 20m
          </div>
          <div className="text-[11px] text-red-500 font-semibold mt-0.5">
            Highway congestion schedule update
          </div>
        </div>

        {/* Estimated Safe Window: 4h 30m */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Estimated Safe Window
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-data">
            4h 30m
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-0.5">
            Freshness window gap: ETA is 2h 50m beyond the current limit.
          </div>
        </div>

        {/* Freshness status */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Status
          </div>
          <div className="text-2xl font-black text-red-600 font-mono-data flex items-center gap-2">
            <span>FRESHNESS ATTENTION</span>
            <span>🔴</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Current ETA is beyond the freshness window; review the recommended route.
          </div>
        </div>
      </div>

      {/* Recommended Alternative Markets with 1-Click Divert */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recommended Alternative Markets
            </h3>
            <p className="text-xs text-slate-500">
              Ranked by arrival safety margin, demand readiness, and commercial recovery
            </p>
          </div>

          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            1 Perfect Match Available
          </span>
        </div>

        <div className="space-y-4">
          {/* Top Rescue Pick: Pune Agro Logistics */}
          <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-base">
                    Market B (Pune Agro Logistics Terminal)
                  </h4>
                  <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                    AI Top Pick
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Hadapsar Express Cold Yard &bull; Buyer: FreshMart Regional Procurement
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-700">
                  <span className="font-mono font-bold">55 km away</span>
                  <span>&bull;</span>
                  <span className="text-emerald-700 font-bold">ETA: 3h 40m (Safe 🟢)</span>
                  <span>&bull;</span>
                  <span className="text-slate-600">Demand: 1,000 kg @ ₹44/kg</span>
                  <span>&bull;</span>
                  <span className="text-emerald-700 font-bold">Produce Preserved: 100%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => confirmReroute('market-b')}
                className="w-full md:w-auto px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                <span>CONFIRM ROUTE TO PUNE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Secondary Pick: Thane Regional Mandi */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 opacity-80">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Market C (Thane Regional Agro Mandi)
                </h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span>72 km</span>
                  <span>&bull;</span>
                  <span>ETA: 4h 40m</span>
                  <span>&bull;</span>
                    <span className="text-amber-700 font-semibold">Freshness Watch 🟡</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => confirmReroute('market-c')}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Select Thane
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
