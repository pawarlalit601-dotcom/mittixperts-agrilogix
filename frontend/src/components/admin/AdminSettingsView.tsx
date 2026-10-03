import React from 'react';
import {
  Settings,
  ShieldCheck,
  Server,
  Bell,
  Cpu,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminSettingsView: React.FC = () => {
  const { logout, resetToInitialState } = useApp();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Network System Configuration</h2>
            <p className="text-xs text-slate-500">Autonomous alert triggers, decay models, and API integrations</p>
          </div>
          <button
            onClick={resetToInitialState}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Operational Data</span>
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">Crop Decay Equation Sensitivity</div>
              <div className="text-slate-500 mt-0.5">Arrhenius thermal decay multiplier (Default 1.4x per 5°C)</div>
            </div>
            <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded">1.40x</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">Autonomous Rescue Buffer Margin</div>
              <div className="text-slate-500 mt-0.5">Time threshold before trigger: When ETA &gt; SafeWindow - 30 min</div>
            </div>
            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">30 min</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">External Highway Traffic API</div>
              <div className="text-slate-500 mt-0.5">State Police & Tollway FASTag Congestion Feed</div>
            </div>
            <span className="text-emerald-700 font-bold">CONNECTED 🟢</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out Admin Console</span>
          </button>
        </div>
      </div>
    </div>
  );
};
