import React from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Thermometer,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DriverAlertsView: React.FC = () => {
  const { notifications, markNotificationRead } = useApp();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Driver Road & Telemetry Alerts
          </h2>
          <p className="text-xs text-slate-500">
            Real-time notifications for traffic bottlenecks, reefer temperature deviations, and AI route updates
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => markNotificationRead(n.id)}
            className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
              n.read ? 'bg-white border-slate-200' : 'bg-blue-50/50 border-blue-200 text-slate-900 shadow-xs'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">{n.title}</h4>
                <span className="text-[11px] text-slate-400 font-mono">{n.timestamp}</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
