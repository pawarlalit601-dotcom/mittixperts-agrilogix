import React from 'react';
import {
  User,
  Truck,
  Phone,
  ShieldCheck,
  Award,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DriverProfileView: React.FC = () => {
  const { logout } = useApp();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-100 text-center sm:text-left">
          <div className="w-20 h-20 rounded-3xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-600/20">
            VS
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">Vikram Shinde</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-300 w-fit mx-auto sm:mx-0">
                Certified Cold-Chain Driver
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Vehicle: MH-15-TC-4402 (Carrier Transicold Reefer Unit)
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                Heavy Transport Commercial License: MH15-2018-99421
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                +91 98811 55210
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xs text-slate-400">Total Safe Deliveries</div>
            <div className="text-xl font-black text-slate-900 font-mono-data mt-0.5">384 Trips</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">99.8% On-Time Record</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xs text-slate-400">AI Route Compliance</div>
            <div className="text-xl font-black text-blue-700 font-mono-data mt-0.5">100%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Prompt Detour Adoptions</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xs text-slate-400">Cargo Freshness Rating</div>
            <div className="text-xl font-black text-emerald-700 font-mono-data mt-0.5">4.9 / 5.0 ★</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Based on dock inspections</div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
          >
            Log Out of Account
          </button>
        </div>
      </div>
    </div>
  );
};
