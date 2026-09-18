import React, { useState } from 'react';
import {
  Navigation,
  Phone,
  Info,
  MapPin,
  Truck,
  Building,
  ShieldCheck,
  Thermometer,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BuyerLiveTrackingView: React.FC = () => {
  const {
    selectedShipment,
    shipmentProgressPct,
    isTruckArrivingSoon,
    isTruckArrived,
    setActiveTab,
    toggleGpsSimulation,
    isGpsSimulating
  } = useApp();

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);

  const isDelivered = selectedShipment.status === 'DELIVERED';
  const remainingDist = selectedShipment.remainingDistanceKm;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Incoming Produce Delivery Tracker
            </h2>
            <p className="text-xs text-slate-500">
              Vehicle MH-15-TC-4402 &bull; Driver: Vikram Shinde (+91 98811 55210)
            </p>
          </div>
        </div>

        {/* ARRIVING SOON / ARRIVED Badges */}
        <div className="flex items-center gap-2">
          {isDelivered ? (
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
              ✅ DELIVERED
            </span>
          ) : isTruckArrived ? (
            <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-black animate-bounce shadow-md">
              📍 ARRIVED AT DOCK
            </span>
          ) : isTruckArrivingSoon ? (
            <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-black animate-pulse shadow-md">
              🟢 ARRIVING SOON
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
              EN ROUTE
            </span>
          )}

          <button
            onClick={toggleGpsSimulation}
            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700"
          >
            {isGpsSimulating ? 'Pause GPS' : 'Resume GPS'}
          </button>
        </div>
      </div>

      {/* Delivery-Style Map: 🚚 Truck -> 📍 Buyer Location */}
      <div className="relative w-full h-80 sm:h-96 bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-xl flex flex-col justify-between p-5">
        {/* Road Map Grid */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="buyer-map-grid" width="35" height="35" patternUnits="userSpaceOnUse">
                <path d="M 35 0 L 0 0 0 35" fill="none" stroke="#f59e0b" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#buyer-map-grid)" />
          </svg>
        </div>

        {/* Vector Curve Highway */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-12">
          <svg className="w-full h-24 overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 100">
            <path
              d="M 60 50 Q 400 10, 740 50"
              fill="none"
              stroke="#1e293b"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M 60 50 Q 400 10, 740 50"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="800"
              strokeDashoffset={800 - (800 * (shipmentProgressPct / 100))}
              className="transition-all duration-700"
            />
          </svg>
        </div>

        {/* Top Status Indicators */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 text-white text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-amber-300 font-bold">Delivery Telemetry Active</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 text-white text-xs">
            <Thermometer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Container: 21°C (Safe 🟢)</span>
          </div>
        </div>

        {/* Delivery Track: 🚚 Truck -> 📍 Buyer Location */}
        <div className="relative z-10 flex items-center justify-between px-6 my-auto">
          {/* Moving Truck Marker */}
          <div
            className="flex flex-col items-center transition-all duration-700"
            style={{
              transform: `translateX(calc(${shipmentProgressPct * 0.15}px))`,
            }}
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500 border-2 border-white shadow-2xl flex items-center justify-center text-white">
              <Truck className="w-7 h-7 animate-pulse" />
            </div>
            <div className="mt-2 bg-slate-950 text-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-md border border-amber-500/60 font-mono shadow-xs">
              🚚 TRUCK ({remainingDist} km)
            </div>
          </div>

          {/* Buyer Dock Marker */}
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 border-2 border-white shadow-2xl flex items-center justify-center text-white">
              <MapPin className="w-7 h-7" />
            </div>
            <div className="mt-2 bg-slate-950 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md border border-slate-700 shadow-xs">
              📍 BUYER LOCATION
            </div>
            <div className="text-[10px] text-slate-400">Pune Terminal Bay 4</div>
          </div>
        </div>

        {/* Bottom Coordinates */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400">
          <span>Target Destination: Hadapsar Cold Yard Terminal</span>
          <span className="text-emerald-400 font-medium">Clear unloading bay reserved</span>
        </div>
      </div>

      {/* Large Bottom Card (Strictly Required by Prompt) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {isDelivered
                  ? '✅ Shipment Delivered and Verified'
                  : isTruckArrived
                  ? '📍 Truck Arrived at Dock'
                  : isTruckArrivingSoon
                  ? '🟢 ARRIVING SOON'
                  : '🚚 Your shipment is approaching'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tomato &bull; 1,000 kg &bull; Batch #TG102
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-sm sm:text-base font-bold text-slate-900 font-mono-data">
              {remainingDist} km away &bull; ETA: {selectedShipment.estimatedTravelTimeMinutes} minutes
            </div>
            <div className="text-xs text-emerald-700 font-semibold">
              Carrier: Vikram Shinde (MH-15-TC-4402)
            </div>
          </div>
        </div>

        {/* Progress Bar 85% style */}
        <div className="my-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>Arrival Progress</span>
            <span className="font-mono-data font-bold text-slate-900">{shipmentProgressPct}%</span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${shipmentProgressPct}%` }}
            />
          </div>
        </div>

        {/* Status text */}
        <div className="flex items-center gap-2 py-2 px-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 mb-5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            <strong>Status:</strong>{' '}
            {isDelivered
              ? 'Shipment received, inspected, and verified'
              : isTruckArrived
              ? 'Truck is at the dock gate. Proceed to QR scan & unload.'
              : isTruckArrivingSoon
              ? 'Driver is approaching your location'
              : 'Driver is on the way'}
          </span>
        </div>

        {/* 3 Buttons Mandated: View Route, Call Driver, View Produce Details */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('verification')}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            View Route
          </button>

          <button
            onClick={() => setShowCallModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>Call Driver</span>
          </button>

          <button
            onClick={() => setShowDetailsModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Info className="w-4 h-4" />
            <span>View Produce Details</span>
          </button>
        </div>
      </div>

      {/* Produce Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Produce Specifications &bull; Batch #TG102</h3>
              <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">&times;</button>
            </div>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Crop Type</span>
                <span className="font-bold text-slate-900">Tomato (Hybrid Vine Ripened)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Dispatched Quantity</span>
                <span className="font-bold text-slate-900">1,000 kg (Tare certified 998 kg)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Dispatch Quality Grade</span>
                <span className="font-bold text-emerald-700">Grade A Premium</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Farm of Origin</span>
                <span className="font-bold text-slate-900">Sahyadri Valley FPO, Nashik</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Tamper Seal</span>
                <span className="font-bold text-emerald-700">#SEAL-9921-IN (INTACT)</span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Driver Modal */}
      {showCallModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-3">
              <Phone className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Contacting Driver</h3>
            <p className="text-xs text-slate-500 mt-1">Vikram Shinde &bull; MH-15-TC-4402</p>
            <div className="text-lg font-bold text-slate-900 font-mono my-3">+91 98811 55210</div>
            <button
              onClick={() => setShowCallModal(false)}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition cursor-pointer"
            >
              End Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
