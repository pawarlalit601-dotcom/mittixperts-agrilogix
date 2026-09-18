import React from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FarmerAlertsView: React.FC = () => {
  const { notifications, markNotificationRead } = useApp();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Farmer Alerts & System Notifications
          </h2>
          <p className="text-xs text-slate-500">
            Live updates on cargo temperature, highway congestion, buyer offtake matches, and delivery receipts
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((item) => (
          <div
            key={item.id}
            onClick={() => markNotificationRead(item.id)}
            className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
              item.read
                ? 'bg-white border-slate-200/80 text-slate-600'
                : 'bg-emerald-50/40 border-emerald-300 text-slate-900 shadow-xs'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              item.severity === 'critical'
                ? 'bg-red-100 text-red-700'
                : item.severity === 'warning'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {item.severity === 'critical' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : item.severity === 'warning' ? (
                <Bell className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  {item.title}
                </h4>
                <span className="text-[11px] text-slate-400 font-mono shrink-0">
                  {item.timestamp}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {item.message}
              </p>
            </div>

            {!item.read && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0 mt-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
