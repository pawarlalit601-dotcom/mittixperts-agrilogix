import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  LifeBuoy, 
  AlertTriangle, 
  ShieldCheck, 
  Truck, 
  Clock, 
  Gavel, 
  Store, 
  CheckCircle2, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminDashboardTab: React.FC = () => {
  const { 
    shipments, 
    disputes, 
    notifications, 
    markets, 
    setActiveTab, 
    setSelectedShipmentId 
  } = useApp();

  const totalKgAvoided = 3800;
  const valuePreservedInr = 152000;
  const activeRescues = shipments.filter(s => s.status === 'RESCUE_ACTIVE' || s.spoilageRisk === 'CRITICAL').length;

  return (
    <div id="admin-dashboard-tab" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-slate-900 text-emerald-400 text-xs font-mono font-bold px-2.5 py-0.5 rounded uppercase tracking-wide">
                EXECUTIVE INTELLIGENCE COMMAND
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">
              Regional Agricultural Supply-Chain Logistics Control
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Holistic macro monitoring across farm weighbridges, highway corridors, cold-storage terminals, and receiving APMCs.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-600 font-bold">ALL SATELLITE & SENSOR NODES OPERATIONAL</span>
          </div>
        </div>
      </div>

      {/* 19. Admin KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">Active Shipments</div>
          <div className="text-2xl font-black text-slate-900 font-mono-data mt-1">{shipments.length}</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">3 En-Route</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">At-Risk Batches</div>
          <div className="text-2xl font-black text-red-600 font-mono-data mt-1">{activeRescues}</div>
          <div className="text-[10px] text-red-600 font-medium mt-0.5">Kasara Bottleneck</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">Successful Rescues</div>
          <div className="text-2xl font-black text-emerald-700 font-mono-data mt-1">12</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">98.4% Rescue Rate</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">Spoilage Avoided</div>
          <div className="text-2xl font-black text-slate-900 font-mono-data mt-1">3,800 kg</div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">Biochemically Salvaged</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">Value Preserved</div>
          <div className="text-2xl font-black text-emerald-700 font-mono-data mt-1">₹1,52,000</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Zero Loss Realized</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">Active Markets</div>
          <div className="text-2xl font-black text-slate-900 font-mono-data mt-1">{markets.length}</div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">Regional Nodes</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">Logged Disputes</div>
          <div className="text-2xl font-black text-slate-900 font-mono-data mt-1">{disputes?.length || 0}</div>
          <div className="text-[10px] text-blue-600 font-medium mt-0.5">100% Resolved</div>
        </div>
      </div>

      {/* Active Fleet Operations Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-slate-900">
            Active Fleet Shipments & Spoilage Margin Table
          </h3>
          <span className="text-xs text-slate-500 font-mono">Live Telemetry Synchronized</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-data">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Batch / Crop</th>
                <th className="py-2.5 px-3">Driver / Truck</th>
                <th className="py-2.5 px-3">Destination</th>
                <th className="py-2.5 px-3">Safe Window</th>
                <th className="py-2.5 px-3">ETA</th>
                <th className="py-2.5 px-3">Spoilage Risk</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {shipments.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900">#{s.batch.id}</span>
                    <span className="text-slate-400 ml-1">({s.batch.cropType} {s.batch.quantityKg}kg)</span>
                  </td>
                  <td className="py-3 px-3">
                    <div>{s.driverName}</div>
                    <div className="text-[10px] text-slate-400">{s.vehicleNumber}</div>
                  </td>
                  <td className="py-3 px-3 font-sans font-medium text-slate-900">
                    {s.currentDestinationName}
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-700">
                    {s.safeSellingWindowHours.toFixed(1)}h
                  </td>
                  <td className="py-3 px-3">
                    {Math.floor(s.estimatedTravelTimeMinutes / 60)}h {s.estimatedTravelTimeMinutes % 60}m
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      s.spoilageRisk === 'CRITICAL' || s.spoilageRisk === 'HIGH'
                        ? 'bg-red-100 text-red-700'
                        : s.spoilageRisk === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {s.spoilageRisk}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold">
                    {s.status}
                  </td>
                  <td className="py-3 px-3 text-right font-sans">
                    <button
                      onClick={() => {
                        setSelectedShipmentId(s.id);
                        setActiveTab('tracking');
                      }}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                    >
                      Track →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two-Column Grid: Alerts Feed & Recent Forensic Disputes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts Feed */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Autonomous Anomaly & Incident Feed
            </h3>
            <span className="text-xs text-slate-400 font-mono">Real-Time Polling</span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <div key={n.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`font-bold ${
                    n.severity === 'critical' ? 'text-red-600' : n.severity === 'warning' ? 'text-amber-600' : 'text-slate-800'
                  }`}>
                    {n.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono-data">{n.timestamp}</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Forensic Disputes */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Evidence-Based Dispute Docket
            </h3>
            <button
              onClick={() => setActiveTab('disputes')}
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Open Audit Tool
            </button>
          </div>

          <div className="space-y-3">
            {(disputes || []).map((d) => (
              <div key={d.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">CASE #{d.id}</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    {d.status}
                  </span>
                </div>
                <p className="text-slate-700 font-medium">“{d.claimReason}”</p>
                <div className="text-[11px] text-slate-500 font-mono">
                  Diagnosis: <strong className="text-slate-800">{d.auditOutcome}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
