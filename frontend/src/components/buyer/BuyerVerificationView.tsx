import React from 'react';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Camera,
  Thermometer,
  Activity,
  Calendar,
  MapPin,
  Scale
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BuyerVerificationView: React.FC = () => {
  const { selectedShipment, setActiveTab } = useApp();
  const batch = selectedShipment.batch;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Receiving Dock QR Scan & Digital Seal Verification
            </h2>
            <p className="text-xs text-slate-500">
              Cryptographic cross-examination of farm-gate loading records against incoming truck telemetry
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('receiving')}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          Proceed to Receiving Bay
        </button>
      </div>

      {/* Verified Checklist Required by Prompt:
          - Batch: TG102
          - 1,000 kg Tomatoes
          - Farm origin: Sahyadri Agro Farm
          - Loading photo
          - Digital seal: INTACT
          - Dispatch quality: Grade A
          - In-transit temperature history graph
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Comprehensive Verified Evidence */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="text-xs text-slate-400 font-bold uppercase">Batch ID</div>
              <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
                {batch.id}
              </div>
              <div className="text-[10px] text-emerald-700 font-bold mt-0.5">Verified ✓</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="text-xs text-slate-400 font-bold uppercase">Produce & Weight</div>
              <div className="text-xl font-black text-slate-900 font-mono-data mt-0.5">
                1,000 kg
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Tomatoes (Tare: 998 kg)</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="text-xs text-slate-400 font-bold uppercase">Dispatch Quality</div>
              <div className="text-xl font-black text-emerald-700 mt-0.5">
                Grade A
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Brix 4.8 &bull; Firmness 4.5</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="text-xs text-slate-400 font-bold uppercase">Digital Seal</div>
              <div className="text-xl font-black text-emerald-700 flex items-center gap-1 mt-0.5">
                <Lock className="w-4 h-4" />
                <span>INTACT</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">#SEAL-9921-IN</div>
            </div>
          </div>

          {/* Farm Origin & Loading Details */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>Farm Origin & Loading Checkpoint</span>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Origin Certified
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-slate-400">Farm Origin</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  Sahyadri Agro Farm FPO (Nashik)
                </div>
                <div className="text-slate-500 mt-0.5">Grower: Ramesh Patel &bull; Plot #NV-14</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-slate-400">Loading Timestamp & Gate</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  09:15 AM IST (Today)
                </div>
                <div className="text-slate-500 mt-0.5">Calibrated Weighbridge Bay 1</div>
              </div>
            </div>

            {/* Loading Photo Evidence */}
            <div>
              <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-slate-400" />
                <span>Farm Loading Photo Evidence</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-28 bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80"
                    alt="Loading Crates"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1.5 left-1.5 bg-slate-950/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                    Farm Gate Inspection
                  </span>
                </div>
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-28 bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=500&auto=format&fit=crop&q=80"
                    alt="Reefer Bay"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1.5 left-1.5 bg-slate-950/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                    Reefer Dock Stacking
                  </span>
                </div>
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-28 bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=500&auto=format&fit=crop&q=80"
                    alt="Tamper Seal"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1.5 left-1.5 bg-slate-950/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                    Seal #9921 Applied
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* In-Transit Temperature History Graph */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  In-Transit Temperature History Graph
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Log intervals: Every 15 min
              </span>
            </div>

            {/* Visual SVG Cold-Chain History Chart */}
            <div className="relative w-full h-36 bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between">
              {/* Reference Band for Safe Zone (18-24°C) */}
              <div className="absolute inset-x-4 top-8 bottom-8 bg-emerald-100/50 rounded pointer-events-none flex items-center justify-end px-2">
                <span className="text-[10px] text-emerald-800 font-bold">
                  Safe Cold-Chain Band (18°C - 24°C)
                </span>
              </div>

              {/* Bar telemetry simulation */}
              <div className="relative z-10 flex items-end justify-between h-24 gap-1.5 pt-4">
                {selectedShipment.sensorHistory.slice(-8).map((sh, idx) => {
                  const isSpike = sh.temperatureC > 28;
                  const heightPct = Math.min(100, Math.max(20, (sh.temperatureC / 38) * 100));

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-mono text-slate-500">
                        {sh.temperatureC}°
                      </span>
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          isSpike ? 'bg-red-500' : 'bg-emerald-500'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="text-[8px] text-slate-400 font-mono">
                        {sh.timestamp.split(' ')[1] || `T-${8 - idx}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-slate-500">
              All temperature telemetry logged directly by certified cryptographically authenticated IoT BLE data-loggers.
            </p>
          </div>
        </div>

        {/* Right Col: QR Code Scanner Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col items-center justify-between text-center space-y-6">
          <div className="w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Buyer QR Code Scanner
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Camera Online
              </span>
            </div>

            {/* Stylized QR Scanner */}
            <div className="w-48 h-48 mx-auto bg-slate-900 rounded-3xl p-5 border-2 border-amber-400 flex flex-col items-center justify-center relative shadow-inner">
              <div className="absolute inset-4 border border-amber-400/40 rounded-xl pointer-events-none" />
              {/* Scan laser animation */}
              <div className="absolute inset-x-4 h-0.5 bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-bounce" />

              <div className="w-28 h-28 bg-white p-2 rounded-xl flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-6 h-6 bg-slate-900 rounded-xs p-0.5">
                    <div className="w-full h-full bg-white rounded-2xs p-0.5">
                      <div className="w-full h-full bg-slate-900" />
                    </div>
                  </div>
                  <div className="w-6 h-6 bg-slate-900 rounded-xs p-0.5">
                    <div className="w-full h-full bg-white rounded-2xs p-0.5">
                      <div className="w-full h-full bg-slate-900" />
                    </div>
                  </div>
                </div>
                <div className="text-[8px] font-bold text-center text-slate-700">QR-TG102</div>
                <div className="flex justify-between">
                  <div className="w-6 h-6 bg-slate-900 rounded-xs p-0.5">
                    <div className="w-full h-full bg-white rounded-2xs p-0.5">
                      <div className="w-full h-full bg-slate-900" />
                    </div>
                  </div>
                  <div className="w-6 h-6 bg-slate-900 rounded-xs" />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs font-bold text-slate-900">
                Batch Hash Verified
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-1">
                {batch.officialDispatchHash || '0x4f89d31b2e90c8a1'}
              </div>
            </div>
          </div>

          <div className="w-full pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('receiving')}
              className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>CONFIRM DOCK INSPECTION</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
