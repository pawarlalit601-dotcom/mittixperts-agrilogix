import React from 'react';
import {
  Sparkles,
  Navigation,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Fuel,
  TrendingDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DriverFreshRouteView: React.FC = () => {
  const {
    selectedShipment,
    driverAcceptedAiRoute,
    acceptDriverAiRoute,
    confirmReroute,
    setActiveTab
  } = useApp();

  const routes = [
    {
      id: 'route-original-mumbai',
      name: 'Route A: Original Destination (Mumbai Central APMC)',
      corridor: 'Via NH-160 Kasara Ghat Corridor',
      distanceKm: 110,
      eta: '7h 20m (Gridlock Active)',
      traffic: 'CONGESTED (Avg 8 km/h)',
      freshnessRisk: 'HIGH RISK 🔴',
      riskBadge: 'bg-red-100 text-red-800 border-red-200',
      safeWindowStatus: 'Exceeds Safe Window by 2h 50m',
      spoilageEstimate: '65% Loss Projected',
      isRecommended: false,
    },
    {
      id: 'route-rescue-pune',
      name: 'Route B: AI Recommended Detour (Pune Agro Terminal)',
      corridor: 'Via SH-44 Expressway Direct Passage',
      distanceKm: 55,
      eta: '3h 40m (Clear Passage)',
      traffic: 'SMOOTH (Avg 58 km/h)',
      freshnessRisk: 'LOW RISK 🟢',
      riskBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      safeWindowStatus: 'Fits Safely inside 5h 20m Window',
      spoilageEstimate: '0% Loss (Full Commercial Offtake)',
      isRecommended: true,
      features: ['Avoids 4.5h Kasara mountain gridlock', 'Direct warehouse cold bay access'],
    },
    {
      id: 'route-rescue-thane',
      name: 'Route C: Secondary Backup (Thane Agro Mandi)',
      corridor: 'Via Kalyan Bypass Link',
      distanceKm: 72,
      eta: '4h 05m (Moderate)',
      traffic: 'MODERATE (Avg 35 km/h)',
      freshnessRisk: 'MEDIUM RISK 🟡',
      riskBadge: 'bg-amber-100 text-amber-800 border-amber-200',
      safeWindowStatus: 'Marginal Window Fit (~25 min buffer)',
      spoilageEstimate: '12% Partial Softening',
      isRecommended: false,
    },
  ];

  const handleAcceptRouteB = () => {
    acceptDriverAiRoute();
    setActiveTab('navigation');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              AI FreshRoute™ Route Optimization
            </h2>
            <p className="text-xs text-slate-500">
              Corridor evaluation blending real-time road congestion with produce decay kinetics
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('navigation')}
          className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer self-start sm:self-auto"
        >
          Back to Navigator
        </button>
      </div>

      {/* Routes Comparison Cards */}
      <div className="space-y-4">
        {routes.map((r) => (
          <div
            key={r.id}
            className={`bg-white rounded-3xl border-2 p-6 transition shadow-xs ${
              r.isRecommended
                ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                : 'border-slate-200/90'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{r.name}</h3>
                  {r.isRecommended && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                      AI RECOMMENDED ★
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{r.corridor}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${r.riskBadge}`}>
                  {r.freshnessRisk}
                </span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4 text-xs">
              <div>
                <span className="text-slate-400">Distance</span>
                <div className="text-base font-bold text-slate-900 font-mono-data mt-0.5">
                  {r.distanceKm} km
                </div>
              </div>

              <div>
                <span className="text-slate-400">Estimated Travel Time</span>
                <div className="text-base font-bold text-slate-900 font-mono-data mt-0.5">
                  {r.eta}
                </div>
              </div>

              <div>
                <span className="text-slate-400">Traffic Status</span>
                <div className="font-semibold text-slate-800 mt-0.5">{r.traffic}</div>
              </div>

              <div>
                <span className="text-slate-400">Spoilage Estimate</span>
                <div className="font-bold text-slate-900 mt-0.5">{r.spoilageEstimate}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="text-slate-600">
                Freshness Window: <strong>{r.safeWindowStatus}</strong>
              </div>

              {r.isRecommended ? (
                <button
                  onClick={handleAcceptRouteB}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{driverAcceptedAiRoute ? 'ROUTE ACTIVE' : 'ACCEPT ROUTE B'}</span>
                </button>
              ) : (
                <button
                  onClick={() => confirmReroute('market-c')}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Inspect Alternative
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
