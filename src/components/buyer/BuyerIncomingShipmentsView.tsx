import React from 'react';
import {
  Package,
  Navigation,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BuyerIncomingShipmentsView: React.FC = () => {
  const { shipments, setSelectedShipmentId, setActiveTab } = useApp();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Incoming Produce Shipments
          </h2>
          <p className="text-xs text-slate-500">
            Current farm freight inbound to Pune Regional Procurement Terminal
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {shipments.map((s) => (
          <div
            key={s.id}
            onClick={() => {
              setSelectedShipmentId(s.id);
              setActiveTab('tracking');
            }}
            className="bg-white rounded-3xl border border-slate-200 p-5 hover:border-amber-400 transition cursor-pointer shadow-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                  {s.trackingNumber}
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {s.batch.cropType} &bull; {s.batch.quantityKg} kg
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {s.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
              <div>
                <span className="text-slate-400">Origin</span>
                <div className="font-semibold text-slate-800 truncate">{s.originName}</div>
              </div>
              <div>
                <span className="text-slate-400">ETA</span>
                <div className="font-bold text-slate-900 font-mono-data">{s.estimatedTravelTimeMinutes} min ({s.remainingDistanceKm} km)</div>
              </div>
              <div>
                <span className="text-slate-400">Freshness</span>
                <div className="font-bold text-emerald-700 font-mono">{s.freshnessScore}%</div>
              </div>
              <div>
                <span className="text-slate-400">Action</span>
                <div className="text-amber-600 font-bold">Track Truck &rarr;</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
