import React from 'react';
import { 
  Play, 
  Map, 
  Store, 
  LifeBuoy, 
  LayoutDashboard, 
  TrendingUp, 
  ShieldCheck, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Thermometer,
  Clock,
  Scale
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CropRescueBanner } from '../CropRescueBanner';
import { InteractiveMap } from '../InteractiveMap';

export const HomeOverviewTab: React.FC = () => {
  const { 
    setActiveTab, 
    shipments, 
    setSelectedShipmentId, 
    selectedShipmentId,
    activateCropRescue
  } = useApp();

  return (
    <div id="home-overview-tab" className="space-y-8">
      {/* 32. Final Homepage Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30 p-6 sm:p-10 text-white shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Next-Gen Agricultural Logistics Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            AGRILOGIX
          </h1>

          <p className="text-lg sm:text-xl font-bold text-emerald-400 mt-2 tracking-wide">
            “Track. Predict. Reroute. Rescue.”
          </p>

          <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed font-normal">
            Real-time agricultural supply-chain intelligence that helps move every crop to a suitable destination within its freshness window.
          </p>

          {/* Prompt 32 Main Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-7">
            <button
              id="hero-track-shipment-btn"
              onClick={() => setActiveTab('tracking')}
              className="bg-slate-800/90 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer"
            >
              <Map className="w-4 h-4 text-emerald-400" />
              <span>TRACK SHIPMENT</span>
            </button>

            <button
              id="hero-smart-markets-btn"
              onClick={() => setActiveTab('markets')}
              className="bg-slate-800/90 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer"
            >
              <Store className="w-4 h-4 text-amber-400" />
              <span>SMART MARKETS</span>
            </button>

            <button
              id="hero-crop-rescue-btn"
              onClick={() => setActiveTab('rescue')}
              className="bg-red-600/90 hover:bg-red-500 text-white text-xs sm:text-sm font-bold px-4 py-3 rounded-xl border border-red-500/60 shadow transition flex items-center gap-2 cursor-pointer"
            >
              <LifeBuoy className="w-4 h-4 text-red-200" />
              <span>CROP RESCUE</span>
            </button>

            <button
              id="hero-dashboard-btn"
              onClick={() => setActiveTab('dashboard')}
              className="bg-slate-800/90 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              <span>DASHBOARD</span>
            </button>
          </div>
        </div>
      </section>

      {/* Dynamic Status / Crop Rescue Alert */}
      <CropRescueBanner />

      {/* Executive Key Performance Metrics (19. Admin Dashboard KPIs) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Active Trucks</span>
            <Truck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-mono-data">3 Trucks</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>100% IoT GPS Telemetry Live</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Produce Saved</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2 font-mono-data">3,800 kg</div>
          <div className="text-xs text-slate-500 mt-1 font-semibold">
            ₹1,52,000 Economic Value Preserved
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Rescue Events Handled</span>
            <LifeBuoy className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-600 mt-2 font-mono-data">1 Active</div>
          <div className="text-xs text-red-600 font-semibold mt-1">
            Batch #TG102 Kasara Ghat diversion
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Digital Chain of Custody</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-mono-data">100%</div>
          <div className="text-xs text-blue-600 font-semibold mt-1">
            Tamper Seals & Multi-Point Logs
          </div>
        </div>
      </section>

      {/* Live Map & Active Shipments Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Live Supply-Chain Map & Corridor Routing</h2>
            <p className="text-xs text-slate-500">
              Interactive GPS tracking with real-time traffic, condition monitoring, and route diversion analysis.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('tracking')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Open Fullscreen Tracking</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <InteractiveMap />
      </section>

      {/* Pre-loaded Shipments (Prompt 25: Shipment 1, 2, 3) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Active Shipments Directory</h2>
            <p className="text-xs text-slate-500">
              Multi-point tracked batches across Maharashtra agro supply chains.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shipments.map((s) => {
            const isSelected = s.id === selectedShipmentId;
            const isDemoShipment = s.batch.id === 'TG102';

            return (
              <div
                key={s.id}
                onClick={() => setSelectedShipmentId(s.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50/40 border-emerald-500 shadow-md'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono-data font-bold text-sm text-slate-900">
                        #{s.batch.id}
                      </span>
                      {isDemoShipment && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                          ACTIVE BATCH
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-semibold text-slate-600 mt-0.5">
                      {s.batch.cropType} • {s.batch.quantityKg} kg
                    </h4>
                  </div>

                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                    s.spoilageRisk === 'CRITICAL' || s.spoilageRisk === 'HIGH'
                      ? 'bg-red-100 text-red-700'
                      : s.spoilageRisk === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    Freshness Monitor: {s.spoilageRisk}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Destination:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[160px] text-right">
                      {s.currentDestinationName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>ETA:</span>
                    <span className="font-mono-data font-semibold text-slate-800">
                      {Math.floor(s.estimatedTravelTimeMinutes / 60)}h {s.estimatedTravelTimeMinutes % 60}m
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Safe Window:</span>
                    <span className="font-mono-data font-semibold text-emerald-700">
                      {s.safeSellingWindowHours.toFixed(1)} hours
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Container Temp:</span>
                    <span className={`font-mono-data font-semibold ${s.freshnessScore < 70 ? 'text-red-600' : 'text-slate-800'}`}>
                      {s.sensorHistory[s.sensorHistory.length - 1]?.temperatureC || 20}°C
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">
                    Seal: <strong className="text-emerald-700 font-semibold">{s.batch.sealStatus}</strong>
                  </span>
                  <span className="text-xs text-emerald-700 font-bold hover:underline">
                    View Telemetry →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 27. Important Connected Workflow Diagram */}
      <section className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800">
        <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-2">
          End-To-End Autonomous Supply-Chain Pipeline
        </h3>
        <p className="text-xs text-slate-300 mb-6">
          Every checkpoint is unified through immutable verification, biological decay algorithms, and dynamic rerouting.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
              <Scale className="w-4 h-4" />
            </div>
            <div className="text-[11px] font-bold text-white">1. Farm Weigh</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Digital scale & QR</div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-[11px] font-bold text-white">2. Tamper Seal</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Physical hash locked</div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-2">
              <Thermometer className="w-4 h-4" />
            </div>
            <div className="text-[11px] font-bold text-white">3. IoT Telemetry</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Temp, shock & GPS</div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-[11px] font-bold text-white">4. Decay AI</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Safe window analysis</div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-2">
              <LifeBuoy className="w-4 h-4" />
            </div>
            <div className="text-[11px] font-bold text-white">5. Crop Rescue</div>
            <div className="text-[10px] text-slate-400 mt-0.5">AI FreshRoute™ diversion</div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-[11px] font-bold text-white">6. Buyer Delivery</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Evidence sealed</div>
          </div>
        </div>
      </section>
    </div>
  );
};
