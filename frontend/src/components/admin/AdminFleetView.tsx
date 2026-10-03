import React from 'react';
import {
  Truck,
  MapPin,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatShipmentStatus } from '../../utils/statusLabels';

export const AdminFleetView: React.FC = () => {
  const { shipments, setSelectedShipmentId, setActiveTab } = useApp();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Active Fleet Roster & Carrier Manifests
          </h2>
          <p className="text-xs text-slate-500">
            Shipment and vehicle records with simulated location and temperature telemetry in this preview
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shipments.map((s) => {
          const isAtRisk = s.status === 'AT_RISK' || s.status === 'RESCUE_ACTIVE';
          const isDelivered = s.status === 'DELIVERED';

          return (
            <div
              key={s.id}
              onClick={() => setSelectedShipmentId(s.id)}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      {s.vehicleNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {s.driverName}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isDelivered
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : isAtRisk
                      ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                      : 'bg-blue-50 text-blue-800 border-blue-200'
                  }`}>
                    {formatShipmentStatus(s.status)}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cargo:</span>
                    <span className="font-bold text-slate-900">{s.batch.cropType} ({s.batch.quantityKg} kg)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Destination:</span>
                    <span className="font-medium text-slate-800 truncate">{s.currentDestinationName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Freshness Score:</span>
                    <span className="font-bold text-emerald-700 font-mono">{s.freshnessScore}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ETA / Distance:</span>
                    <span className="font-mono text-slate-900">{s.estimatedTravelTimeMinutes}m ({s.remainingDistanceKm} km)</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono">Seal: {s.batch.tamperSealId}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedShipmentId(s.id);
                    setActiveTab('risk');
                  }}
                  className="text-purple-600 font-bold hover:underline"
                >
                  Review Route Advisory &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
