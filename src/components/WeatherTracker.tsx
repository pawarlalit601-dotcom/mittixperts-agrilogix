import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import {
  fetchLiveWeather,
  fetchCorridorWeatherSummary,
  LiveWeatherData,
  CorridorWeatherSummary
} from '../services/weatherService';
import { useApp } from '../context/AppContext';

interface WeatherTrackerProps {
  currentLat?: number;
  currentLng?: number;
  compact?: boolean;
}

export const WeatherTracker: React.FC<WeatherTrackerProps> = ({
  currentLat = 19.45,
  currentLng = 73.40,
  compact = false
}) => {
  const { selectedShipment } = useApp();
  const [currentWeather, setCurrentWeather] = useState<LiveWeatherData | null>(null);
  const [corridorSummary, setCorridorSummary] = useState<CorridorWeatherSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'transit' | 'corridor' | 'impact'>('transit');

  const isRerouted = selectedShipment.status === 'REROUTED' || selectedShipment.status === 'DELIVERED';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [current, corridor] = await Promise.all([
        fetchLiveWeather(currentLat, currentLng, 'Active Highway Corridor (Kasara Ghat)'),
        fetchCorridorWeatherSummary()
      ]);
      setCurrentWeather(current);
      setCorridorSummary(corridor);
    } catch (e) {
      console.error('Error loading live weather', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [currentLat, currentLng]);

  if (compact && currentWeather) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-white flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <CloudSun className="w-4 h-4 text-amber-400" />
          <span className="font-bold font-mono-data">{currentWeather.temperatureC}°C</span>
          <span className="text-slate-400 text-[11px]">({currentWeather.conditionLabel})</span>
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <div className="flex items-center gap-1 text-slate-300">
          <Droplets className="w-3.5 h-3.5 text-blue-400" />
          <span>{currentWeather.humidityPct}% RH</span>
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
          currentWeather.thermalRisk === 'CRITICAL' ? 'bg-red-500/20 text-red-300' :
          currentWeather.thermalRisk === 'ELEVATED' ? 'bg-amber-500/20 text-amber-300' :
          'bg-emerald-500/20 text-emerald-300'
        }`}>
          {currentWeather.thermalRisk} HEAT RISK
        </span>
      </div>
    );
  }

  return (
    <div id="weather-tracking-module" className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black tracking-tight text-white">
                Live Agricultural Weather & Micro-Climate Telemetry
              </h3>
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                OPEN-METEO LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time atmospheric monitoring along NH-160 & SH-44 supply chain corridors
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation Tabs */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setActiveTab('transit')}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === 'transit' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Transit Zone
            </button>
            <button
              onClick={() => setActiveTab('corridor')}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === 'corridor' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Corridor Comparison
            </button>
            <button
              onClick={() => setActiveTab('impact')}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === 'impact' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Crop Spoilage Impact
            </button>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title="Refresh Live Weather"
          >
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Body Content */}
      <div className="p-5 space-y-5">
        {activeTab === 'transit' && currentWeather && (
          <div className="space-y-4">
            {/* Real Weather Primary Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Temp */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <div className="flex items-center justify-between text-amber-800 text-xs font-semibold">
                  <span>Ambient Road Temp</span>
                  <Thermometer className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 font-mono-data">
                  {currentWeather.temperatureC}°C
                </div>
                <div className="text-[11px] text-amber-700 mt-1 flex items-center gap-1 font-medium">
                  Feels like: <strong className="font-mono-data">{currentWeather.apparentTempC}°C</strong>
                </div>
              </div>

              {/* Humidity */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80">
                <div className="flex items-center justify-between text-blue-800 text-xs font-semibold">
                  <span>Relative Humidity</span>
                  <Droplets className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 font-mono-data">
                  {currentWeather.humidityPct}%
                </div>
                <div className="text-[11px] text-blue-700 mt-1 flex items-center gap-1 font-medium">
                  Dew Point: <strong className="font-mono-data">{currentWeather.dewPointC}°C</strong>
                </div>
              </div>

              {/* Condition / Wind */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
                  <span>Micro-Climate</span>
                  <CloudSun className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900 mt-1 truncate">
                  {currentWeather.conditionLabel}
                </div>
                <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                  <Wind className="w-3 h-3" />
                  <span>Wind: {currentWeather.windSpeedKmh} km/h</span>
                </div>
              </div>

              {/* Spoilage Multiplier */}
              <div className={`p-3.5 rounded-2xl border ${
                currentWeather.thermalRisk === 'CRITICAL' ? 'bg-red-50 border-red-200 text-red-900' :
                currentWeather.thermalRisk === 'ELEVATED' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Thermal Respiration</span>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-black mt-1 font-mono-data">
                  {currentWeather.spoilageAccelerationFactor}x
                </div>
                <div className="text-[11px] mt-1 font-extrabold uppercase tracking-wide">
                  {currentWeather.thermalRisk} RISK
                </div>
              </div>
            </div>

            {/* Micro-Climate Advisory Alert Box */}
            <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
              currentWeather.thermalRisk === 'CRITICAL'
                ? 'bg-red-50 border-red-200 text-red-900'
                : currentWeather.thermalRisk === 'ELEVATED'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <div className="font-black text-sm">
                  Corridor Climate Advisory: {currentWeather.locationName}
                </div>
                <p className="mt-1 leading-relaxed text-slate-700">
                  {currentWeather.thermalAdvice} Ambient temperature is accelerating crop ethylene production. In an uncooled canvas truck, internal pallet core temperature reaches +3°C to +5°C above exterior road readings within 90 minutes of static traffic delay.
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 font-semibold">
                  <span className="bg-white/80 px-2 py-0.5 rounded border border-slate-300/80 text-[11px]">
                    📍 Coordinates: {currentWeather.lat.toFixed(4)}° N, {currentWeather.lng.toFixed(4)}° E
                  </span>
                  <span className="bg-white/80 px-2 py-0.5 rounded border border-slate-300/80 text-[11px]">
                    🕒 Updated: {currentWeather.timestamp}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'corridor' && corridorSummary && (
          <div className="space-y-4">
            <div className="text-xs text-slate-600 font-medium">
              Comparison across the 4 key nodes of the western Maharashtra produce corridor:
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Origin */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>ORIGIN (Nashik Farm)</span>
                </div>
                <div className="text-xl font-black text-slate-900 mt-2 font-mono-data">
                  {corridorSummary.origin.temperatureC}°C
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {corridorSummary.origin.conditionLabel} &bull; {corridorSummary.origin.humidityPct}% RH
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200 text-[11px] text-emerald-700 font-bold">
                  Cooler valley climate (Optimal for harvest)
                </div>
              </div>

              {/* Transit Kasara */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 hover:border-amber-300 transition">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>TRANSIT (Kasara Ghat)</span>
                </div>
                <div className="text-xl font-black text-red-600 mt-2 font-mono-data">
                  {corridorSummary.transit.temperatureC}°C
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {corridorSummary.transit.conditionLabel} &bull; {corridorSummary.transit.humidityPct}% RH
                </div>
                <div className="mt-2.5 pt-2 border-t border-amber-200 text-[11px] text-red-700 font-bold">
                  High thermal exposure & asphalt heat trap
                </div>
              </div>

              {/* Mumbai Destination */}
              <div className={`p-4 rounded-2xl border transition ${
                isRerouted ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-red-50/60 border-red-200'
              }`}>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>MUMBAI APMC (Target A)</span>
                </div>
                <div className="text-xl font-black text-slate-900 mt-2 font-mono-data">
                  {corridorSummary.destinationMumbai.temperatureC}°C
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {corridorSummary.destinationMumbai.conditionLabel} &bull; {corridorSummary.destinationMumbai.humidityPct}% RH
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200 text-[11px] text-red-600 font-bold">
                  Coastal humidity + heat accelerates rot
                </div>
              </div>

              {/* Pune Destination */}
              <div className={`p-4 rounded-2xl border transition ${
                isRerouted ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-emerald-50/60 border-emerald-200'
              }`}>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PUNE TERMINAL (Target B)</span>
                </div>
                <div className="text-xl font-black text-emerald-800 mt-2 font-mono-data">
                  {corridorSummary.destinationPune.temperatureC}°C
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {corridorSummary.destinationPune.conditionLabel} &bull; {corridorSummary.destinationPune.humidityPct}% RH
                </div>
                <div className="mt-2.5 pt-2 border-t border-emerald-200 text-[11px] text-emerald-700 font-bold">
                  ⭐ AI Route Destination: Drier plateau air
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'impact' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Thermodynamic Spoilage Prediction Model (Tomato TG102)
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Tomatoes release ethylene and respire at exponentially higher rates when exposed to ambient transit heat above 25°C without active refrigeration.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-700">Respiration Factor</div>
                  <div className="text-lg font-black text-red-600 mt-1 font-mono-data">
                    {currentWeather ? `${currentWeather.spoilageAccelerationFactor}x Baseline` : '2.1x Baseline'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Every hour in traffic equals ~2.1 hours of shelf life lost.</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-700">Bacterial / Mold Risk</div>
                  <div className="text-lg font-black text-amber-600 mt-1 font-mono-data">
                    High (78% Humidity)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Condensation risk inside crates during evening cooling.</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-700">FreshRoute™ Mitigation</div>
                  <div className="text-lg font-black text-emerald-600 mt-1 font-mono-data">
                    +4.2 Hours Saved
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Rerouting avoids heat exposure and preserves Grade B quality.</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
