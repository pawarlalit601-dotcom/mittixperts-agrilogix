import React, { useState } from 'react';
import {
  Activity,
  Thermometer,
  Droplets,
  Navigation,
  Lock,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Clock,
  Car
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DriverSensorStatusView: React.FC = () => {
  const {
    selectedShipment,
    setManualTemperature,
    simulateSensorEvent
  } = useApp();

  const lastReading = selectedShipment.sensorHistory.length > 0
    ? selectedShipment.sensorHistory[selectedShipment.sensorHistory.length - 1]
    : {
        temperatureC: 26,
        humidityPct: 65,
        sealStatus: 'INTACT',
        cargoTempC: 22,
        batteryPct: 92,
      };

  const tempVal = lastReading.temperatureC;
  const humidityVal = lastReading.humidityPct;
  const isHighTemp = tempVal > 28;
  const isHighRisk = selectedShipment.spoilageRisk === 'HIGH';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              In-Cabin IoT Telemetry & Sensor Dashboard
            </h2>
            <p className="text-xs text-slate-500">
              Live wireless sensors mounted in Reefer Container #MH-15-TC-4402
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
          <span>BLE Gateway: Streaming 1 Hz</span>
        </span>
      </div>

      {/* 5 Core Sensor Status Cards Required by Prompt */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Temperature: 26°C 🟢 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">Temperature</span>
            <Thermometer className={`w-4 h-4 ${isHighTemp ? 'text-red-500' : 'text-emerald-600'}`} />
          </div>
          <div className="text-2xl font-black font-mono-data text-slate-900 flex items-center gap-1.5 my-1">
            <span>{tempVal}°C</span>
            <span className="text-lg">{isHighTemp ? '🔴' : '🟢'}</span>
          </div>
          <div className="text-[10px] text-slate-500">
            {isHighTemp ? 'Thermal Warning' : 'Setpoint 18°C'}
          </div>
        </div>

        {/* Humidity: 65% 🟢 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">Humidity</span>
            <Droplets className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black font-mono-data text-slate-900 flex items-center gap-1.5 my-1">
            <span>{humidityVal}%</span>
            <span className="text-lg">🟢</span>
          </div>
          <div className="text-[10px] text-slate-500">Normal Range</div>
        </div>

        {/* GPS: CONNECTED 🟢 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">GPS</span>
            <Navigation className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-700 flex items-center gap-1.5 my-1">
            <span>CONNECTED</span>
            <span>🟢</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">9 Satellites Locked</div>
        </div>

        {/* Seal: INTACT 🟢 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">Seal</span>
            <Lock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-700 flex items-center gap-1.5 my-1">
            <span>INTACT</span>
            <span>🟢</span>
          </div>
          <div className="text-[10px] text-slate-500">#SEAL-9921-IN</div>
        </div>

        {/* Freshness Risk: LOW 🟢 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase">Freshness Risk</span>
            <ShieldCheck className={`w-4 h-4 ${isHighRisk ? 'text-red-500' : 'text-emerald-600'}`} />
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-1.5 my-1">
            <span className={isHighRisk ? 'text-red-600' : 'text-emerald-700'}>
              {selectedShipment.spoilageRisk}
            </span>
            <span>{isHighRisk ? '🔴' : '🟢'}</span>
          </div>
          <div className="text-[10px] text-slate-500">Score: {selectedShipment.freshnessScore}/100</div>
        </div>
      </div>

      {/* Live Sensor Monitoring */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Live Sensor Monitoring
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time refrigeration, humidity, and route observations from active transport telemetry.
            </p>
          </div>

          <span className="text-[10px] font-mono text-emerald-300 bg-slate-800 px-2.5 py-1 rounded-md">
            Active Feed
          </span>
        </div>

        {/* 5 Specific Simulation Buttons Required by Prompt */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {/* 1: Increase Temperature */}
          <button
            id="sim-temp-increase-btn"
            onClick={() => simulateSensorEvent('temp_increase')}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 hover:border-red-400 transition cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Thermometer className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white">Increase Temperature</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Spike to 33°C (Reefer Failure)</div>
          </button>

          {/* 2: Increase Humidity */}
          <button
            id="sim-humidity-increase-btn"
            onClick={() => simulateSensorEvent('humidity_increase')}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 hover:border-blue-400 transition cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Droplets className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white">Increase Humidity</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Rise to 89% (Condensation)</div>
          </button>

          {/* 3: Simulate Delay */}
          <button
            id="sim-delay-btn"
            onClick={() => simulateSensorEvent('delay')}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 hover:border-amber-400 transition cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white">Simulate Delay</div>
            <div className="text-[10px] text-slate-400 mt-0.5">+3h Tollway Stoppage</div>
          </button>

          {/* 4: Simulate Traffic Jam */}
          <button
            id="sim-traffic-jam-btn"
            onClick={() => simulateSensorEvent('traffic_jam')}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 hover:border-amber-400 transition cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <Car className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white">Simulate Traffic Jam</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Kasara Ghat Gridlock (8 km/h)</div>
          </button>

          {/* 5: Simulate Spoilage Risk Increase */}
          <button
            id="sim-spoilage-rise-btn"
            onClick={() => simulateSensorEvent('spoilage_rise')}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 hover:border-red-400 transition cursor-pointer group col-span-2 sm:col-span-1"
          >
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white">Spoilage Risk Increase</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Trigger 🚨 Crop Rescue Mode</div>
          </button>
        </div>

        {/* Temperature Quick Slider */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-300">
            Manual Temperature Slider: <strong className="text-emerald-400 font-mono">{tempVal}°C</strong>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-72">
            <span className="text-[10px] text-slate-500">14°C</span>
            <input
              type="range"
              min="14"
              max="38"
              value={tempVal}
              onChange={(e) => setManualTemperature(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500">38°C</span>
          </div>
        </div>
      </div>
    </div>
  );
};
