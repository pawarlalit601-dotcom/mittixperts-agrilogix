import React from 'react';
import {
  TrendingUp,
  Award,
  LifeBuoy,
  Scale,
  ShieldCheck,
  CheckCircle2,
  PieChart
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminAnalyticsView: React.FC = () => {
  const { networkOverview } = useApp();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Platform Sustainability & Waste Reduction Analytics
          </h2>
          <p className="text-xs text-slate-500">
            Measuring economic savings, food rescue tonnage, and cold-chain reliability
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase text-slate-400">Total Food Waste Prevented</div>
          <div className="text-3xl font-black text-emerald-700 font-mono-data mt-2">
            184,200 kg
          </div>
          <div className="text-xs text-slate-500 mt-1">Over 1,240 farm dispatches</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase text-slate-400">Direct Farm Income Saved</div>
          <div className="text-3xl font-black text-purple-900 font-mono-data mt-2">
            ₹81,45,000
          </div>
          <div className="text-xs text-slate-500 mt-1">Average ₹65,000 per rescued truck</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase text-slate-400">Average Dispute Duration</div>
          <div className="text-3xl font-black text-slate-900 font-mono-data mt-2">
            14.2 min
          </div>
          <div className="text-xs text-emerald-700 font-bold mt-1">92% faster than manual arbitration</div>
        </div>
      </div>
    </div>
  );
};
