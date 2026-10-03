import React, { useState } from 'react';
import { 
  Sprout, 
  Map, 
  LifeBuoy, 
  Store, 
  ShoppingCart, 
  ShieldCheck, 
  FileText, 
  BrainCircuit, 
  Bell, 
  Play, 
  RotateCcw, 
  Users, 
  Truck, 
  SlidersHorizontal,
  ChevronDown,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    userRole,
    setUserRole,
    shipments,
    selectedShipmentId,
    setSelectedShipmentId,
    notifications,
    markNotificationRead,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const roles: { role: UserRole; label: string; icon: string }[] = [
    { role: 'EXECUTIVE', label: 'Executive / Admin', icon: '👔' },
    { role: 'FARMER', label: 'Farmer App', icon: '🌾' },
    { role: 'DRIVER', label: 'Driver App', icon: '🚚' },
    { role: 'BUYER', label: 'Buyer App', icon: '🛒' },
    { role: 'BUSINESS', label: 'Business Portal', icon: '🏢' },
    { role: 'AUDITOR', label: 'Dispute Auditor', icon: '⚖️' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-50 border-b border-slate-200/90 shadow-xs">
      {/* Top Utility Strip */}
      <div className="bg-slate-900 text-white px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold text-emerald-300 tracking-wide uppercase text-[11px]">
            Agrilogix Real-Time Intelligence
          </span>
          <span className="hidden sm:inline text-slate-400 text-[11px]">•</span>
          <span className="hidden sm:inline text-slate-300 text-[11px]">“Track. Predict. Reroute. Rescue.”</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Shipment Selector */}
          <div className="flex items-center gap-1.5 text-slate-300 text-xs">
            <span className="text-slate-400 hidden sm:inline">Active Batch:</span>
            <select
              id="shipment-selector"
              value={selectedShipmentId}
              onChange={(e) => setSelectedShipmentId(e.target.value)}
              aria-label="Select active shipment batch"
              className="bg-slate-800 text-white text-xs rounded-md px-2 py-0.5 border border-slate-700 font-mono-data focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
            >
              {shipments.map((s) => (
                <option key={s.id} value={s.id}>
                  #{s.batch.id} ({s.batch.cropType} {s.batch.quantityKg}kg - Freshness Monitor: {s.spoilageRisk})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main App Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Tagline */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition">
              <Sprout className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-black tracking-tight text-slate-900">
                  AGRI
                </span>
                <span className="text-lg font-extrabold text-emerald-600">
                  LOGIX
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase -mt-0.5">
                Track • Predict • Reroute • Rescue
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold text-slate-600">
            <button
              id="nav-tab-home"
              onClick={() => setActiveTab('home')}
              className={`px-3 py-2 rounded-lg transition cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-emerald-50 text-emerald-700 font-bold'
                  : 'hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Overview
            </button>

            <button
              id="nav-tab-tracking"
              onClick={() => setActiveTab('tracking')}
              className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'tracking'
                  ? 'bg-emerald-50 text-emerald-700 font-bold'
                  : 'hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Live Tracking</span>
            </button>

            <button
              id="nav-tab-rescue"
              onClick={() => setActiveTab('rescue')}
              className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'rescue'
                  ? 'bg-red-50 text-red-700 font-extrabold border border-red-200'
                  : 'text-red-700 hover:bg-red-50/60'
              }`}
            >
              <LifeBuoy className="w-3.5 h-3.5 text-red-600" />
              <span>Crop Rescue ⭐</span>
            </button>

            <button
              id="nav-tab-markets"
              onClick={() => setActiveTab('markets')}
              className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'markets'
                  ? 'bg-emerald-50 text-emerald-700 font-bold'
                  : 'hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Smart Markets</span>
            </button>

            <button
              id="nav-tab-marketplace"
              onClick={() => setActiveTab('marketplace')}
              className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'marketplace'
                  ? 'bg-emerald-50 text-emerald-700 font-bold'
                  : 'hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Buyer Marketplace</span>
            </button>

            <button
              id="nav-tab-farmer"
              onClick={() => setActiveTab('farmer')}
              className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'farmer'
                  ? 'bg-emerald-50 text-emerald-700 font-bold'
                  : 'hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Farmer Dispatch</span>
            </button>

            <button
              id="nav-tab-disputes"
              onClick={() => setActiveTab('disputes')}
              className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'disputes'
                  ? 'bg-emerald-50 text-emerald-700 font-bold'
                  : 'hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Evidence Timeline</span>
            </button>

            <button
              id="nav-tab-ai-engine"
              onClick={() => setActiveTab('ai-engine')}
              className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ai-engine'
                  ? 'bg-purple-50 text-purple-700 font-bold'
                  : 'hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5 text-purple-600" />
              <span>AI FreshRoute™</span>
            </button>
          </nav>

          {/* Right Controls: Role Switcher & Notifications */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Role Switcher */}
            <div className="relative">
              <button
                id="role-menu-button"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl transition cursor-pointer border border-slate-200"
              >
                <Users className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Role:</span>
                <span className="text-emerald-700 font-bold uppercase">{userRole}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Select User Persona
                  </div>
                  {roles.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => {
                        setUserRole(r.role);
                        setShowRoleMenu(false);
                        if (r.role === 'FARMER') setActiveTab('farmer');
                        if (r.role === 'DRIVER') setActiveTab('tracking');
                        if (r.role === 'BUYER') setActiveTab('buyer');
                        if (r.role === 'AUDITOR') setActiveTab('disputes');
                        if (r.role === 'EXECUTIVE') setActiveTab('home');
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                        userRole === r.role ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{r.icon}</span>
                        <span>{r.label}</span>
                      </span>
                      {userRole === r.role && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                id="notifications-bell-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                  <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Smart Alerts & Telemetry Feed
                    </span>
                    <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      {notifications.length} logs
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3 text-xs transition hover:bg-slate-50 cursor-pointer ${
                          !n.read ? 'bg-emerald-50/50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
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
              )}
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Tab Strip */}
        <div className="flex xl:hidden overflow-x-auto gap-2 py-2 border-t border-slate-100 no-scrollbar text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'home' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'tracking' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Live Tracking
          </button>
          <button
            onClick={() => setActiveTab('rescue')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'rescue' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700'
            }`}
          >
            Crop Rescue ⭐
          </button>
          <button
            onClick={() => setActiveTab('markets')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'markets' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Smart Markets
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'marketplace' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Buyer Market
          </button>
          <button
            onClick={() => setActiveTab('farmer')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'farmer' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Farmer Dispatch
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'disputes' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Evidence Timeline
          </button>
          <button
            onClick={() => setActiveTab('ai-engine')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'ai-engine' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700'
            }`}
          >
            AI FreshRoute™
          </button>
        </div>
      </div>
    </header>
  );
};
