import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Sliders, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  Calculator, 
  Clock, 
  DollarSign, 
  Thermometer, 
  Activity,
  Layers,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CROP_PROFILES } from '../../services/freshnessEngine';

export const AiInsightsTab: React.FC = () => {
  const { selectedShipment, confirmReroute, setActiveTab } = useApp();

  // Route candidate weights state for live recalculation demo
  const [wTravelTime, setWTravelTime] = useState(0.25);
  const [wTraffic, setWTraffic] = useState(0.20);
  const [wTempRisk, setWTempRisk] = useState(0.25);
  const [wSpoilage, setWSpoilage] = useState(0.20);
  const [wMarketPrice, setWMarketPrice] = useState(0.10);

  const isRerouted = selectedShipment.status === 'REROUTED' || selectedShipment.status === 'DELIVERED';

  // Candidate routes evaluation
  const candidateRoutes = [
    {
      id: 'route-pune',
      name: 'Corridor B: Divert via SH-44 to Pune Agro Terminal',
      destination: 'Pune Agro Logistics Terminal',
      distanceKm: 55,
      travelTimeMin: 230,
      trafficLabel: 'Flowing (Green)',
      tempAvgC: 25,
      spoilageRiskScore: 22,
      demandLevel: 'High',
      pricePerKg: 42,
      badge: 'RECOMMENDED 🟢',
      badgeColor: 'bg-emerald-500 text-white',
      borderColor: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40',
      compositeScore: 68,
      status: 'Recommended',
      notes: 'Arrival in 3h 50m protects tomato firmness and secures ₹42/kg spot price.',
    },
    {
      id: 'route-thane',
      name: 'Corridor C: Bypass via Kalyan-Shilphata to Thane APMC',
      destination: 'Thane Central Vegetable Mandi',
      distanceKm: 72,
      travelTimeMin: 280,
      trafficLabel: 'Moderate (Yellow)',
      tempAvgC: 28,
      spoilageRiskScore: 54,
      demandLevel: 'Medium',
      pricePerKg: 38,
      badge: 'FEASIBLE 🟡',
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
      borderColor: 'border-slate-200 bg-white',
      compositeScore: 142,
      status: 'Feasible',
      notes: 'Arrival in 4h 40m has thin safety buffer (+30 mins before over-ripeness).',
    },
    {
      id: 'route-mumbai-orig',
      name: 'Corridor A (Original): NH-160 Kasara Ghat to Mumbai Central APMC',
      destination: 'Mumbai Central APMC Terminal',
      distanceKm: 110,
      travelTimeMin: 490,
      trafficLabel: 'Severe Gridlock (Red)',
      tempAvgC: 33,
      spoilageRiskScore: 92,
      demandLevel: 'Medium',
      pricePerKg: 38,
      badge: 'REJECTED: HIGH SPOILAGE RISK 🔴',
      badgeColor: 'bg-red-500 text-white',
      borderColor: 'border-red-300 bg-red-50/30 opacity-75',
      compositeScore: 284,
      status: 'Rejected',
      notes: 'Travel time (8h 10m) exceeds safe-selling window (4.1h). Guaranteed economic loss.',
    },
  ];

  return (
    <div id="ai-insights-tab" className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-purple-500/40 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <span className="bg-purple-500/20 text-purple-300 border border-purple-400/40 text-xs font-mono font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
            ALGORITHMIC CORE
          </span>
          <span className="text-xs text-slate-400 font-mono-data">Multi-Objective Optimization</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          AI FreshRoute™ & Biological Spoilage Prediction Engine
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Standard logistics engines optimize purely for distance or fuel. Agrilogix formulates an agricultural decay function combining Arrhenius biological kinetics, real-time thermal telemetry, traffic congestion, and spot market pricing.
        </p>
      </div>

      {/* 3. Mathematical Formula Breakdown Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Calculator className="w-5 h-5 text-purple-600" />
          <h3 className="text-base font-bold text-slate-900">
            Composite Optimization Objective Function
          </h3>
        </div>

        {/* Math Formula Card */}
        <div className="p-4 bg-slate-950 text-white rounded-2xl border border-slate-800 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto">
          <div className="text-emerald-400 font-bold mb-1">
            FreshRoute_Score(R) =
          </div>
          <div className="pl-4 text-slate-200 space-y-1">
            <div>w₁ • (Travel Time) +</div>
            <div>w₂ • (Traffic Congestion Factor) +</div>
            <div>w₃ • (Thermal Exposure Index: ∫ T(t) dt) +</div>
            <div>w₄ • (Enzymatic Spoilage Penalty) +</div>
            <div>w₅ • (Road Quality & Vibration Factor) -</div>
            <div className="text-emerald-400 font-bold">w₆ • (Buyer Spot Demand & Price / kg)</div>
          </div>
        </div>

        {/* Interactive Weights Adjuster for Demo */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              <span>Interactive Model Weights Tuning (Simulate Priority Shifts):</span>
            </span>
            <span className="text-[11px] text-slate-400">Sum of factors: 1.0</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between text-[11px] text-slate-500 font-semibold mb-1">
                <span>w₁ Travel Time</span>
                <span className="font-mono">{wTravelTime.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                value={wTravelTime}
                onChange={(e) => setWTravelTime(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between text-[11px] text-slate-500 font-semibold mb-1">
                <span>w₂ Traffic Delay</span>
                <span className="font-mono">{wTraffic.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                value={wTraffic}
                onChange={(e) => setWTraffic(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between text-[11px] text-slate-500 font-semibold mb-1">
                <span>w₃ Thermal Stress</span>
                <span className="font-mono">{wTempRisk.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                value={wTempRisk}
                onChange={(e) => setWTempRisk(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between text-[11px] text-slate-500 font-semibold mb-1">
                <span>w₄ Spoilage Decay</span>
                <span className="font-mono">{wSpoilage.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                value={wSpoilage}
                onChange={(e) => setWSpoilage(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between text-[11px] text-slate-500 font-semibold mb-1">
                <span>w₆ Price / kg Incentive</span>
                <span className="font-mono">{wMarketPrice.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.3"
                step="0.05"
                value={wMarketPrice}
                onChange={(e) => setWMarketPrice(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Candidate Route Cards (Prompt: Route Name, Destination, Distance, ETA, Traffic, Temp, Spoilage, Price, Badge) */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-slate-900">
          Ranked Candidate Route Evaluations
        </h3>

        <div className="space-y-4">
          {candidateRoutes.map((route) => (
            <div
              key={route.id}
              className={`rounded-3xl p-5 sm:p-6 border transition-all ${route.borderColor}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[11px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${route.badgeColor}`}>
                      {route.badge}
                    </span>
                    <span className="text-xs text-slate-500 font-mono-data">
                      Composite Score: <strong className="text-slate-900">{route.compositeScore}</strong> (Lower is superior)
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-black text-slate-900">
                    {route.name}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {route.notes}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 text-xs font-mono-data">
                    <div className="bg-slate-100/80 p-2 rounded-xl">
                      <div className="text-[10px] text-slate-400 font-sans">Distance</div>
                      <div className="font-bold text-slate-900">{route.distanceKm} km</div>
                    </div>
                    <div className="bg-slate-100/80 p-2 rounded-xl">
                      <div className="text-[10px] text-slate-400 font-sans">Travel ETA</div>
                      <div className="font-bold text-slate-900">{Math.floor(route.travelTimeMin / 60)}h {route.travelTimeMin % 60}m</div>
                    </div>
                    <div className="bg-slate-100/80 p-2 rounded-xl">
                      <div className="text-[10px] text-slate-400 font-sans">Traffic Status</div>
                      <div className="font-bold text-slate-900">{route.trafficLabel}</div>
                    </div>
                    <div className="bg-slate-100/80 p-2 rounded-xl">
                      <div className="text-[10px] text-slate-400 font-sans">Avg Ambient</div>
                      <div className="font-bold text-slate-900">{route.tempAvgC}°C</div>
                    </div>
                    <div className="bg-slate-100/80 p-2 rounded-xl">
                      <div className="text-[10px] text-slate-400 font-sans">Spoilage Risk</div>
                      <div className="font-bold text-slate-900">{route.spoilageRiskScore}/100</div>
                    </div>
                    <div className="bg-slate-100/80 p-2 rounded-xl">
                      <div className="text-[10px] text-slate-400 font-sans">Buyer Demand</div>
                      <div className="font-bold text-slate-900">{route.demandLevel}</div>
                    </div>
                    <div className="bg-slate-100/80 p-2 rounded-xl">
                      <div className="text-[10px] text-slate-400 font-sans">Spot Price</div>
                      <div className="font-bold text-emerald-700">₹{route.pricePerKg}/kg</div>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {route.id === 'route-pune' && (
                    <button
                      onClick={() => confirmReroute('market-b')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-3 rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-200" />
                      <span>{isRerouted ? 'CURRENT ACTIVE ROUTE' : 'DEPLOY THIS ROUTE'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Supported Crops & Biochemical Decay Reference Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Activity className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">
            Supported Agricultural Crops & Respiration Kinetics Database
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-data">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Crop Name</th>
                <th className="py-2.5 px-3">Base Shelf Life (Optimal)</th>
                <th className="py-2.5 px-3">Optimal Storage Range</th>
                <th className="py-2.5 px-3">Q10 Biological Acceleration</th>
                <th className="py-2.5 px-3">Target Relative Humidity</th>
                <th className="py-2.5 px-3">Critical Spoilage Window</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {Object.entries(CROP_PROFILES).map(([crop, profile]) => (
                <tr key={crop} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-sans font-bold text-slate-900">
                    {crop} {crop === selectedShipment.batch.cropType ? '⭐ (Active)' : ''}
                  </td>
                  <td className="py-3 px-3">{profile.baseShelfLifeHours} hours</td>
                  <td className="py-3 px-3">{profile.optimalTempMinC}°C to {profile.optimalTempMaxC}°C</td>
                  <td className="py-3 px-3 text-red-600 font-bold">{profile.q10Factor}x per 10°C rise</td>
                  <td className="py-3 px-3">{profile.humidityOptimalMin}% - {profile.humidityOptimalMax}%</td>
                  <td className="py-3 px-3 text-emerald-700 font-bold">&lt; {profile.criticalWindowHours} hours</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
