import React from 'react';
import { 
  LifeBuoy, 
  AlertOctagon, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  Store, 
  TrendingDown, 
  ArrowRight,
  ShieldCheck,
  Check,
  Send,
  Navigation,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CropRescueTab: React.FC = () => {
  const { 
    selectedShipment, 
    markets, 
    confirmReroute, 
    activateCropRescue, 
    setActiveTab 
  } = useApp();

  const isRerouted = selectedShipment.status === 'REROUTED' || selectedShipment.status === 'DELIVERED';
  const isRescueActive = selectedShipment.status === 'RESCUE_ACTIVE' || selectedShipment.rescueActivated;

  // Rescue Evaluation Steps Checklist
  const rescueWorkflowSteps = [
    { num: 1, label: 'Calculate remaining safe-selling window', status: 'COMPLETED', detail: `${selectedShipment.safeSellingWindowHours.toFixed(1)} hours calculated from Arrhenius Q10 decay rate.` },
    { num: 2, label: 'Search nearby suitable markets & buyers', status: 'COMPLETED', detail: 'Identified 3 regional agricultural terminals (Pune, Thane, Navi Mumbai).' },
    { num: 3, label: 'Calculate transit ETA to each market', status: 'COMPLETED', detail: 'Market B: 3h 50m | Market C: 4h 40m | Market D: 5h 30m.' },
    { num: 4, label: 'Check market receiving & gate operating hours', status: 'COMPLETED', detail: 'Pune Terminal operating until 10:00 PM (open and staffed).' },
    { num: 5, label: 'Check buyer crop quality requirements', status: 'COMPLETED', detail: 'FreshMart terminal confirms Grade A/B tomato requirements match Batch #TG102.' },
    { num: 6, label: 'Verify spot demand and intake availability', status: 'COMPLETED', detail: 'High demand detected: 1,200 kg deficit at Pune distribution dock.' },
    { num: 7, label: 'Calculate composite fresh-route risk', status: 'COMPLETED', detail: 'Pune score: 68 (Optimal) vs Mumbai original score: 280 (Critical).' },
    { num: 8, label: 'Show feasible destination candidates', status: 'COMPLETED', detail: 'Market B is ranked #1 Feasible Candidate.' },
    { num: 9, label: 'Recommend suitable alternative route', status: 'COMPLETED', detail: 'AI FreshRoute™ recommends diversion via SH-44 expressway corridor.' },
    { num: 10, label: 'Authorized user confirms reroute', status: isRerouted ? 'COMPLETED' : 'PENDING_USER_ACTION', detail: isRerouted ? 'Authorized and dispatched to driver.' : 'Awaiting authorized dispatcher confirmation.' },
    { num: 11, label: 'Recalculate telemetry & update map path', status: isRerouted ? 'COMPLETED' : 'PENDING', detail: isRerouted ? 'Active GPS polyline redirected to Pune Agro Terminal.' : 'Ready to re-route.' },
    { num: 12, label: 'Update driver ETA & delivery commitments', status: isRerouted ? 'COMPLETED' : 'PENDING', detail: isRerouted ? 'Updated ETA: 3h 50m (Safe window margin: +22 mins).' : 'Pending authorization.' },
    { num: 13, label: 'Broadcast notifications to all stakeholders', status: isRerouted ? 'COMPLETED' : 'PENDING', detail: isRerouted ? 'Farmer, Driver, Buyer (Sunil Rao), and Terminal alerted.' : 'Pending.' },
  ];

  return (
    <div id="crop-rescue-tab" className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border border-red-500/40 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider">
              <LifeBuoy className="w-3.5 h-3.5 text-red-400" />
              <span>CROP RESCUE MODE ⭐⭐⭐</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Autonomous Crop Salvage & Rerouting Command
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Continuously evaluating: <strong className="text-white">“Can this shipment still reach the current destination within its estimated safe-selling window?”</strong>
            </p>
          </div>

          <div className="shrink-0">
            {isRerouted ? (
              <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-4 py-3 rounded-2xl text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                <div className="text-xs font-black uppercase">RESCUE COMPLETED</div>
                <div className="text-[11px] text-slate-300 font-mono-data">Diverted to Market B</div>
              </div>
            ) : (
              <button
                id="rescue-tab-confirm-btn"
                onClick={() => confirmReroute('market-b')}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-black px-5 py-3 rounded-2xl shadow-xl shadow-emerald-500/30 transition flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>CONFIRM REROUTE TO MARKET B</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Spoilage Deficit Comparison Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          Safe-Selling Window vs. Route ETA Diagnostic
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current ETA */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-semibold text-slate-500">Original Route ETA (Mumbai APMC)</div>
            <div className="text-2xl sm:text-3xl font-black text-red-600 mt-1 font-mono-data">
              8h 10m
            </div>
            <div className="text-xs text-red-600 font-medium mt-1">
              Kasara Ghat gridlock adds +4h 20m delay
            </div>
          </div>

          {/* Remaining Safe Window */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-semibold text-slate-500">Remaining Safe-Selling Window</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1 font-mono-data">
              {selectedShipment.safeSellingWindowHours.toFixed(1)} hours
            </div>
            <div className="text-xs text-amber-700 font-medium mt-1">
              Biological respiration rate: 3.2x at 33°C
            </div>
          </div>

          {/* Deficit / Verdict */}
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <div className="text-xs font-semibold text-red-700">Delivery Window Deficit</div>
            <div className="text-2xl sm:text-3xl font-black text-red-700 mt-1 font-mono-data">
              -3h 58m
            </div>
            <div className="text-xs font-bold text-red-800 mt-1">
              🚨 Inevitable Spoilage at Original Destination
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Alternative Markets Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Evaluated Candidate Agricultural Terminals
            </h3>
            <p className="text-xs text-slate-500">
              Ranked by distance, travel time, crop demand, price per kg, and safe-selling margin.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('markets')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Market Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {markets.slice(0, 3).map((m) => {
            const isMarketB = m.id === 'market-b';
            const isOriginal = m.id === 'market-a';

            return (
              <div
                key={m.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isMarketB
                    ? 'bg-emerald-50/60 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : isOriginal
                    ? 'bg-red-50/30 border-red-200 opacity-80'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Header Tag */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    m.feasibilityStatus === 'Suitable'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : m.feasibilityStatus === 'Possible'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    {m.feasibilityStatus === 'Suitable' ? 'SUITABLE 🟢' : m.feasibilityStatus === 'Possible' ? 'POSSIBLE 🟡' : 'NOT SUITABLE 🔴'}
                  </span>

                  {isMarketB && (
                    <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded">
                      #1 AI PICK
                    </span>
                  )}
                </div>

                <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                  {m.name}
                </h4>

                <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-200/60 pt-3 font-mono-data">
                  <div className="flex justify-between">
                    <span>Distance:</span>
                    <strong className="text-slate-900">{m.distanceKm} km</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>ETA:</span>
                    <strong className={isMarketB ? 'text-emerald-700' : isOriginal ? 'text-red-600' : 'text-slate-900'}>
                      {m.etaHours}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Demand Level:</span>
                    <strong className={m.demandLevel === 'HIGH' ? 'text-emerald-700' : 'text-slate-800'}>
                      {m.demandLevel}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Indicative Price:</span>
                    <strong className="text-emerald-700">₹{m.indicativePricePerKg}/kg</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Receiving Hours:</span>
                    <span className="text-slate-700">{m.operatingHours}</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/60">
                  {isMarketB ? (
                    <button
                      onClick={() => confirmReroute(m.id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black py-2.5 rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                      <span>{isRerouted ? 'REROUTED TO THIS MARKET' : 'SELECT & CONFIRM REROUTE'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => confirmReroute(m.id)}
                      disabled={isOriginal}
                      className="w-full bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 text-xs font-semibold py-2 rounded-xl transition cursor-pointer"
                    >
                      {isOriginal ? 'Original Route (Unsafe)' : 'Select Market C'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Crop Rescue Mode 13-Step Automated Verification Audit */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider bg-slate-900 text-emerald-400 px-2 py-0.5 rounded">
              DECISION AUDIT
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Crop Rescue Mode 13-Point Verification Sequence
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent execution log demonstrating how Agrilogix protects farmer assets without human bias.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rescueWorkflowSteps.map((step) => (
            <div 
              key={step.num}
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition ${
                step.status === 'COMPLETED' 
                  ? 'bg-emerald-50/40 border-emerald-200 text-slate-800' 
                  : step.status === 'PENDING_USER_ACTION'
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold ${
                step.status === 'COMPLETED'
                  ? 'bg-emerald-600 text-white'
                  : step.status === 'PENDING_USER_ACTION'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-300 text-slate-600'
              }`}>
                {step.status === 'COMPLETED' ? <Check className="w-3.5 h-3.5" /> : step.num}
              </div>

              <div>
                <div className="font-bold text-slate-900">
                  {step.num}. {step.label}
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  {step.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
