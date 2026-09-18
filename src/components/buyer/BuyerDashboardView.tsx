import React from 'react';
import {
  Store,
  Package,
  Navigation,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BuyerDashboardView: React.FC = () => {
  const {
    selectedShipment,
    setActiveTab,
    shipmentProgressPct,
    isTruckArrivingSoon,
    isTruckArrived
  } = useApp();

  const isDelivered = selectedShipment.status === 'DELIVERED';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Buyer Procurement Terminal &bull; Sunil Rao
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200">
              FreshMart Regional Hub (Pune)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor approaching farm consignments, inspect dock arrivals, and verify tamper seals
          </p>
        </div>

        <button
          onClick={() => setActiveTab('receiving')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Open Receiving Dock</span>
        </button>
      </div>

      {/* Incoming Shipment Card Strictly Required by Prompt */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-mono font-bold">
                Batch #TG102
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Incoming Shipment
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Produce: <strong className="text-slate-800">Tomato — 1,000 kg</strong> &bull; From: <strong className="text-slate-800">Nashik Farm</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              isDelivered
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : isTruckArrived
                ? 'bg-blue-100 text-blue-800 border-blue-300'
                : isTruckArrivingSoon
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {isDelivered
                ? 'Delivered ✅'
                : isTruckArrived
                ? 'At Dock 📍'
                : isTruckArrivingSoon
                ? 'ARRIVING SOON 🟢'
                : 'On the way 🟢'}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-5 py-2">
          <div>
            <div className="text-xs text-slate-400 font-medium">Origin Farm</div>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              Sahyadri Agro Hub
            </div>
            <div className="text-[11px] text-slate-500">Nashik Valley District</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">ETA</div>
            <div className="text-base font-bold text-slate-900 mt-0.5 font-mono-data">
              {selectedShipment.estimatedTravelTimeMinutes} min
            </div>
            <div className="text-[11px] text-emerald-700 font-medium">
              {selectedShipment.remainingDistanceKm} km away
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Freshness</div>
            <div className="text-base font-bold text-emerald-700 mt-0.5 font-mono-data">
              {selectedShipment.freshnessScore}%
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">
              Spoilage Risk: {selectedShipment.spoilageRisk}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Tamper Seal</div>
            <div className="text-base font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>INTACT</span>
            </div>
            <div className="text-[11px] text-slate-500">#SEAL-9921-IN</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="my-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-medium">
            <span>En Route Progress</span>
            <span className="font-mono-data font-bold text-slate-900">{shipmentProgressPct}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${shipmentProgressPct}%` }}
            />
          </div>
        </div>

        {/* Status Line & TRACK TRUCK Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>
              Status: <strong className="text-slate-900">{isDelivered ? 'Shipment Received and Verified' : 'Driver is on the way'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('verification')}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              Verify QR
            </button>

            <button
              id="buyer-track-truck-btn"
              onClick={() => setActiveTab('tracking')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>TRACK TRUCK</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Quick Buyer Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab('tracking')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-amber-300 transition cursor-pointer shadow-xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2">
            <Navigation className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition">
            Delivery-Style Live Tracking
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Watch the refrigerated truck approach your bay with real-time ETA countdown.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('receiving')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-amber-300 transition cursor-pointer shadow-xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
            Dock Receiving & Quality Handover
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Inspect weight, grade quality, confirm tamper seal, and accept shipment.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('disputes')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-amber-300 transition cursor-pointer shadow-xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
            Dispute Evidence & Audit Log
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Review neutral sensor data and loading records to resolve quality claims without conflict.
          </p>
        </div>
      </div>
    </div>
  );
};
