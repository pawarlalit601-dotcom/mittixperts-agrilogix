import React from 'react';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Navigation,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Thermometer,
  Clock,
  PlusCircle,
  Phone,
  Store
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FarmerDashboardView: React.FC = () => {
  const {
    selectedShipment,
    setActiveTab,
    openCreateShipmentModal,
    shipmentProgressPct,
    isTruckArrivingSoon
  } = useApp();

  const isRescueActive = selectedShipment.status === 'RESCUE_ACTIVE' || selectedShipment.status === 'AT_RISK';

  return (
    <div className="space-y-6">
      {/* Top Welcome / Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Welcome, Ramesh Patel
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
              Sahyadri Agro Hub
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time dispatch, transit conditions, and AI freshness across your active farm shipments.
          </p>
        </div>

        <button
          onClick={openCreateShipmentModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Shipment</span>
        </button>
      </div>

      {/* 4 Top Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Active Shipments</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-data">3</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Produce in transit</div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-xs ${
          isRescueActive ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200/90'
        }`}>
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">At Risk</span>
            <AlertTriangle className={`w-4 h-4 ${isRescueActive ? 'text-red-500 animate-pulse' : 'text-amber-500'}`} />
          </div>
          <div className={`text-2xl font-black font-mono-data ${isRescueActive ? 'text-red-600' : 'text-slate-900'}`}>
            1 ⚠️
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-0.5">Needs attention</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Today's Deliveries</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-data">2</div>
          <div className="text-[11px] text-blue-600 font-medium mt-0.5">Accepted at terminal</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Estimated Wastage Avoided</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono-data">₹8,500</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Saved via AI Rescue</div>
        </div>
      </div>

      {/* Main Active Shipment Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                Batch #TG102
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Tomato Batch #TG102
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Organic Hybrid Vine-Ripened • Harvested today at 06:30 AM
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              selectedShipment.status === 'DELIVERED' 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                : isRescueActive 
                ? 'bg-red-100 text-red-800 border-red-300 animate-pulse'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {selectedShipment.status === 'DELIVERED' ? 'Delivered ✅' : 'On the way 🟢'}
            </span>
          </div>
        </div>

        {/* Shipment Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-5 py-2">
          <div>
            <div className="text-xs text-slate-400 font-medium">Quantity</div>
            <div className="text-base font-bold text-slate-900 mt-0.5 font-mono-data">
              1,000 kg
            </div>
            <div className="text-[11px] text-slate-500">Certified Weight: 998 kg</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Destination</div>
            <div className="text-base font-bold text-slate-900 mt-0.5 truncate">
              {selectedShipment.currentDestinationName || 'Pune Market'}
            </div>
            <div className="text-[11px] text-slate-500">Via SH-44 Corridor</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">ETA</div>
            <div className="text-base font-bold text-slate-900 mt-0.5 font-mono-data">
              {Math.floor(selectedShipment.estimatedTravelTimeMinutes / 60)}h {selectedShipment.estimatedTravelTimeMinutes % 60}m
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">
              {selectedShipment.remainingDistanceKm} km remaining
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Freshness</div>
            <div className="text-base font-bold text-emerald-700 mt-0.5 font-mono-data">
              {selectedShipment.freshnessScore}%
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">
              Safe: ~{selectedShipment.safeSellingWindowHours}h window
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="my-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>Progress: Farm &rarr; Market</span>
            <span className="font-mono-data font-bold text-slate-900">{shipmentProgressPct}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${shipmentProgressPct}%` }}
            />
          </div>
        </div>

        {/* Bottom Status & Primary Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>
              Status:{' '}
              <strong className="text-slate-900">
                {selectedShipment.status === 'DELIVERED'
                  ? 'Produce delivered and confirmed by buyer dock'
                  : isTruckArrivingSoon
                  ? 'Driver is approaching the destination'
                  : 'Driver is en route to the destination'}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('freshness')}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              Freshness Details
            </button>

            <button
              id="track-truck-btn"
              onClick={() => setActiveTab('tracking')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>TRACK TRUCK</span>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab('freshness')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 transition cursor-pointer shadow-xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
            Freshness AI Monitor
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic biochemical decay prediction based on real-time container temperature and transit time.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('markets')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 transition cursor-pointer shadow-xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2">
            <Store className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
            Smart Market Finder
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Evaluate nearby regional wholesale APMC hubs to ensure quick liquidation at favorable rates.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('rescue')}
          className={`p-4 rounded-2xl border transition cursor-pointer shadow-xs group ${
            isRescueActive
              ? 'bg-red-50/60 border-red-200 hover:border-red-300'
              : 'bg-white border-slate-200/90 hover:border-emerald-300'
          }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
            isRescueActive ? 'bg-red-100 text-red-700' : 'bg-amber-50 text-amber-700'
          }`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-red-700 transition">
            Crop Rescue Mode
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Automatic rerouting if traffic delays or container temperature threaten produce spoilage.
          </p>
        </div>
      </div>
    </div>
  );
};
