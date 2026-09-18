import React from 'react';
import {
  Sparkles,
  Thermometer,
  Droplets,
  Clock,
  Calendar,
  AlertTriangle,
  Info,
  ShieldCheck,
  TrendingDown,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AiSellAdvisor } from './AiSellAdvisor';

export const FarmerFreshnessAiView: React.FC = () => {
  const { selectedShipment, setActiveTab } = useApp();

  const currentTemp = selectedShipment.sensorHistory.length > 0
    ? selectedShipment.sensorHistory[selectedShipment.sensorHistory.length - 1].temperatureC
    : 25;
  const currentHumidity = selectedShipment.sensorHistory.length > 0
    ? selectedShipment.sensorHistory[selectedShipment.sensorHistory.length - 1].humidityPct
    : 64;

  const isLowRisk = selectedShipment.spoilageRisk === 'LOW';
  const isHighRisk = selectedShipment.spoilageRisk === 'HIGH';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Freshness AI™ Decay Intelligence
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-mono font-bold border border-emerald-200">
                Batch #TG102
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Crop: Vine-Ripened Hybrid Tomato &bull; Harvest Date: Today 06:30 AM
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('rescue')}
          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer self-start sm:self-auto"
        >
          Check Crop Rescue Rules &rarr;
        </button>
      </div>

      {/* 3 Core Output Metrics Required by Prompt */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Freshness Score 78 / 100 */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Freshness Score</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>

          <div>
            <div className="text-4xl font-black text-slate-900 font-mono-data">
              {selectedShipment.freshnessScore} <span className="text-xl text-slate-400 font-normal">/ 100</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Biochemical firmness & cellular hydration index
            </p>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-4">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                selectedShipment.freshnessScore > 70 ? 'bg-emerald-600' : 'bg-amber-500'
              }`}
              style={{ width: `${selectedShipment.freshnessScore}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Spoilage Risk LOW 🟢 */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Spoilage Risk</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-black font-mono-data ${
                isHighRisk ? 'text-red-600' : isLowRisk ? 'text-emerald-700' : 'text-amber-600'
              }`}>
                {selectedShipment.spoilageRisk}
              </span>
              <span className="text-2xl">
                {isHighRisk ? '🔴' : isLowRisk ? '🟢' : '🟡'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isHighRisk
                ? 'Thermal abuse or delay detected. Rerouting recommended.'
                : 'Produce in optimal safe condition for wholesale liquidation.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Threshold limit: 30°C</span>
            <span className="font-bold text-slate-700">Safety Index: 92%</span>
          </div>
        </div>

        {/* Metric 3: Estimated Safe-Selling Window: 5h 20m */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Safe-Selling Window</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono-data">
              {Math.floor(selectedShipment.safeSellingWindowHours)}h {Math.round((selectedShipment.safeSellingWindowHours % 1) * 60)}m
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Estimated hours before commercial grade downgrade occurs
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Current ETA: {Math.floor(selectedShipment.estimatedTravelTimeMinutes / 60)}h {selectedShipment.estimatedTravelTimeMinutes % 60}m</span>
            <span className="font-bold text-emerald-700">Safe Margin &gt; 2h</span>
          </div>
        </div>
      </div>

      <AiSellAdvisor />

      {/* Factors Influencing Prediction Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Factors Influencing Prediction
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Thermometer className="w-4 h-4 text-emerald-600" />
              <span>Current Temperature</span>
            </div>
            <div className="text-xl font-black text-slate-900 font-mono-data">
              {currentTemp}°C
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Optimal range: 16°C – 24°C</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Droplets className="w-4 h-4 text-blue-600" />
              <span>Container Humidity</span>
            </div>
            <div className="text-xl font-black text-slate-900 font-mono-data">
              {currentHumidity}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Optimal range: 60% – 75%</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>Transit Time Elapsed</span>
            </div>
            <div className="text-xl font-black text-slate-900 font-mono-data">
              2h 15m
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Departed: 09:30 AM</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Harvest-to-Transport</span>
            </div>
            <div className="text-xl font-black text-slate-900 font-mono-data">
              8h
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Field harvested: 06:30 AM</div>
          </div>
        </div>
      </div>

      {/* Visual Chart / Graph: Temperature & Freshness Change Over Time */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Sensor Telemetry & Freshness Degradation Curve
            </h3>
            <p className="text-xs text-slate-500">
              Hourly sensor telemetry correlation with Arrhenius kinetic model
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-slate-600">Freshness (%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="text-slate-600">Temperature (°C)</span>
            </div>
          </div>
        </div>

        {/* CSS/SVG Visual Graph */}
        <div className="relative h-48 sm:h-56 w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 120">
            {/* Grid lines */}
            <line x1="0" y1="30" x2="500" y2="30" stroke="#e2e8f0" strokeDasharray="4" />
            <line x1="0" y1="60" x2="500" y2="60" stroke="#e2e8f0" strokeDasharray="4" />
            <line x1="0" y1="90" x2="500" y2="90" stroke="#e2e8f0" strokeDasharray="4" />

            {/* Freshness Curve Line (Green) */}
            <path
              d="M 20 20 Q 150 25, 280 35 T 480 48"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
            />

            {/* Temperature Curve Line (Amber/Orange) */}
            <path
              d="M 20 95 Q 150 90, 280 82 T 480 65"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3"
              strokeDasharray="4"
            />

            {/* Data Point Markers */}
            <circle cx="20" cy="20" r="4" fill="#10b981" />
            <circle cx="150" cy="25" r="4" fill="#10b981" />
            <circle cx="280" cy="35" r="4" fill="#10b981" />
            <circle cx="480" cy="48" r="4" fill="#10b981" />

            <circle cx="20" cy="95" r="4" fill="#f59e0b" />
            <circle cx="150" cy="90" r="4" fill="#f59e0b" />
            <circle cx="280" cy="82" r="4" fill="#f59e0b" />
            <circle cx="480" cy="65" r="4" fill="#f59e0b" />
          </svg>

          {/* X Axis Labels */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200">
            <span>09:30 AM (Farm Gate)</span>
            <span>10:30 AM (Highway)</span>
            <span>11:30 AM (Mid-route)</span>
            <span>Current (In Transit)</span>
            <span>Projected Arrival</span>
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimer from Prompt */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">System Advisory:</strong>
          <p className="mt-0.5 text-amber-800">
            These predictions are estimates based on AI models and not guaranteed shelf-life. Actual produce degradation may vary depending on micro-climate fluctuations, seed hybrid genetics, and dock handling procedures.
          </p>
        </div>
      </div>
    </div>
  );
};
