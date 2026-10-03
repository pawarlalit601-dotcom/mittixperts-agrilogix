import React, { useState } from 'react';
import { 
  Truck, 
  Navigation, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  QrCode, 
  ArrowRight,
  Compass,
  Phone,
  Radio,
  FileCheck2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DriverTab: React.FC = () => {
  const { 
    selectedShipment, 
    confirmReroute, 
    completeDelivery, 
    setActiveTab 
  } = useApp();

  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);
  const [buyerSignature, setBuyerSignature] = useState('');

  const isRerouted = selectedShipment.status === 'REROUTED' || selectedShipment.status === 'DELIVERED';
  const isRescueTriggered = selectedShipment.status === 'RESCUE_ACTIVE' || selectedShipment.rescueActivated;
  const isDelivered = selectedShipment.status === 'DELIVERED' || deliveryConfirmed;

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeDelivery(selectedShipment.id);
    setDeliveryConfirmed(true);
  };

  return (
    <div id="driver-tab" className="space-y-6">
      {/* Driver Mobile-First Terminal Frame */}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Driver Header */}
        <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-md">
              RP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Rajesh Patil</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                  GPS LIVE
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono-data">
                Vehicle: {selectedShipment.vehicleNumber} • Batch #{selectedShipment.batch.id}
              </div>
            </div>
          </div>

          <div className="text-right text-xs">
            <div className="text-slate-400">Cargo:</div>
            <div className="font-bold text-emerald-400 font-mono-data">
              {selectedShipment.batch.cropType} {selectedShipment.batch.quantityKg}kg
            </div>
          </div>
        </div>

        {/* 17. Reroute Notification Alert Box (Driver Screen) */}
        {!isRerouted && isRescueTriggered && (
          <div className="bg-gradient-to-br from-red-950 to-rose-900 border-2 border-red-500 rounded-3xl p-6 text-white shadow-2xl space-y-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-600 rounded-2xl text-white">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider bg-red-500 text-white px-2 py-0.5 rounded">
                  CRITICAL DISPATCH NOTICE
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  🚨 ATTENTION DRIVER: REROUTE RECOMMENDED
                </h3>
              </div>
            </div>

            <p className="text-xs text-red-100 leading-relaxed">
              Kasara Ghat road closure ahead updates ETA by +4 hours. Cargo temperatures are rising. Dispatch HQ has authorized diversion to protect crop value.
            </p>

            <div className="bg-black/40 p-4 rounded-2xl border border-red-500/40 text-xs space-y-2 font-mono-data">
              <div className="flex justify-between">
                <span className="text-slate-400">Previous Destination:</span>
                <span className="text-red-300 line-through font-bold">Mumbai Central APMC (ETA 8h 10m)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">New Destination:</span>
                <span className="text-emerald-300 font-bold">Pune Agro Logistics Hub (ETA 3h 50m)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Highway Route:</span>
                <span className="text-white font-bold">Divert via SH-44 at next junction</span>
              </div>
            </div>

            <button
              id="driver-accept-reroute-btn"
              onClick={() => confirmReroute('market-b')}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm py-3.5 rounded-2xl transition shadow-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <Navigation className="w-5 h-5 fill-current" />
              <span>ACCEPT REROUTE & START TURN-BY-TURN NAVIGATION</span>
            </button>
          </div>
        )}

        {/* In-Transit Active Navigation HUD */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Turn-by-Turn In-Cab HUD
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
              Speed: {selectedShipment.currentSpeedKmh} km/h
            </span>
          </div>

          {/* Turn instruction card */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500 text-slate-950 rounded-xl font-black text-xl">
              ↱
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">
                Next Waypoint in 1.4 km
              </div>
              <div className="text-base font-extrabold text-white">
                {isRerouted ? 'Take Exit 12B toward SH-44 Pune Expressway' : 'Continue on NH-160 toward Kasara Ghat'}
              </div>
            </div>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-3 gap-3 text-center font-mono-data">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-[10px] text-slate-400 font-sans">Distance Left</div>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {isRerouted ? '55 km' : '110 km'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-[10px] text-slate-400 font-sans">ETA to Gate</div>
              <div className={`text-base font-black mt-0.5 ${isRerouted ? 'text-emerald-700' : 'text-red-600'}`}>
                {Math.floor(selectedShipment.estimatedTravelTimeMinutes / 60)}h {selectedShipment.estimatedTravelTimeMinutes % 60}m
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-[10px] text-slate-400 font-sans">Reefer Temp</div>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {selectedShipment.sensorHistory[selectedShipment.sensorHistory.length - 1]?.temperatureC || 24}°C
              </div>
            </div>
          </div>
        </div>

        {/* 17. Delivery Checkpoint & Arrival Verification Screen */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Destination Receiving Dock Handshake
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">Dock Gate 4</span>
          </div>

          {!isDelivered ? (
            <form onSubmit={handleDeliverySubmit} className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Tamper-Evident Seal Inspection at Gate</span>
                </div>
                <p className="text-emerald-800">
                  Receiver dock officer verifies RFID Seal <strong className="font-mono">#SEAL-9921-IN</strong>. Visual physical check confirms zero tampering or broken latch.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Receiving Dock Officer / Buyer Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sunil Rao (FreshMart Procurement Lead)"
                  value={buyerSignature}
                  onChange={(e) => setBuyerSignature(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm py-3 rounded-xl transition shadow cursor-pointer flex items-center justify-center gap-2"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>CONFIRM ARRIVAL & SEAL DIGITAL DELIVERY RECEIPT</span>
              </button>
            </form>
          ) : (
            <div className="p-4 bg-emerald-500/20 border border-emerald-400 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-emerald-900">
                Delivery Completed & Verified!
              </h4>
              <p className="text-xs text-emerald-800">
                Crop Batch #{selectedShipment.batch.id} safely received at {selectedShipment.currentDestinationName}. Digital evidence ledger updated.
              </p>
              <button
                onClick={() => setActiveTab('disputes')}
                className="mt-2 text-xs font-bold text-emerald-700 hover:underline inline-block cursor-pointer"
              >
                Inspect Signed Digital Chain of Custody →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
