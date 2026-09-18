import React from 'react';
import {
  AlertTriangle,
  Thermometer,
  Clock,
  Navigation,
  CheckCircle2,
  LifeBuoy,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminRiskMonitorView: React.FC = () => {
  const {
    selectedShipment,
    confirmReroute,
    simulateSensorEvent,
    activateCropRescue
  } = useApp();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Network Risk Matrix & Spoilage Early-Warning System
          </h2>
          <p className="text-xs text-slate-500">
            Continuous Arrhenius decay equation computing safe delivery thresholds
          </p>
        </div>

        <button
          onClick={() => confirmReroute('market-b')}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
        >
          Execute Network Divert
        </button>
      </div>

      {/* Spoilage Risk Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>High Risk Zone (&gt;40% Loss)</span>
          </div>
          <div className="text-xs text-slate-600">
            Current batches where estimated ETA significantly exceeds safe biological shelf-life.
          </div>
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs">
            <div className="font-bold text-slate-900">#TG102 (Tomatoes)</div>
            <div className="text-red-700 mt-0.5">ETA: 7h 20m &bull; Safe Window: 4h 30m</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
            <Clock className="w-5 h-5" />
            <span>Medium Risk Zone (10-40% Loss)</span>
          </div>
          <div className="text-xs text-slate-600">
            Batches under thermal pressure or moderate delays with tight margins.
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs">
            <div className="font-bold text-slate-900">#GP204 (Thompson Grapes)</div>
            <div className="text-amber-800 mt-0.5">ETA: 2h 45m &bull; Margin: 45 min</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Low Risk Zone (&lt;10% Loss)</span>
          </div>
          <div className="text-xs text-slate-600">
            10 consignments proceeding smoothly with verified optimal reefer temperatures.
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
            <div className="font-bold text-slate-900">10 Active Shipments</div>
            <div className="text-emerald-800 mt-0.5">All sensors reporting nominal (18-22°C)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
