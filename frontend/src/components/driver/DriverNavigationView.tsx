import React, { useState } from 'react';
import {
  Compass,
  Navigation,
  ArrowUpRight,
  ArrowRight,
  Phone,
  Layers,
  MapPin,
  Truck,
  Volume2,
  Maximize2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GoogleLiveMap } from '../GoogleLiveMap';
import { WeatherTracker } from '../WeatherTracker';

export const DriverNavigationView: React.FC = () => {
  const {
    selectedShipment,
    isDriverNavigating,
    setIsDriverNavigating,
    driverAcceptedAiRoute,
    shipmentProgressPct,
    simulateSensorEvent
  } = useApp();

  const [navigationStarted, setNavigationStarted] = useState(false);
  const [voiceGuidanceMuted, setVoiceGuidanceMuted] = useState(false);
  const [navMapMode, setNavMapMode] = useState<'google' | 'hud'>('google');

  const isAtRisk = selectedShipment.status === 'AT_RISK' || selectedShipment.status === 'RESCUE_ACTIVE';

  const handleStartNav = () => {
    setNavigationStarted(true);
    setIsDriverNavigating(true);
  };

  return (
    <div className="space-y-5">
      {/* Large Turn-by-Turn Guidance Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
            <ArrowUpRight className="w-8 h-8 font-black stroke-[3]" />
          </div>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
              ACTIVE DESTINATION
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
              {selectedShipment.currentDestinationName || 'Assigned shipment destination'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose a Google route below to compare traffic ETA and freshness window.
            </p>
          </div>
        </div>

        <button
          onClick={() => setVoiceGuidanceMuted(!voiceGuidanceMuted)}
          className={`p-3 rounded-2xl border transition cursor-pointer hidden sm:flex items-center justify-center ${
            voiceGuidanceMuted
              ? 'bg-slate-800 border-slate-700 text-slate-500'
              : 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400'
          }`}
          title="Toggle Voice Guidance"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Map Engine Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">Display View:</span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setNavMapMode('google')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                navMapMode === 'google' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🗺️ Google Maps Navigation HUD</span>
            </button>
            <button
              onClick={() => setNavMapMode('hud')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                navMapMode === 'hud' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🧭 Vector Radar HUD</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time Live Telemetry Connected</span>
        </div>
      </div>

      {/* Map-First View Canvas */}
      {navMapMode === 'google' ? (
        <GoogleLiveMap height="h-[420px]" />
      ) : (
        <div className="relative w-full h-[400px] sm:h-[460px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-xl flex flex-col justify-between p-5">
        {/* Navigation Map Grid Simulation */}
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="nav-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#38bdf8" strokeWidth="0.4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#nav-grid)" />
          </svg>
        </div>

        {/* Dynamic Curved Vector Route */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-12">
          <svg className="w-full h-32 overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 120">
            <path
              d="M 60 60 C 250 10, 500 110, 740 60"
              fill="none"
              stroke="#1e293b"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M 60 60 C 250 10, 500 110, 740 60"
              fill="none"
              stroke={isAtRisk ? '#ef4444' : '#3b82f6'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="800"
              strokeDashoffset={800 - (800 * (shipmentProgressPct / 100))}
              className="transition-all duration-700"
            />
          </svg>
        </div>

        {/* Floating Top Nav Metrics */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700 text-white text-xs">
            <Compass className="w-4 h-4 text-emerald-400 animate-spin" />
            <span className="font-bold">Heading South-East (142°)</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700 text-white text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">Traffic:</span>
              <span className="font-bold text-emerald-400">
                Live traffic is shown on Google Maps
            </span>
          </div>
        </div>

        {/* Center Moving Vehicle on Nav Route */}
        <div className="relative z-10 flex items-center justify-between px-6 my-auto">
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold">
              ORIGIN
            </div>
            <span className="text-[10px] text-slate-400">Nashik</span>
          </div>

          {/* Active GPS Position Marker */}
          <div
            className="flex flex-col items-center transition-all duration-700"
            style={{
              transform: `translateX(calc(${shipmentProgressPct * 0.1 - 5}px))`,
            }}
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-600 border-2 border-white shadow-2xl flex items-center justify-center text-white">
              <Truck className="w-7 h-7 animate-pulse" />
            </div>
            <div className="mt-2 bg-slate-900 text-blue-300 text-[11px] font-bold px-2 py-0.5 rounded-md border border-slate-700 font-mono">
              MH-15-TC-4402
            </div>
          </div>

          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 border border-emerald-400 flex items-center justify-center text-white text-xs font-bold">
              DEST
            </div>
            <span className="text-[10px] text-slate-400">
              {selectedShipment.currentDestinationName || 'Destination'}
            </span>
          </div>
        </div>

        {/* Floating Bottom HUD: Speed, Distance, ETA, Traffic */}
        <div className="relative z-10 bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 border border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-white">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Current Speed</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-0.5">
              {selectedShipment.currentSpeedKmh || 45} <span className="text-xs text-slate-300 font-normal">km/h</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Remaining Distance</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white mt-0.5">
              {selectedShipment.remainingDistanceKm} <span className="text-xs text-slate-300 font-normal">km</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Estimated Arrival</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white mt-0.5">
              {Math.floor(selectedShipment.estimatedTravelTimeMinutes / 60)}h {selectedShipment.estimatedTravelTimeMinutes % 60}m
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Traffic Indicator</div>
            <div className="text-sm font-bold mt-1.5 flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isAtRisk ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
              <span className={isAtRisk ? 'text-red-400' : 'text-emerald-400'}>
                {isAtRisk ? 'Freshness attention' : 'Route active'}
              </span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Real-time Highway Micro-Climate Weather Tracker */}
      <WeatherTracker />

      {/* Button: START NAVIGATION */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="text-xs text-slate-500">
          Navigation state: <strong className="text-slate-900">{navigationStarted ? 'ACTIVE &bull; Turn-by-Turn GPS Active' : 'STANDBY'}</strong>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => simulateSensorEvent('traffic_jam')}
            className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 cursor-pointer"
          >
            Trigger Traffic Simulation 🚦
          </button>

          <button
            id="start-navigation-btn"
            onClick={handleStartNav}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>{navigationStarted ? 'NAVIGATION RUNNING' : 'START NAVIGATION'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
