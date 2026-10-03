import React, { useState } from 'react';
import {
  Navigation,
  Phone,
  Info,
  Layers,
  Sparkles,
  MapPin,
  Truck,
  Building,
  ShieldCheck,
  Thermometer,
  Clock,
  Play,
  Pause,
  AlertTriangle,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GoogleLiveMap } from '../GoogleLiveMap';
import { WeatherTracker } from '../WeatherTracker';

export const FarmerLiveTrackingView: React.FC = () => {
  const {
    selectedShipment,
    isGpsSimulating,
    toggleGpsSimulation,
    shipmentProgressPct,
    isTruckArrivingSoon,
    isTruckArrived,
    setActiveTab,
    simulateSensorEvent
  } = useApp();

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [viewMode, setViewMode] = useState<'GOOGLE_MAPS' | 'SCHEMATIC'>('GOOGLE_MAPS');

  const currentTemp = selectedShipment.sensorHistory.length > 0 
    ? selectedShipment.sensorHistory[selectedShipment.sensorHistory.length - 1].temperatureC 
    : 24;

  const isAtRisk = selectedShipment.status === 'AT_RISK' || selectedShipment.status === 'RESCUE_ACTIVE';

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Shipment Tracking & Telemetry
            </h2>
            <p className="text-xs text-slate-500">
              Vehicle MH-15-TC-4402 • Driver: Vikram Shinde (+91 98811 55210)
            </p>
          </div>
        </div>

        {/* Trip progression simulation control */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            <span className={`w-2 h-2 rounded-full ${isGpsSimulating ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
            <span>{isGpsSimulating ? 'GPS simulation running' : 'GPS simulation paused'}</span>
            <button
              onClick={toggleGpsSimulation}
              className="ml-1 px-2 py-0.5 rounded bg-white border border-slate-300 hover:bg-slate-50 text-[11px] font-bold cursor-pointer"
            >
              {isGpsSimulating ? 'Pause' : 'Resume'}
            </button>
          </div>

          <button
            onClick={() => simulateSensorEvent('traffic_jam')}
            title="Simulate Highway Traffic"
            className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold cursor-pointer"
          >
            🚦 Jam
          </button>
        </div>
      </div>

      {/* Map View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">Map Engine:</span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('GOOGLE_MAPS')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'GOOGLE_MAPS' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🗺️ Google Maps + Traffic</span>
            </button>
            <button
              onClick={() => setViewMode('SCHEMATIC')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'SCHEMATIC' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🚚 Schematic Flow</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Google Maps</span>
        </div>
      </div>

      {/* Interactive Delivery Map Area */}
      {viewMode === 'GOOGLE_MAPS' ? (
        <GoogleLiveMap height="h-96 sm:h-[420px]" />
      ) : (
        <div className="relative w-full h-96 sm:h-[420px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-lg flex flex-col justify-between p-5">
          {/* Map Background Grid & Roads Representation */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="road-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6ee7b7" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#road-grid)" />
            </svg>
          </div>

          {/* Route Line SVG Graphic */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-8 sm:px-16">
            <svg className="w-full h-24 overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 100">
              {/* Base Route Path */}
              <path
                d="M 50 50 Q 250 15, 450 65 T 750 50"
                fill="none"
                stroke="#334155"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Traveled Active Path */}
              <path
                d="M 50 50 Q 250 15, 450 65 T 750 50"
                fill="none"
                stroke={isAtRisk ? '#ef4444' : '#10b981'}
                strokeWidth="8"
                strokeDasharray="800"
                strokeDashoffset={800 - (800 * (shipmentProgressPct / 100))}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
          </div>

          {/* Top Map Overlays */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-white text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-emerald-300 font-bold">GPS: 19.9975° N, 73.7898° E</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-300">{selectedShipment.currentSpeedKmh || 45} km/h</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-white text-xs">
              <Thermometer className={`w-3.5 h-3.5 ${currentTemp > 28 ? 'text-red-400 animate-bounce' : 'text-emerald-400'}`} />
              <span className="font-bold">{currentTemp}°C</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-300">Humidity: 68%</span>
            </div>
          </div>

          {/* Dynamic Spatial Landmarks on Route: FARM -> TRUCK -> BUYER */}
          <div className="relative z-10 flex items-center justify-between px-2 sm:px-6 my-auto">
            {/* Farm Origin Marker */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="mt-2 bg-slate-950/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-md border border-slate-700">
                FARM
              </div>
              <div className="text-[10px] text-slate-400 max-w-[90px] truncate">Sahyadri Valley</div>
            </div>

            {/* Moving Truck Marker */}
            <div
              className="flex flex-col items-center text-center transition-all duration-700"
              style={{
                transform: `translateX(calc(${shipmentProgressPct * 0.15 - 8}px))`,
              }}
            >
              <div className={`w-14 h-14 rounded-2xl border-2 border-white shadow-2xl flex items-center justify-center text-white ${
                isAtRisk ? 'bg-red-600 animate-pulse' : 'bg-emerald-500'
              }`}>
                <Truck className="w-7 h-7 animate-pulse" />
              </div>
              <div className="mt-2 bg-emerald-950 text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-md border border-emerald-500/50 flex items-center gap-1 shadow-xs">
                <span>🚚 MOVING TRUCK</span>
              </div>
              <div className="text-[10px] text-emerald-200 font-mono mt-0.5">
                {selectedShipment.remainingDistanceKm} km left
              </div>
            </div>

            {/* Destination Market Marker */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 border-2 border-white shadow-lg flex items-center justify-center text-white">
                <Building className="w-6 h-6" />
              </div>
              <div className="mt-2 bg-slate-950/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-md border border-slate-700">
                BUYER / MARKET
              </div>
              <div className="text-[10px] text-slate-400 max-w-[100px] truncate">
                {selectedShipment.currentDestinationName || 'Pune APMC'}
              </div>
            </div>
          </div>

          {/* Map Status Footer Bar */}
          <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400">
            <div>Route: NH-160 &bull; Smooth Asphalt &bull; Cloud Cover: 20%</div>
            <div className="text-emerald-400 font-medium">GPS Signal: EXCELLENT (9 satellites locked)</div>
          </div>
        </div>
      )}

      {/* Real Live Weather Tracking Telemetry */}
      <WeatherTracker />

      {/* Large Bottom Card (Specified in Prompt Requirements) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {selectedShipment.status === 'DELIVERED'
                    ? '✅ Shipment Delivered & Accepted'
                    : isTruckArrived
                    ? '📍 Truck Arrived at Dock'
                    : isTruckArrivingSoon
                    ? '🟢 Arriving Soon at Dock'
                    : '🚚 Your shipment is on the way'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tomato &bull; 1,000 kg &bull; Batch #TG102
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-right">
            <div>
              <div className="text-xs font-bold text-slate-900">
                {selectedShipment.remainingDistanceKm} km away &bull; ETA: {selectedShipment.estimatedTravelTimeMinutes} minutes
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold">
                Destination: {selectedShipment.currentDestinationName || 'Pune Market'}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar with 80% style representation */}
        <div className="my-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>Trip Progress</span>
            <span className="font-mono-data font-bold text-slate-900">{shipmentProgressPct}%</span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isAtRisk ? 'bg-red-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${shipmentProgressPct}%` }}
            />
          </div>
        </div>

        {/* Status Line */}
        <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 mb-5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            <strong>Status:</strong>{' '}
            {selectedShipment.status === 'DELIVERED'
              ? 'Delivery completed and verified by buyer'
              : isTruckArrived
              ? 'Truck is at the dock. Unloading ready.'
              : isTruckArrivingSoon
              ? 'Driver is approaching the destination'
              : 'Driver is on the way'}
          </span>
        </div>

        {/* 3 Mandated Action Buttons: View Route, Call Driver, Shipment Details */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('freshness')}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            View Route
          </button>

          <button
            onClick={() => setShowCallModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>Call Driver</span>
          </button>

          <button
            onClick={() => setShowDetailsModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Info className="w-4 h-4" />
            <span>Shipment Details</span>
          </button>
        </div>
      </div>

      {/* Modal: Shipment Details */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Shipment Details &bull; #TG102</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Crop Batch</span>
                <span className="font-bold text-slate-900">Tomato Hybrid Premium (1,000 kg)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Certified Weight</span>
                <span className="font-bold text-slate-900">998 kg at Weighbridge</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Tamper Seal</span>
                <span className="font-bold text-emerald-700">#SEAL-9921-IN (INTACT)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Refrigeration</span>
                <span className="font-bold text-slate-900">Active Reefer (18°C setpoint)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Origin</span>
                <span className="font-bold text-slate-900">Sahyadri Valley Farm Gate</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Assigned Driver</span>
                <span className="font-bold text-slate-900">Vikram Shinde (MH-15-TC-4402)</span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Call Driver */}
      {showCallModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
              <Phone className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Contacting Driver</h3>
            <p className="text-xs text-slate-500 mt-1">Vikram Shinde &bull; MH-15-TC-4402</p>
            <div className="text-lg font-bold text-slate-900 font-mono my-3">+91 98811 55210</div>
            <p className="text-[11px] text-slate-400 mb-5">
              Hands-free in-cabin speakerphone active. Drive safety protocol enabled.
            </p>
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
