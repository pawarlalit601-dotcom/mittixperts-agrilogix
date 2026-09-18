import React, { useState } from 'react';
import {
  ShieldAlert,
  Scale,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Car,
  CloudSun,
  Lock,
  Camera,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminDisputesView: React.FC = () => {
  const { selectedShipment } = useApp();
  const [verdictSettled, setVerdictSettled] = useState(false);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Dispute Resolution & Evidence Arbitrator
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-300">
              Case #DISP-2026-TG102
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Decisive algorithmic arbitration using tamper-evident BLE sensors and third-party highway weather logs
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-300 flex items-center gap-1.5 self-start sm:self-auto">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>⚠️ REVIEW REQUIRED</span>
        </span>
      </div>

      {/* Neutral Evidence Summary Card (Prompt Requirement) */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Neutral Evidence Summary
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Audit Hash: 0x4f89d31b2e90c8a1fe44
          </span>
        </div>
        <p className="text-base sm:text-lg font-bold text-slate-100 italic leading-relaxed">
          "Sensor logs show temperature violation during transit. Farm loading verified Grade A. Tamper seal intact."
        </p>
        <div className="text-xs text-slate-400 pt-1 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <span>Root Cause: Carrier refrigeration breakdown amidst Kasara Ghat traffic gridlock.</span>
          <span className="text-emerald-400 font-bold">Zero Farm Loading Malpractice</span>
        </div>
      </div>

      {/* Clear 3-Stage Timeline Required by Prompt */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100">
          Digital Chain of Custody Timeline
        </h3>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded">
                  FARM
                </span>
                <span className="font-bold text-slate-900 text-xs">
                  09:15 AM - Harvested & loaded Grade A, 998 kg, seal intact.
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Sahyadri Agro Hub &bull; Tare Certified Weighbridge #WB-9912 &bull; Brix 4.8
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
              Verified 100%
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded">
                  TRANSPORT
                </span>
                <span className="font-bold text-slate-900 text-xs">
                  01:45 PM - Temperature spiked to 33°C during 1h 45m traffic delay.
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                MH-15-TC-4402 &bull; BLE Logger #TG-SEN-01 logged sustained 33°C thermal excursion
              </p>
            </div>
            <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-1 rounded border border-red-200">
              Violation Detected
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded">
                  BUYER
                </span>
                <span className="font-bold text-slate-900 text-xs">
                  04:20 PM - Observed Grade B softening.
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                FreshMart Pune Dock &bull; Received weight 998 kg &bull; Tamper seal verified intact at dock
              </p>
            </div>
            <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-200">
              Receiving Logged
            </span>
          </div>
        </div>

        {/* Environmental Verification Required by Prompt */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Environmental Cross-Verification (External Data APIs)
            </h4>
            <span className="text-[11px] text-emerald-700 font-bold">
              Prevents false claims by drivers or buyers
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Car className="w-4 h-4 text-amber-600" />
                <span>Road Traffic Status</span>
              </div>
              <div className="text-slate-600 mt-1 text-[11px]">
                NH-160 Kasara Ghat verified 1h 45m traffic dead halt by Highway Police API.
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <CloudSun className="w-4 h-4 text-amber-600" />
                <span>Weather at Incident</span>
              </div>
              <div className="text-slate-600 mt-1 text-[11px]">
                Indian Meteorological Dept historical API confirms 36.2°C ambient heatwave.
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Route Deviation Logs</span>
              </div>
              <div className="text-slate-600 mt-1 text-[11px]">
                No unauthorized stops detected. Vehicle strictly adhered to designated corridor.
              </div>
            </div>
          </div>
        </div>

        {/* Administrative Arbitration Ruling */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            Recommended Action: <strong>Release 100% farm payout (₹44,000) from insurance pool. Bill carrier reefer deductible.</strong>
          </div>

          <button
            onClick={() => setVerdictSettled(true)}
            disabled={verdictSettled}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              verdictSettled
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{verdictSettled ? 'VERDICT SEALED ON-CHAIN' : 'ENFORCE SETTLEMENT VERDICT'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
