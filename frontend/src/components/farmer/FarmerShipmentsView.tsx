import React from 'react';
import {
  Package,
  Navigation,
  Sparkles,
  PlusCircle,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck
  ,Truck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatShipmentStatus } from '../../utils/statusLabels';

export const FarmerShipmentsView: React.FC = () => {
  const {
    shipments,
    selectedShipmentId,
    setSelectedShipmentId,
    setActiveTab,
    openCreateShipmentModal
  } = useApp();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            My Dispatched Shipments
          </h2>
          <p className="text-xs text-slate-500">
            Active farm batches, digital chain of custody status, and real-time delivery timelines
          </p>
        </div>

        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          <button onClick={() => setActiveTab('transport-quotes')} className="flex min-h-10 items-center gap-2 rounded-md border border-emerald-700 px-3 text-xs font-bold text-emerald-800 hover:bg-emerald-50"><Truck className="h-4 w-4" /><span>Vehicle rates</span></button>
          <button
            onClick={openCreateShipmentModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Shipment</span>
          </button>
        </div>
      </div>

      {/* Shipments Cards List */}
      <div className="space-y-3">
        {shipments.map((s) => {
          const isSelected = s.id === selectedShipmentId;
          const isAtRisk = s.status === 'AT_RISK' || s.status === 'RESCUE_ACTIVE';
          const isDelivered = s.status === 'DELIVERED';

          return (
            <div
              key={s.id}
              onClick={() => setSelectedShipmentId(s.id)}
              className={`bg-white rounded-3xl border-2 p-5 transition cursor-pointer hover:shadow-md ${
                isSelected
                  ? 'border-emerald-500 shadow-xs ring-1 ring-emerald-500/20'
                  : 'border-slate-200/90'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isDelivered
                      ? 'bg-emerald-100 text-emerald-800'
                      : isAtRisk
                      ? 'bg-red-100 text-red-700 animate-pulse'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {s.batch.id}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {s.batch.cropType} &bull; {s.batch.quantityKg} kg
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isDelivered
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : isAtRisk
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}>
                        {formatShipmentStatus(s.status)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Carrier: {s.driverName} ({s.vehicleNumber}) &bull; Seal: {s.batch.tamperSealId}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right text-xs">
                    <div className="font-bold text-slate-900">
                      {s.remainingDistanceKm} km left
                    </div>
                    <div className="text-[11px] text-slate-400">
                      ETA: {s.estimatedTravelTimeMinutes}m
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedShipmentId(s.id);
                      setActiveTab('tracking');
                    }}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    <Navigation className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
                <div>
                  <span className="text-slate-400">Destination:</span>
                  <div className="font-semibold text-slate-900 truncate">
                    {s.currentDestinationName}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Freshness Score:</span>
                  <div className="font-bold text-emerald-700 font-mono">
                    {s.freshnessScore}/100
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Safe Window:</span>
                  <div className="font-medium text-slate-800">
                    ~{Math.round(s.safeSellingWindowHours)} hours
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Seal Status:</span>
                  <div className="font-bold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>INTACT</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
