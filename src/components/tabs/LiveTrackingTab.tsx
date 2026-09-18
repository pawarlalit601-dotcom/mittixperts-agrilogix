import React, { useState } from 'react';
import { 
  Gauge, 
  Thermometer, 
  Droplets, 
  ShieldCheck, 
  Radio, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  Sliders, 
  ArrowRight,
  TrendingDown,
  Navigation,
  Compass,
  Zap,
  Activity
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InteractiveMap } from '../InteractiveMap';
import { CropRescueBanner } from '../CropRescueBanner';
import { WeatherTracker } from '../WeatherTracker';

export const LiveTrackingTab: React.FC = () => {
  const { 
    selectedShipment, 
    setManualTemperature, 
    setManualTrafficCongestion,
    confirmReroute,
    activateCropRescue,
    setActiveTab,
    isGpsSimulating,
    toggleGpsSimulation
  } = useApp();

  const lastSensor = selectedShipment.sensorHistory[selectedShipment.sensorHistory.length - 1] || {
    temperatureC: 24,
    humidityPct: 80,
    speedKmh: 45,
    batteryPct: 95,
  };

  const [customTemp, setCustomTemp] = useState<number>(lastSensor.temperatureC);
  const isRerouted = selectedShipment.status === 'REROUTED' || selectedShipment.status === 'DELIVERED';
  const isRescueActive = selectedShipment.status === 'RESCUE_ACTIVE' || selectedShipment.status === 'AT_RISK';

  const handleTempSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCustomTemp(val);
    setManualTemperature(val);
  };

  const setTempPreset = (temp: number) => {
    setCustomTemp(temp);
    setManualTemperature(temp);
  };

  return (
    <div id="live-tracking-tab" className="space-y-6">
      {/* Header and Shipment Meta */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono-data text-xs font-black bg-slate-900 text-white px-2.5 py-1 rounded-md">
              BATCH #{selectedShipment.batch.id}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {selectedShipment.batch.cropType} ({selectedShipment.batch.quantityKg} kg)
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
              selectedShipment.spoilageRisk === 'CRITICAL' || selectedShipment.spoilageRisk === 'HIGH'
                ? 'bg-red-100 text-red-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {selectedShipment.spoilageRisk} Risk
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1.5 flex items-center gap-2">
            <span>Live Transit: {selectedShipment.originName}</span>
            <span className="text-slate-400 font-normal">→</span>
            <span className={isRerouted ? 'text-emerald-700' : 'text-slate-800'}>
              {selectedShipment.currentDestinationName}
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700">
            Driver: <strong className="text-slate-900">{selectedShipment.driverName}</strong> ({selectedShipment.vehicleNumber})
          </div>

          <div className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200 font-mono-data font-semibold">
            Seal: {selectedShipment.batch.tamperSealId} (INTACT)
          </div>
        </div>
      </div>

      {/* Dynamic Status / Crop Rescue Alert */}
      <CropRescueBanner />

      {/* Top 4 Real-Time Gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Temperature Gauge */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Container Temp</span>
            <Thermometer className={`w-4 h-4 ${lastSensor.temperatureC >= 28 ? 'text-red-500 animate-pulse' : 'text-emerald-600'}`} />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-2xl sm:text-3xl font-black font-mono-data ${lastSensor.temperatureC >= 28 ? 'text-red-600' : 'text-slate-900'}`}>
              {lastSensor.temperatureC}°C
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              (Cargo: {lastSensor.cargoTempC || lastSensor.temperatureC - 3}°C)
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Optimal: 12°C - 18°C for {selectedShipment.batch.cropType}
          </div>
        </div>

        {/* Humidity Gauge */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Cargo Humidity</span>
            <Droplets className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono-data">
              {lastSensor.humidityPct}%
            </span>
            <span className="text-xs text-emerald-600 font-semibold">Optimal</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Target RH: 80% - 90%
          </div>
        </div>

        {/* Speed & GPS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Velocity & Signal</span>
            <Gauge className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono-data">
              {selectedShipment.currentSpeedKmh} <span className="text-sm font-normal text-slate-500">km/h</span>
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono-data">
            {selectedShipment.currentLocation.label}
          </div>
        </div>

        {/* Freshness Safe Window */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Estimated Safe Window</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-2xl sm:text-3xl font-black font-mono-data ${selectedShipment.safeSellingWindowHours < 6 ? 'text-red-600' : 'text-emerald-700'}`}>
              {selectedShipment.safeSellingWindowHours.toFixed(1)}h
            </span>
            <span className="text-xs font-bold text-slate-500">
              Score: {selectedShipment.freshnessScore}/100
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            AI biological decay estimate
          </div>
        </div>
      </div>

      {/* Main Interactive Map Stage */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-600" />
            <span>Interactive Supply-Chain Radar Map</span>
          </h3>
        </div>
        <InteractiveMap />
      </div>

      {/* Live Weather and Climate Corridor Tracker */}
      <WeatherTracker />

      {/* 9. IoT SENSOR SIMULATION CONTROL PANEL */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-slate-900 text-emerald-400 px-2 py-0.5 rounded">
                SIMULATION LAB
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                IoT Sensor Telemetry Simulator (No Hardware Required)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Adjust temperature and traffic in real-time. Notice how the spoilage-risk score and remaining safe window dynamically update.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleGpsSimulation}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                isGpsSimulating 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                  : 'bg-amber-50 text-amber-700 border-amber-300'
              }`}
            >
              {isGpsSimulating ? '🟡 GPS Sim Active' : '🔴 GPS Live Connected'}
            </button>
          </div>
        </div>

        {/* Temperature presets (Prompt 9: 10:00 24°C, 11:00 25°C, 12:00 27°C Warning, 13:00 31°C High Risk, 14:00 33°C Critical) */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2">
            Quick Incident Presets (Step through environmental stress):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              onClick={() => setTempPreset(24)}
              className={`p-2.5 rounded-xl text-left border transition cursor-pointer ${
                lastSensor.temperatureC === 24 
                  ? 'bg-emerald-50 border-emerald-500 shadow-xs' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="text-[11px] font-bold text-slate-500 font-mono-data">10:00 AM</div>
              <div className="text-sm font-black text-slate-900 font-mono-data">24°C</div>
              <div className="text-[10px] text-emerald-700 font-semibold">Normal 🟢</div>
            </button>

            <button
              onClick={() => setTempPreset(25)}
              className={`p-2.5 rounded-xl text-left border transition cursor-pointer ${
                lastSensor.temperatureC === 25 
                  ? 'bg-emerald-50 border-emerald-500 shadow-xs' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="text-[11px] font-bold text-slate-500 font-mono-data">11:00 AM</div>
              <div className="text-sm font-black text-slate-900 font-mono-data">25°C</div>
              <div className="text-[10px] text-emerald-700 font-semibold">Normal 🟢</div>
            </button>

            <button
              onClick={() => setTempPreset(27)}
              className={`p-2.5 rounded-xl text-left border transition cursor-pointer ${
                lastSensor.temperatureC === 27 
                  ? 'bg-amber-50 border-amber-500 shadow-xs' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="text-[11px] font-bold text-slate-500 font-mono-data">12:00 PM</div>
              <div className="text-sm font-black text-amber-700 font-mono-data">27°C</div>
              <div className="text-[10px] text-amber-700 font-semibold">Warning 🟡</div>
            </button>

            <button
              onClick={() => setTempPreset(31)}
              className={`p-2.5 rounded-xl text-left border transition cursor-pointer ${
                lastSensor.temperatureC === 31 
                  ? 'bg-orange-50 border-orange-500 shadow-xs' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="text-[11px] font-bold text-slate-500 font-mono-data">01:00 PM</div>
              <div className="text-sm font-black text-orange-700 font-mono-data">31°C</div>
              <div className="text-[10px] text-orange-700 font-semibold">High Risk 🟠</div>
            </button>

            <button
              onClick={() => setTempPreset(33)}
              className={`p-2.5 rounded-xl text-left border transition cursor-pointer ${
                lastSensor.temperatureC === 33 
                  ? 'bg-red-50 border-red-500 shadow-xs' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="text-[11px] font-bold text-slate-500 font-mono-data">02:00 PM</div>
              <div className="text-sm font-black text-red-600 font-mono-data">33°C</div>
              <div className="text-[10px] text-red-600 font-semibold">Critical 🔴</div>
            </button>
          </div>
        </div>

        {/* Continuous Slider */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Continuous Cargo Temperature Controller:</span>
            <span className="font-mono-data font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
              {customTemp}°C
            </span>
          </div>
          <input
            id="temperature-slider"
            type="range"
            min="10"
            max="42"
            step="1"
            value={customTemp}
            onChange={handleTempSliderChange}
            aria-label="Continuous Cargo Temperature Controller"
            className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono-data">
            <span>10°C (Cold Storage)</span>
            <span>24°C (Normal)</span>
            <span>30°C (Threshold)</span>
            <span>42°C (Extreme Heat)</span>
          </div>
        </div>

        {/* Traffic Delay Simulator */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <span className="font-bold text-slate-800">Highway Traffic & Road Bottlenecks:</span>
            <p className="text-slate-500 text-[11px]">Simulate Kasara Ghat landslide clearance vs open expressway.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setManualTrafficCongestion(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
            >
              Clear Expressway (ETA 3h 30m)
            </button>
            <button
              onClick={() => setManualTrafficCongestion(true)}
              className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 font-bold transition cursor-pointer"
            >
              Gridlock Kasara Ghat (ETA 8h 10m) 🔴
            </button>
          </div>
        </div>
      </div>

      {/* 11. DYNAMIC REROUTING COMPARISON BOX */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600" />
              <span>Dynamic Route Evaluation & Spoilage Comparison</span>
            </h3>
            <p className="text-xs text-slate-500">
              FreshRoute™ balances distance, speed, thermal exposure, and buyer demand.
            </p>
          </div>

          {!isRerouted && (
            <button
              id="dynamic-reroute-market-b-btn"
              onClick={() => confirmReroute('market-b')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>CONFIRM REROUTE TO MARKET B</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current Route */}
          <div className={`p-4 rounded-xl border ${
            isRerouted 
              ? 'bg-slate-50 border-slate-200 opacity-60' 
              : 'bg-red-50/50 border-red-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                CURRENT ROUTE {isRerouted ? '(ABORTED)' : '(PRIMARY)'}
              </span>
              <span className="text-xs font-black text-red-600 bg-red-100 px-2 py-0.5 rounded">
                HIGH SPOILAGE RISK 🔴
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              NH-160 to Mumbai Central APMC
            </h4>
            <div className="mt-3 space-y-1.5 text-xs text-slate-600 font-mono-data">
              <div className="flex justify-between">
                <span>Distance:</span>
                <span className="font-semibold text-slate-900">110 km</span>
              </div>
              <div className="flex justify-between">
                <span>ETA:</span>
                <span className="font-semibold text-red-600">7h 20m - 8h 10m (Traffic Block)</span>
              </div>
              <div className="flex justify-between">
                <span>Safe Window Deficit:</span>
                <span className="font-semibold text-red-600">-3h 58m (Exceeded)</span>
              </div>
            </div>
          </div>

          {/* Alternative Route */}
          <div className={`p-4 rounded-xl border ${
            isRerouted 
              ? 'bg-emerald-50/60 border-emerald-500 shadow-sm' 
              : 'bg-emerald-50/30 border-emerald-300'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                ALTERNATIVE ROUTE (AI FRESHROUTE™)
              </span>
              <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                LOW SPOILAGE RISK 🟢
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              Divert via SH-44 to Pune Agro Logistics Terminal
            </h4>
            <div className="mt-3 space-y-1.5 text-xs text-slate-600 font-mono-data">
              <div className="flex justify-between">
                <span>Distance:</span>
                <span className="font-semibold text-slate-900">55 km</span>
              </div>
              <div className="flex justify-between">
                <span>ETA:</span>
                <span className="font-semibold text-emerald-700">3h 50m (Clear Passage)</span>
              </div>
              <div className="flex justify-between">
                <span>Safe Window Margin:</span>
                <span className="font-semibold text-emerald-700">+22 mins buffer</span>
              </div>
              <div className="flex justify-between">
                <span>Buyer Price:</span>
                <span className="font-semibold text-emerald-700">₹42/kg (+₹4/kg premium)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
