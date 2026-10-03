import React from 'react';
import {
  Package,
  Navigation,
  Clock,
  MapPin,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatShipmentStatus } from '../../utils/statusLabels';

export const DriverMyTripsView: React.FC = () => {
  const { shipments, setSelectedShipmentId, setActiveTab } = useApp();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            My Assigned Logistics Trips
          </h2>
          <p className="text-xs text-slate-500">
            Assigned reefer freight schedules, route corridors, and delivery receipts
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {shipments.map((s) => (
          <div
            key={s.id}
            onClick={() => {
              setSelectedShipmentId(s.id);
              setActiveTab('navigation');
            }}
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-400 transition cursor-pointer shadow-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  {s.trackingNumber}
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {s.batch.cropType} ({s.batch.quantityKg} kg)
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {formatShipmentStatus(s.status)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
              <div>
                <span className="text-slate-400">Pickup</span>
                <div className="font-semibold text-slate-800 truncate">{s.originName}</div>
              </div>
              <div>
                <span className="text-slate-400">Destination</span>
                <div className="font-semibold text-slate-800 truncate">{s.currentDestinationName}</div>
              </div>
              <div>
                <span className="text-slate-400">Remaining</span>
                <div className="font-bold text-slate-900 font-mono-data">{s.remainingDistanceKm} km</div>
              </div>
              <div>
                <span className="text-slate-400">Action</span>
                <div className="text-blue-600 font-bold flex items-center gap-1">
                  <span>Open Nav &rarr;</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
