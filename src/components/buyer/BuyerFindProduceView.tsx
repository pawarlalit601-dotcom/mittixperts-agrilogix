import React from 'react';
import {
  Store,
  MapPin,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BuyerFindProduceView: React.FC = () => {
  const { smartMarkets = [], confirmReroute, setActiveTab } = useApp();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Procure Verified Farm Batches
          </h2>
          <p className="text-xs text-slate-500">
            Connect directly with verified farm gates and rerouted high-freshness transit batches
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(smartMarkets || []).map((m) => (
          <div key={m.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {m.distanceKm} km away
                </span>
                <span className="font-mono text-base font-black text-slate-900">
                  ₹{m.currentPricePerKg}/kg
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base mt-2">{m.name}</h3>
              <p className="text-xs text-slate-500">{m.location}</p>
              <div className="mt-3 text-xs text-slate-600 space-y-1">
                <div>Demand Capacity: <strong>{m.demandKg} kg</strong></div>
                <div>ETA Corridor: <strong>{m.estimatedTravelTimeMinutes} minutes</strong></div>
                <div>Freshness Match: <strong className="text-emerald-700">{m.freshnessScore}%</strong></div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  confirmReroute(m.id);
                  setActiveTab('tracking');
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition"
              >
                Contract Offtake
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
