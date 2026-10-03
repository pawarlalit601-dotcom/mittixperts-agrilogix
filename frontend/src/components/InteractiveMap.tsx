import React, { useState } from 'react';
import { 
  Navigation, 
  MapPin, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  Compass, 
  Thermometer, 
  Gauge, 
  CheckCircle2,
  Maximize2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Market } from '../types';
import { GoogleLiveMap } from './GoogleLiveMap';

export const InteractiveMap: React.FC<{
  onSelectMarket?: (market: Market) => void;
  highlightRouteId?: string;
}> = ({ onSelectMarket }) => {
  const { 
    selectedShipment, 
    markets, 
    isGpsSimulating, 
    toggleGpsSimulation,
    confirmReroute 
  } = useApp();

  const [mapEngine, setMapEngine] = useState<'google' | 'schematic'>('google');
  const [mapLayer, setMapLayer] = useState<'traffic' | 'satellite' | 'freshness'>('traffic');
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  const isRerouted = selectedShipment.status === 'REROUTED' || selectedShipment.status === 'DELIVERED';
  const isRescueActive = selectedShipment.status === 'RESCUE_ACTIVE' || selectedShipment.status === 'AT_RISK';

  // Coordinate projector from lat/lng to SVG viewport (800 x 480)
  // Nashik: 19.9975, 73.7898 -> (x: 160, y: 80)
  // Kasara Ghat: 19.45, 73.40 -> (x: 320, y: 220)
  // Thane: 19.2183, 72.9781 -> (x: 480, y: 310)
  // Mumbai APMC: 19.076, 72.8777 -> (x: 580, y: 370)
  // Pune: 18.5204, 73.8567 -> (x: 680, y: 190)

  // Truck current position interpolation
  const truckPos = isRerouted 
    ? { x: 510, y: 200 } // Diverted toward Pune on SH-44
    : { x: 340, y: 215 }; // At Kasara Ghat congestion

  return (
    <div className="space-y-3">
      {/* Top Map Engine Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs text-xs">
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Map Display Engine:</span>
          </span>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setMapEngine('google')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                mapEngine === 'google'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🗺️ Google Maps (Satellite & Traffic)</span>
            </button>
            <button
              onClick={() => setMapEngine('schematic')}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                mapEngine === 'schematic'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📐 Schematic Matrix</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Google Maps</span>
        </div>
      </div>

      {mapEngine === 'google' ? (
        <GoogleLiveMap onSelectMarket={onSelectMarket} />
      ) : (
        <div id="interactive-map-container" className="relative w-full bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800 text-white">
          {/* Top Map HUD Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Live GPS Badge */}
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 shadow-md">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isGpsSimulating ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isGpsSimulating ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-xs font-semibold tracking-wide uppercase text-slate-200">
              {isGpsSimulating ? 'GPS SIMULATION RUNNING' : 'GPS SIMULATION PAUSED'}
            </span>
          </div>

          <button
            id="toggle-gps-mode-btn"
            onClick={toggleGpsSimulation}
            className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 ml-1 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 transition cursor-pointer"
          >
            {isGpsSimulating ? 'Pause movement' : 'Resume movement'}
          </button>
        </div>

        {/* Dynamic Telemetry Pill */}
        <div className="flex items-center gap-3 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs shadow-md">
          <div className="flex items-center gap-1 text-slate-300">
            <Gauge className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold text-white font-mono-data">{selectedShipment.currentSpeedKmh} km/h</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="flex items-center gap-1">
            <Thermometer className={`w-3.5 h-3.5 ${selectedShipment.freshnessScore < 70 ? 'text-red-400' : 'text-emerald-400'}`} />
            <span className={`font-semibold font-mono-data ${selectedShipment.freshnessScore < 70 ? 'text-red-300' : 'text-emerald-300'}`}>
              {selectedShipment.sensorHistory[selectedShipment.sensorHistory.length - 1]?.temperatureC || 24}°C
            </span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="text-slate-300 font-mono-data">
            ETA: <span className="text-white font-semibold">{Math.floor(selectedShipment.estimatedTravelTimeMinutes / 60)}h {selectedShipment.estimatedTravelTimeMinutes % 60}m</span>
          </div>
        </div>

        {/* Map Layer Selector */}
        <div className="hidden sm:flex items-center bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700 pointer-events-auto text-xs">
          <button
            onClick={() => setMapLayer('traffic')}
            className={`px-2.5 py-1 rounded-lg transition font-medium cursor-pointer ${
              mapLayer === 'traffic' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Traffic Flow
          </button>
          <button
            onClick={() => setMapLayer('freshness')}
            className={`px-2.5 py-1 rounded-lg transition font-medium cursor-pointer ${
              mapLayer === 'freshness' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            FreshRoute™ Overlay
          </button>
        </div>
      </div>

      {/* Main SVG Interactive Map Canvas */}
      <div className="w-full h-[400px] sm:h-[460px] relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
        <svg 
          viewBox="0 0 800 480" 
          className="w-full h-full select-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" />
            </pattern>

            {/* Pulsing radar gradient */}
            <radialGradient id="pulse-grad">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>

            {/* Gradient for fresh rescue route */}
            <linearGradient id="fresh-route-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* Gradient for congested route */}
            <linearGradient id="congested-route-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
          </defs>

          {/* Background Grid */}
          <rect width="800" height="480" fill="url(#grid-pattern)" opacity="0.8" />

          {/* Regional Terrain Outlines (Stylized Maharashtra Agri Corridor) */}
          <path
            d="M 60,60 Q 200,20 400,50 T 750,100 Q 770,300 700,430 T 450,450 Q 150,420 50,300 Z"
            fill="#0f172a"
            stroke="#334155"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.5"
          />

          {/* Mountain / Ghat Zone Hatching (Kasara Ghat Bottleneck) */}
          <g opacity="0.35">
            <path d="M 280,170 L 330,230 L 290,260 Z" fill="#334155" />
            <path d="M 320,180 L 365,245 L 340,270 Z" fill="#334155" />
            <text x="285" y="160" fill="#94a3b8" fontSize="10" fontWeight="600" letterSpacing="0.05em">
              KASARA GHAT ESCARPMENT
            </text>
          </g>

          {/* ================= ROUTES ================= */}

          {/* Original Route to Mumbai APMC (NH-160) */}
          <path
            d="M 160,80 Q 240,140 320,220 T 480,310 Q 530,340 580,370"
            fill="none"
            stroke={isRerouted ? '#475569' : 'url(#congested-route-grad)'}
            strokeWidth={isRerouted ? 3 : 5}
            strokeLinecap="round"
            strokeDasharray={isRerouted ? '6 6' : undefined}
            opacity={isRerouted ? 0.4 : 0.9}
          />

          {/* Kasara Ghat Congestion Highlight Marker */}
          {!isRerouted && (
            <g transform="translate(320, 220)">
              <circle r="18" fill="#ef4444" opacity="0.2" className="animate-ping" />
              <circle r="12" fill="#ef4444" opacity="0.4" />
              <circle r="6" fill="#ef4444" />
              <rect x="12" y="-12" width="130" height="24" rx="4" fill="#1e293b" stroke="#ef4444" strokeWidth="1" />
              <text x="20" y="4" fill="#fca5a5" fontSize="10" fontWeight="bold">
                ⚠️ SEVERE GRIDLOCK (8h 10m)
              </text>
            </g>
          )}

          {/* Alternative Route to Pune (SH-44 Expressway - AI FreshRoute™) */}
          <path
            d="M 320,220 Q 440,190 540,190 T 680,190"
            fill="none"
            stroke={isRerouted || isRescueActive ? 'url(#fresh-route-grad)' : '#047857'}
            strokeWidth={isRerouted ? 6 : 4}
            strokeLinecap="round"
            strokeDasharray={isRerouted ? undefined : '4 4'}
            opacity={isRerouted || isRescueActive ? 1 : 0.5}
          />

          {/* Alternative Route to Thane Bypass */}
          <path
            d="M 320,220 Q 390,260 480,310"
            fill="none"
            stroke="#ca8a04"
            strokeWidth="2.5"
            strokeDasharray="5 4"
            opacity="0.5"
          />

          {/* ================= MARKERS ================= */}

          {/* 1. Origin Farm Marker (Nashik Valley) */}
          <g transform="translate(160, 80)" className="cursor-pointer">
            <circle r="22" fill="#047857" opacity="0.15" />
            <circle r="14" fill="#065f46" stroke="#10b981" strokeWidth="2" />
            <circle r="5" fill="#34d399" />
            <rect x="-60" y="-36" width="120" height="22" rx="6" fill="#064e3b" stroke="#059669" strokeWidth="1" />
            <text x="0" y="-22" textAnchor="middle" fill="#a7f3d0" fontSize="10" fontWeight="bold">
              🌱 Nashik Farm (Origin)
            </text>
          </g>

          {/* 2. Destination A: Mumbai Central APMC Hub */}
          <g 
            transform="translate(580, 370)" 
            className="cursor-pointer group"
            onClick={() => onSelectMarket && onSelectMarket(markets[0])}
          >
            <circle r="20" fill={isRerouted ? '#334155' : '#b91c1c'} opacity="0.2" />
            <circle r="13" fill={isRerouted ? '#1e293b' : '#991b1b'} stroke={isRerouted ? '#64748b' : '#ef4444'} strokeWidth="2" />
            <circle r="5" fill={isRerouted ? '#94a3b8' : '#fca5a5'} />
            <rect 
              x="-75" 
              y="16" 
              width="150" 
              height="36" 
              rx="6" 
              fill="#0f172a" 
              stroke={isRerouted ? '#475569' : '#ef4444'} 
              strokeWidth="1.5" 
            />
            <text x="0" y="30" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
              Market A: Mumbai APMC
            </text>
            <text x="0" y="44" textAnchor="middle" fill={isRerouted ? '#94a3b8' : '#fca5a5'} fontSize="9" fontWeight="medium">
              {isRerouted ? 'Diverted (Aborted)' : '110 km • ETA 8h 10m 🔴'}
            </text>
          </g>

          {/* 3. Destination B: Pune Agro Terminal (AI FreshRoute™ Target) */}
          <g 
            transform="translate(680, 190)" 
            className="cursor-pointer group"
            onClick={() => onSelectMarket && onSelectMarket(markets[1])}
          >
            <circle r="24" fill="#059669" opacity="0.2" className="animate-pulse" />
            <circle r="15" fill="#047857" stroke="#10b981" strokeWidth="2.5" />
            <circle r="6" fill="#6ee7b7" />
            
            {/* Rescue Badge */}
            <g transform="translate(-10, -32)">
              <rect x="-80" y="0" width="180" height="42" rx="8" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
              <text x="10" y="15" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="800">
                ⭐ AI FRESHROUTE™ RECOMMENDATION
              </text>
              <text x="10" y="32" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="semibold">
                Market B (Pune) • 55 km • ETA 3h 50m 🟢
              </text>
            </g>
          </g>

          {/* 4. Destination C: Thane Depot */}
          <g 
            transform="translate(480, 310)" 
            className="cursor-pointer group"
            onClick={() => onSelectMarket && onSelectMarket(markets[2])}
          >
            <circle r="12" fill="#78350f" stroke="#f59e0b" strokeWidth="1.5" />
            <circle r="4" fill="#fbbf24" />
            <rect x="-55" y="16" width="110" height="24" rx="4" fill="#1e293b" stroke="#d97706" strokeWidth="1" />
            <text x="0" y="30" textAnchor="middle" fill="#fef3c7" fontSize="9" fontWeight="medium">
              Market C (Thane) • 72 km 🟡
            </text>
          </g>

          {/* ================= TRUCK VEHICLE MARKER ================= */}
          <g transform={`translate(${truckPos.x}, ${truckPos.y})`} className="transition-all duration-1000 ease-out">
            {/* Pulse Ring */}
            <circle r="30" fill="url(#pulse-grad)" className="animate-ping" opacity="0.7" />
            <circle r="20" fill="#0284c7" opacity="0.2" />

            {/* Truck Pin Body */}
            <circle r="14" fill="#0369a1" stroke="#38bdf8" strokeWidth="2.5" />
            
            {/* Truck Icon graphic */}
            <path
              d="M -6,-4 L 3,-4 L 6,-1 L 6,4 L -6,4 Z"
              fill="#ffffff"
            />
            <circle cx="-3" cy="4" r="1.5" fill="#0369a1" />
            <circle cx="4" cy="4" r="1.5" fill="#0369a1" />

            {/* Truck Status Pill Floating Tag */}
            <g transform="translate(0, -28)">
              <rect 
                x="-70" 
                y="-14" 
                width="140" 
                height="24" 
                rx="6" 
                fill="#0f172a" 
                stroke={isRerouted ? '#10b981' : isRescueActive ? '#ef4444' : '#38bdf8'} 
                strokeWidth="1.5" 
              />
              <text x="0" y="2" textAnchor="middle" fill="#f8fafc" fontSize="9.5" fontWeight="bold">
                {selectedShipment.vehicleNumber} • {selectedShipment.batch.cropType}
              </text>
            </g>
          </g>
        </svg>

        {/* Bottom Route Summary Card overlay */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/80 shadow-2xl">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                  isRerouted 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : isRescueActive 
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                }`}>
                  {isRerouted ? 'REROUTED TO RESCUE HUB' : isRescueActive ? '🚨 CROP RESCUE ACTIVE' : 'STANDARD ROUTE'}
                </span>
                <span className="text-xs text-slate-400 font-mono-data">Batch #{selectedShipment.batch.id}</span>
              </div>

              <h4 className="text-sm font-bold text-white mt-1">
                {isRerouted ? 'Pune Agro Logistics Terminal' : selectedShipment.currentDestinationName}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                {isRerouted 
                  ? 'Diversion confirmed via SH-44 Expressway. Safe window preserved.' 
                  : 'Current path traversing Kasara Ghat NH-160 corridor.'}
              </p>
            </div>

            {isRescueActive && !isRerouted && (
              <button
                id="map-one-click-reroute-btn"
                onClick={() => confirmReroute('market-b')}
                className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-lg shadow-emerald-900/50 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                Reroute Market B
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Map Footer Legend */}
      <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-emerald-500 rounded-full" />
            <span>AI FreshRoute™</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-red-500 rounded-full" />
            <span>Congested Segment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Market B (Suitable 🟢)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Market A (Alternative Review 🔴)</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono-data">
          GPS: 19.4500° N, 73.4000° E • Calibrated Sat-Link
        </div>
      </div>
    </div>
      )}
    </div>
  );
};
