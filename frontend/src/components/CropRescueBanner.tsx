import React from 'react';
import { 
  AlertOctagon, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  TrendingDown, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CropRescueBanner: React.FC = () => {
  const { 
    selectedShipment, 
    activateCropRescue, 
    confirmReroute, 
    setActiveTab, 
    markets 
  } = useApp();

  const isRerouted = selectedShipment.status === 'REROUTED' || selectedShipment.status === 'DELIVERED';
  const isRescueActive = selectedShipment.status === 'RESCUE_ACTIVE' || selectedShipment.rescueActivated;
  const isCriticalRisk = selectedShipment.spoilageRisk === 'CRITICAL' || selectedShipment.spoilageRisk === 'HIGH';

  const marketB = markets.find(m => m.id === 'market-b') || markets[1];

  // If already rerouted or delivered successfully
  if (isRerouted) {
    return (
      <div id="crop-rescue-success-banner" className="bg-gradient-to-r from-emerald-900/90 via-emerald-800 to-teal-900 border border-emerald-500/40 rounded-2xl p-4 text-white shadow-lg mb-6 transition">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-emerald-400/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-emerald-400/40">
                  FRESHNESS PROTECTED • ROUTE UPDATED
                </span>
                <span className="text-xs text-emerald-200/80 font-mono-data">Batch #{selectedShipment.batch.id}</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                Shipment Diverted to {selectedShipment.currentDestinationName}
              </h3>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                New ETA: {Math.floor(selectedShipment.estimatedTravelTimeMinutes / 60)}h {selectedShipment.estimatedTravelTimeMinutes % 60}m • Freshness Monitor: LOW (🟢) • FreshMart buyer contract matched.
              </p>
            </div>
          </div>

          <button
            id="view-evidence-audit-btn"
            onClick={() => setActiveTab('disputes')}
            className="self-start sm:self-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow cursor-pointer whitespace-nowrap"
          >
            <span>View Digital Chain of Trust</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // If Rescue Mode is triggered or delivery is at critical risk
  if (isRescueActive || isCriticalRisk) {
    return (
      <div id="crop-rescue-active-banner" className="relative overflow-hidden bg-gradient-to-r from-red-950 via-rose-900 to-amber-950 border-2 border-red-500/60 rounded-2xl p-4 sm:p-5 text-white shadow-2xl mb-6">
        {/* Subtle background glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-red-600/30 border border-red-500/50 text-red-300 shrink-0 animate-pulse">
              <AlertOctagon className="w-7 h-7 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-red-500 text-white text-xs font-black px-2.5 py-0.5 rounded-md uppercase tracking-wide shadow-sm animate-pulse">
                  FRESHNESS-BASED REROUTING AVAILABLE
                </span>
                <span className="text-xs text-red-200 font-semibold bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
                  Freshness Window Gap: -3h 58m
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-extrabold text-white mt-1.5">
                Current route ETA is beyond the estimated freshness window; an alternative route is available.
              </h3>
              
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1 text-xs text-red-100">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                  <span>Original ETA (Mumbai): <strong className="text-red-200">8h 10m</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-amber-300" />
                  <span>Freshness Window: <strong className="text-amber-200">{selectedShipment.safeSellingWindowHours.toFixed(1)} hours</strong></span>
                </div>
                <div className="text-red-200/90 font-medium">
                  Enzymatic decay rate: <strong className="text-white">3.2x</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
            <button
              id="banner-confirm-reroute-btn"
              onClick={() => confirmReroute('market-b')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-extrabold px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-xl shadow-emerald-900/40 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>CONFIRM FRESHNESS REROUTE TO MARKET B</span>
              <span className="text-[11px] bg-slate-950 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                ETA 3h 50m
              </span>
            </button>

            <button
              id="banner-open-rescue-tab-btn"
              onClick={() => setActiveTab('rescue')}
              className="bg-slate-900/80 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-red-700/60 transition cursor-pointer"
            >
              Compare 3 Alternative Markets
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If Normal / Safe status
  return (
    <div id="crop-rescue-normal-banner" className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                🟢 CURRENT ROUTE IS FEASIBLE
              </span>
              <span className="text-xs text-slate-500 font-mono-data">Batch #{selectedShipment.batch.id}</span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Arrival estimate ({Math.floor(selectedShipment.estimatedTravelTimeMinutes / 60)}h {selectedShipment.estimatedTravelTimeMinutes % 60}m) is well within the {selectedShipment.safeSellingWindowHours.toFixed(1)}h estimated safe window.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="trigger-demo-incident-btn"
            onClick={activateCropRescue}
            className="text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            Simulate Schedule Update
          </button>
        </div>
      </div>
    </div>
  );
};
