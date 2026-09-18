import React, { useState } from 'react';
import {
  Menu,
  Bell,
  User,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  LogOut,
  Repeat
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const TopBar: React.FC = () => {
  const {
    userRole,
    setUserRole,
    activeTab,
    toggleMobileSidebar,
    notifications,
    markNotificationRead,
    logout,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.read);

  // Derive dynamic page title based on role & active tab
  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Home';
      case 'shipments':
      case 'my-shipments':
        return 'My Shipments';
      case 'tracking':
        return 'Live Truck Tracking';
      case 'freshness':
        return 'Freshness AI Intelligence';
      case 'markets':
        return 'Smart Market Finder';
      case 'rescue':
        return '🚨 Crop Rescue Mode';
      case 'verification':
        return 'Dispatch & Inspection Verification';
      case 'alerts':
        return 'Operational Alerts & Notifications';
      case 'trips':
        return 'My Assigned Trips';
      case 'navigation':
        return 'Turn-by-Turn GPS Navigation';
      case 'freshroute':
        return 'AI FreshRoute™ Recommendation';
      case 'sensors':
        return 'IoT Sensor Telemetry & Simulation';
      case 'delivery':
        return 'Delivery Completion Handover';
      case 'incoming':
        return 'Incoming Produce Shipments';
      case 'find-produce':
        return 'Regional Produce Marketplace';
      case 'receiving':
        return 'Dock Receiving & Acceptance';
      case 'disputes':
        return 'Dispute Evidence & Audit Timeline';
      case 'all-shipments':
        return 'Network Shipments Directory';
      case 'fleet':
        return 'Live Fleet Telemetry';
      case 'risk-monitor':
        return 'Freshness Degradation Risk Monitor';
      case 'analytics':
        return 'Supply-Chain Wastage Analytics';
      case 'users':
        return 'Authorized Stakeholders Directory';
      case 'settings':
        return 'System & Threshold Settings';
      case 'profile':
        return 'User Account Profile';
      default:
        return 'Agrilogix';
    }
  };

  const rolesList: { role: UserRole; label: string; icon: string; color: string }[] = [
    { role: 'FARMER', label: 'Farmer', icon: '👨‍🌾', color: 'text-emerald-700 bg-emerald-50' },
    { role: 'DRIVER', label: 'Driver', icon: '🚚', color: 'text-blue-700 bg-blue-50' },
    { role: 'BUYER', label: 'Buyer', icon: '🏪', color: 'text-amber-700 bg-amber-50' },
    { role: 'ADMIN', label: 'Admin', icon: '🛠️', color: 'text-purple-700 bg-purple-50' },
  ];

  const currentRoleItem = rolesList.find((r) => r.role === userRole) || rolesList[0];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 h-16 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile Menu Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {getPageTitle()}
          </h1>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500">
            <span>Operations Overview</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">System Ready</span>
          </div>
        </div>
      </div>

      {/* Right: Notifications, Role Badge & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Notifications Icon with Badge & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowRoleMenu(false);
            }}
            aria-label="Notifications"
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 text-left">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {unreadNotifications.length} Unread
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2">
                {notifications.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => markNotificationRead(item.id)}
                    className={`p-2.5 rounded-xl text-xs border transition cursor-pointer ${
                      item.read ? 'bg-slate-50 border-slate-100 text-slate-600' : 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-xs truncate">{item.title}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">{item.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{item.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Role Badge & Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowNotifications(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold cursor-pointer hover:bg-slate-50 transition ${currentRoleItem.color}`}
          >
            <span>{currentRoleItem.icon}</span>
            <span className="hidden sm:inline">{currentRoleItem.label}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {/* Role Switcher Menu */}
          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 text-left">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
                Switch Role View
              </div>

              <div className="space-y-1">
                {rolesList.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      setUserRole(r.role);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                      userRole === r.role ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{r.icon}</span>
                      <span>{r.label}</span>
                    </div>
                    {userRole === r.role && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setShowRoleMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out to Login Screen</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
