import React from 'react';
import {
  CheckCircle2,
  Lock,
  Scale,
  QrCode,
  ShieldCheck,
  Building2,
  Truck,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DriverDeliveryView: React.FC = () => {
  const { selectedShipment, completeDelivery, setActiveTab } = useApp();
  const isDelivered = selectedShipment.status === 'DELIVERED';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Dock Handover & Delivery Verification</h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              Bay 4 Unloading Dock
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Present Tamper-Proof Seal #SEAL-9921-IN to receiving dock inspector
          </p>
        </div>

        {isDelivered && (
          <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4" />
            <span>Delivered & Handover Complete</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Driver Delivery Checklist
          </h3>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Vehicle Parked in Refrigerated Unloading Bay</span>
              </div>
              <span className="font-mono text-slate-500">Bay #04</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Physical Seal Inspection Passed</span>
              </div>
              <span className="font-mono text-emerald-700 font-bold">INTACT</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>In-Transit Temperature Record Logged</span>
              </div>
              <span className="font-mono text-slate-900">22°C AVG</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Buyer Dock QR Scan Code Ready</span>
              </div>
              <span className="font-mono text-emerald-700 font-bold">READY</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => completeDelivery()}
              disabled={isDelivered}
              className={`w-full py-3 rounded-2xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                isDelivered
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isDelivered ? 'DELIVERY CONFIRMED' : 'CONFIRM ARRIVAL & UNLOAD'}</span>
            </button>
          </div>
        </div>

        {/* Digital Pass Presentation */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
            <QrCode className="w-10 h-10" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Driver Cargo Manifest Gate Pass</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Show this digital gate pass to the receiving security guard at Pune Agro Terminal.
          </p>
          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs font-bold text-slate-800">
            PASS-AGRI-2026-TG102
          </div>
        </div>
      </div>
    </div>
  );
};
