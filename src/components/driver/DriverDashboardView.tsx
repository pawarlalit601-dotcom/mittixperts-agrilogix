import React from 'react';
import {
  Truck,
  Package,
  Navigation,
  Sparkles,
  Thermometer,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  MapPin
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DriverDashboardView: React.FC = () => {
  const {
    selectedShipment,
    setActiveTab,
    isGpsSimulating,
    shipmentProgressPct,
    driverAcceptedAiRoute
  } = useApp();

  const isAtRisk = selectedShipment.status === 'AT_RISK' || selectedShipment.status === 'RESCUE_ACTIVE';
  const currentTemp = selectedShipment.sensorHistory.length > 0
    ? selectedShipment.sensorHistory[selectedShipment.sensorHistory.length - 1].temperatureC
    : 24;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Driver Operations &bull; Vikram Shinde
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold border border-blue-200">
              MH-15-TC-4402 (Refrigerated)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Active cargo transit guidance, refrigerated sensor telemetry, and AI detour navigation
          </p>
        </div>

        <button
          onClick={() => setActiveTab('navigation')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Navigation className="w-4 h-4" />
          <span>Open Navigator</span>
        </button>
      </div>

      {/* Today's Active Trip Card (Strictly Required by Prompt) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-mono font-bold">
                Trip #TG102
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Today's Assigned Trip
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Produce: <strong className="text-slate-800">Tomato — 1,000 kg</strong> (Certified Tare: 998 kg)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              selectedShipment.status === 'DELIVERED'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : isAtRisk
                ? 'bg-red-100 text-red-800 border-red-300 animate-pulse'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {selectedShipment.status === 'DELIVERED' ? 'Completed ✅' : 'Active 🟢'}
            </span>
          </div>
        </div>

        {/* Trip Logistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-5 py-2">
          <div>
            <div className="text-xs text-slate-400 font-medium">Pickup</div>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              Nashik Farm Gate
            </div>
            <div className="text-[11px] text-slate-500">Departed: 09:15 AM</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Destination</div>
            <div className="text-base font-bold text-slate-900 mt-0.5 truncate">
              {selectedShipment.currentDestinationName || 'Pune Market'}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium">
              {driverAcceptedAiRoute ? 'AI Rerouted via SH-44' : 'Primary Corridor'}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">ETA</div>
            <div className="text-base font-bold text-slate-900 mt-0.5 font-mono-data">
              {Math.floor(selectedShipment.estimatedTravelTimeMinutes / 60)}h {selectedShipment.estimatedTravelTimeMinutes % 60}m
            </div>
            <div className="text-[11px] text-slate-500">
              {selectedShipment.remainingDistanceKm} km left
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Reefer Container</div>
            <div className="text-base font-bold text-slate-900 mt-0.5 font-mono-data flex items-center gap-1">
              <Thermometer className={`w-4 h-4 ${currentTemp > 28 ? 'text-red-500' : 'text-emerald-600'}`} />
              <span>{currentTemp}°C</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-medium">Seal #9921 INTACT</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="my-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-medium">
            <span>Trip Progress</span>
            <span className="font-mono-data font-bold text-slate-900">{shipmentProgressPct}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isAtRisk ? 'bg-red-500' : 'bg-blue-600'
              }`}
              style={{ width: `${shipmentProgressPct}%` }}
            />
          </div>
        </div>

        {/* Action Button: START TRIP */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Speed: <strong className="text-slate-900">{selectedShipment.currentSpeedKmh || 45} km/h</strong> &bull; GPS: Optimal Lock
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('sensors')}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              Sensor Status
            </button>

            <button
              id="start-trip-btn"
              onClick={() => setActiveTab('navigation')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START TRIP</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Driver Support Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab('navigation')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 transition cursor-pointer shadow-xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2">
            <Navigation className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
            Live Navigation & Guidance
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Turn-by-turn road guidance avoiding severe bottlenecks and mountain pass jams.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('freshroute')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 transition cursor-pointer shadow-xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
            AI FreshRoute™ Advice
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Automatic calculation of lowest spoilage risk corridor when road conditions change.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('sensors')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 transition cursor-pointer shadow-xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-2">
            <Thermometer className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition">
            Sensor Telemetry
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Live refrigerated cargo temperature, humidity, and route health monitoring.
          </p>
        </div>
      </div>
    </div>
  );
};
