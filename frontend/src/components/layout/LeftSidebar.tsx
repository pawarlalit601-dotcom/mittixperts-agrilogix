import React from 'react';
import {
  LayoutDashboard,
  Package,
  Navigation,
  Sparkles,
  Store,
  LifeBuoy,
  ShieldCheck,
  Bell,
  User,
  LogOut,
  Truck,
  Compass,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Users,
  Settings,
  X,
  BarChart3,
  SlidersHorizontal,
  PlusCircle,
  HelpCircle,
  Building2,
  Receipt,
  ClipboardList
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import agrilogixLogo from '../../assets/agrilogix-logo.svg';

export const LeftSidebar: React.FC = () => {
  const {
    userRole,
    currentUser,
    activeTab,
    setActiveTab,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    notifications,
    selectedShipment,
    openCreateShipmentModal,
    logout,
  } = useApp();

  const currentLanguage = currentUser?.preferredLanguage || 'en';
  const localeMap = {
    en: {
      dashboard: 'Dashboard',
      myShipments: 'My Shipments',
      vehicleRates: 'Vehicle Rates',
      payments: 'Payments',
      liveTracking: 'Live Truck Tracking',
      freshnessAi: 'Freshness AI',
      smartMarkets: 'Smart Markets',
      community: 'Community',
      insurance: 'Insurance',
      cropRescue: 'Crop Rescue',
      verification: 'Verification',
      alerts: 'Alerts',
      profile: 'Profile',
      kyc: 'KYC & Verification',
      myTrips: 'My Trips',
      navigation: 'Navigation',
      sensorStatus: 'Sensor Status',
      delivery: 'Delivery',
      incomingShipments: 'Incoming Shipments',
      findProduce: 'Find Produce',
      receiving: 'Receiving',
      disputes: 'Disputes',
      businessOverview: 'Business Overview',
      bulkMarketplace: 'Bulk Marketplace',
      ordersOffers: 'Orders & Offers',
      transportQuotes: 'Transport Quotes',
      companyProfile: 'Company Profile',
      invoicesPayments: 'Invoices & Payments',
      allShipments: 'All Shipments',
      liveFleet: 'Live Fleet',
      riskMonitor: 'Route Advisories',
      markets: 'Markets',
      analytics: 'Analytics',
      users: 'Users',
      businessReview: 'Business Review',
      kycRequests: 'KYC Requests',
      farmers: 'Farmers',
      transporters: 'Transporters',
      drivers: 'Drivers',
      vehicles: 'Vehicles',
      wholesalers: 'Wholesalers',
      retailers: 'Retailers',
      fpos: 'FPOs',
      businesses: 'Businesses',
      documents: 'Documents',
      verificationHistory: 'Verification History',
      expiryReports: 'Expiry Reports',
      settings: 'Settings',
      adminConsole: 'Admin Console',
      networkOperations: 'Network Operations',
    },
    hi: {
      dashboard: 'डैशबोर्ड',
      myShipments: 'मेरे शिपमेंट',
      vehicleRates: 'वाहन दरें',
      payments: 'भुगतान',
      liveTracking: 'लाइव ट्रक ट्रैकिंग',
      freshnessAi: 'फ्रेशनेस एआई',
      smartMarkets: 'स्मार्ट मार्केट',
      community: 'किसान समुदाय',
      insurance: 'बीमा',
      cropRescue: 'फसल बचाव',
      verification: 'सत्यापन',
      alerts: 'अलर्ट',
      profile: 'प्रोफ़ाइल',
      kyc: 'केवाईसी और सत्यापन',
      myTrips: 'मेरे ट्रिप्स',
      navigation: 'नेविगेशन',
      sensorStatus: 'सेंसर स्थिति',
      delivery: 'डिलिवरी',
      incomingShipments: 'आने वाले शिपमेंट',
      findProduce: 'उपज खोजें',
      receiving: 'रिसीविंग',
      disputes: 'विवाद',
      businessOverview: 'व्यवसाय अवलोकन',
      bulkMarketplace: 'बल्क मार्केटप्लेस',
      ordersOffers: 'ऑर्डर और ऑफर',
      transportQuotes: 'ट्रांसपोर्ट कोटेशन',
      companyProfile: 'कंपनी प्रोफ़ाइल',
      invoicesPayments: 'चालान और भुगतान',
      allShipments: 'सभी शिपमेंट',
      liveFleet: 'लाइव फ्लीट',
      riskMonitor: 'मार्ग सलाह',
      markets: 'मार्केट',
      analytics: 'एनालिटिक्स',
      users: 'उपयोगकर्ता',
      businessReview: 'व्यवसाय समीक्षा',
      kycRequests: 'केवाईसी अनुरोध',
      farmers: 'कृषक',
      transporters: 'परिवहनकर्ता',
      drivers: 'ड्राइवर',
      vehicles: 'वाहन',
      wholesalers: 'थोक व्यापारी',
      retailers: 'रिटेलर',
      fpos: 'एफपीओ',
      businesses: 'व्यवसाय',
      documents: 'दस्तावेज़',
      verificationHistory: 'सत्यापन इतिहास',
      expiryReports: 'समाप्ति रिपोर्ट',
      settings: 'सेटिंग्स',
      adminConsole: 'एडमिन कॉन्सोल',
      networkOperations: 'नेटवर्क ऑपरेशन',
    },
    mr: {
      dashboard: 'डॅशबोर्ड',
      myShipments: 'माझे शिपमेंट',
      vehicleRates: 'वाहन दर',
      payments: 'पेमेंट',
      liveTracking: 'लाइव्ह ट्रक ट्रॅकिंग',
      freshnessAi: 'फ्रेशनेस एआय',
      smartMarkets: 'स्मार्ट मार्केट',
      community: 'शेतकरी समुदाय',
      insurance: 'विमा',
      cropRescue: 'पीक बचाव',
      verification: 'पडताळणी',
      alerts: 'अलर्ट',
      profile: 'प्रोफाइल',
      kyc: 'केवायसी आणि पडताळणी',
      myTrips: 'माझे ट्रिप्स',
      navigation: 'नेव्हिगेशन',
      sensorStatus: 'सेन्सर स्थिती',
      delivery: 'डिलिव्हरी',
      incomingShipments: 'येणारे शिपमेंट',
      findProduce: 'उत्पादन शोधा',
      receiving: 'रिसिव्हिंग',
      disputes: 'वाद',
      businessOverview: 'व्यवसाय Überblick',
      bulkMarketplace: 'बल्क मार्केटप्लेस',
      ordersOffers: 'ऑर्डर आणि ऑफर',
      transportQuotes: 'ट्रान्सपोर्ट कोटेशन',
      companyProfile: 'कंपनी प्रोफाइल',
      invoicesPayments: 'चलन आणि पेमेंट',
      allShipments: 'सर्व शिपमेंट',
      liveFleet: 'लाइव्ह फ्लीट',
      riskMonitor: 'मार्ग सल्ला',
      markets: 'मार्केट',
      analytics: 'अॅनालिटिक्स',
      users: 'वापरकर्ते',
      businessReview: 'व्यवसाय समीक्षा',
      kycRequests: 'केवायसी विनंत्या',
      farmers: 'शेतकरी',
      transporters: 'वाहतूकदार',
      drivers: 'ड्रायव्हर',
      vehicles: 'वाहने',
      wholesalers: 'घाऊक व्यापारी',
      retailers: 'रिटेलर',
      fpos: 'एफपीओ',
      businesses: 'व्यवसाय',
      documents: 'दस्तऐवज',
      verificationHistory: 'पडताळणी इतिहास',
      expiryReports: 'कालबाह्यता अहवाल',
      settings: 'सेटिंग्ज',
      adminConsole: 'अॅडमिन कॉन्सोल',
      networkOperations: 'नेटवर्क ऑपरेशन',
    },
  } as const;

  const t = (key: keyof typeof localeMap.en) => (localeMap[currentLanguage] || localeMap.en)[key] || localeMap.en[key];
  const unreadAlerts = notifications.filter((n) => !n.read).length;
  const isRescueActive = selectedShipment.status === 'RESCUE_ACTIVE' || selectedShipment.status === 'AT_RISK';

  // Role-specific navigation menus strictly matching specification
  const getNavItems = () => {
    switch (userRole) {
      case 'FARMER':
        return [
          { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
          { id: 'shipments', label: t('myShipments'), icon: Package, badge: '3' },
          { id: 'transport-quotes', label: t('vehicleRates'), icon: Truck },
          { id: 'payments', label: t('payments'), icon: Receipt },
          { id: 'tracking', label: t('liveTracking'), icon: Navigation, accent: true },
          { id: 'freshness', label: t('freshnessAi'), icon: Sparkles },
          { id: 'markets', label: t('smartMarkets'), icon: Store },
          { id: 'insurance', label: t('insurance'), icon: ShieldCheck },
          { 
            id: 'rescue', 
            label: t('cropRescue'), 
            icon: LifeBuoy, 
            badge: isRescueActive ? '1 ⚠️' : undefined,
            badgeColor: 'bg-red-500 text-white animate-pulse'
          },
          { id: 'verification', label: t('verification'), icon: ShieldCheck },
          { 
            id: 'alerts', 
            label: t('alerts'), 
            icon: Bell, 
            badge: unreadAlerts > 0 ? String(unreadAlerts) : undefined,
            badgeColor: 'bg-emerald-600 text-white'
          },
          { id: 'profile', label: t('profile'), icon: User },
          { id: 'onboarding', label: t('kyc'), icon: ShieldCheck },
        ];

      case 'DRIVER':
        return [
          { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
          { id: 'trips', label: t('myTrips'), icon: Package, badge: '1' },
          { id: 'navigation', label: t('navigation'), icon: Compass, accent: true },
          { 
            id: 'sensors', 
            label: t('sensorStatus'), 
            icon: Activity,
            badge: selectedShipment.sensorHistory.slice(-1)[0]?.temperatureC > 28 ? '33°C ⚠️' : '26°C 🟢',
            badgeColor: selectedShipment.sensorHistory.slice(-1)[0]?.temperatureC > 28 ? 'bg-amber-500 text-slate-950' : 'bg-emerald-100 text-emerald-800'
          },
          { 
            id: 'alerts', 
            label: t('alerts'), 
            icon: Bell, 
            badge: unreadAlerts > 0 ? String(unreadAlerts) : undefined,
            badgeColor: 'bg-blue-600 text-white'
          },
          { id: 'delivery', label: t('delivery'), icon: CheckCircle2 },
          { id: 'payments', label: t('payments'), icon: Receipt },
          { id: 'profile', label: t('profile'), icon: User },
          { id: 'onboarding', label: t('kyc'), icon: ShieldCheck },
        ];

      case 'BUYER':
        return [
          { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
          { id: 'incoming', label: t('incomingShipments'), icon: Package, badge: '1' },
          { id: 'tracking', label: t('liveTracking'), icon: Navigation, accent: true },
          { id: 'find-produce', label: t('findProduce'), icon: Search },
          { id: 'payments', label: t('payments'), icon: Receipt },
          { id: 'verification', label: t('verification'), icon: ShieldCheck },
          { id: 'receiving', label: t('receiving'), icon: CheckCircle2 },
          { id: 'disputes', label: t('disputes'), icon: FileText, badge: '1' },
          { id: 'profile', label: t('profile'), icon: User },
          { id: 'onboarding', label: t('kyc'), icon: ShieldCheck },
        ];

      case 'BUSINESS':
        return [
          { id: 'dashboard', label: t('businessOverview'), icon: LayoutDashboard },
          { id: 'marketplace', label: t('bulkMarketplace'), icon: Store },
          { id: 'orders', label: t('ordersOffers'), icon: ClipboardList },
          { id: 'transport', label: t('transportQuotes'), icon: Truck },
          { id: 'company', label: t('companyProfile'), icon: Building2 },
          { id: 'invoices', label: t('invoicesPayments'), icon: Receipt },
          { id: 'onboarding', label: t('kyc'), icon: ShieldCheck },
        ];

      case 'ADMIN':
      case 'EXECUTIVE':
      default:
        return [
          { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
          { id: 'all-shipments', label: t('allShipments'), icon: Package },
          { id: 'fleet', label: t('liveFleet'), icon: Truck },
          { id: 'risk-monitor', label: t('riskMonitor'), icon: AlertTriangle, badge: '1 ⚠️', badgeColor: 'bg-red-500 text-white' },
          { id: 'markets', label: t('markets'), icon: Store },
          { id: 'disputes', label: t('disputes'), icon: FileText, badge: '1' },
          { id: 'analytics', label: t('analytics'), icon: BarChart3 },
          { id: 'payments', label: t('payments'), icon: Receipt },
          { id: 'users', label: t('users'), icon: Users },
          { id: 'businesses', label: t('businessReview'), icon: Building2 },
          { id: 'kyc-requests', label: t('kycRequests'), icon: ShieldCheck },
          { id: 'kyc-farmers', label: t('farmers'), icon: User },
          { id: 'kyc-transporters', label: t('transporters'), icon: Truck },
          { id: 'kyc-drivers', label: t('drivers'), icon: Navigation },
          { id: 'kyc-vehicles', label: t('vehicles'), icon: Truck },
          { id: 'kyc-wholesalers', label: t('wholesalers'), icon: Store },
          { id: 'kyc-retailers', label: t('retailers'), icon: Building2 },
          { id: 'kyc-fpos', label: t('fpos'), icon: Users },
          { id: 'kyc-businesses', label: t('businesses'), icon: Building2 },
          { id: 'kyc-documents', label: t('documents'), icon: FileText },
          { id: 'kyc-history', label: t('verificationHistory'), icon: Activity },
          { id: 'kyc-reports', label: t('expiryReports'), icon: AlertTriangle },
          { id: 'settings', label: t('settings'), icon: Settings },
          { id: 'profile', label: t('profile'), icon: User },
        ];
    }
  };

  const navItems = getNavItems();

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileSidebarOpen(false);
  };

  const getRoleMeta = () => {
    switch (userRole) {
      case 'FARMER':
        return {
          title: 'Farmer App',
          name: currentUser?.fullName || 'Farmer Account',
          sub: 'Sahyadri Agro Hub',
          badge: 'FARMER',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
      case 'DRIVER':
        return {
          title: 'Driver Navigator',
          name: currentUser?.fullName || 'Driver Account',
          sub: 'MH-15-TC-4402',
          badge: 'DRIVER',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
        };
      case 'BUYER':
        return {
          title: 'Buyer Portal',
          name: currentUser?.fullName || 'Buyer Account',
          sub: 'FreshMart Terminal',
          badge: 'BUYER',
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        };
      case 'BUSINESS':
        return {
          title: 'Business Portal',
          name: currentUser?.fullName || 'Business Account',
          sub: 'Verification required',
          badge: 'BUSINESS',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
        };
      case 'ADMIN':
      default:
        return {
          title: 'Admin Console',
          name: currentUser?.fullName || 'Administrator',
          sub: 'Network Operations',
          badge: 'ADMIN',
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
        };
    }
  };

  const roleMeta = getRoleMeta();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-left-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-emerald-900 border-r border-emerald-800 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding Strip */}
        <div className="p-4 border-b border-emerald-800 flex items-center justify-between">
          <div>
            <img src={agrilogixLogo} alt="AgriLogix" className="h-14 w-56 rounded-sm bg-white object-contain object-left" />
            <p className="mt-1 text-xs font-semibold text-emerald-100">India&apos;s Dedicated Agricultural Freight Corridor</p>
          </div>

          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-label="Close sidebar"
            className="lg:hidden p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Button for Farmer */}
        {userRole === 'FARMER' && (
          <div className="px-3 pt-3 pb-1">
            <button
              onClick={() => {
                openCreateShipmentModal();
                setIsMobileSidebarOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Shipment</span>
            </button>
          </div>
        )}

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="text-[10px] font-bold text-emerald-100/75 uppercase tracking-wider px-3 py-1.5">
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer group ${
                  isActive
                    ? 'bg-emerald-700 text-white border border-emerald-600 shadow-xs'
                    : 'text-slate-100 hover:text-white hover:bg-emerald-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition ${
                      isActive ? 'text-emerald-100' : 'text-emerald-100/70 group-hover:text-white'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      item.badgeColor || (isActive ? 'bg-emerald-100 text-emerald-900' : 'bg-emerald-800 text-emerald-50')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

        </div>

        {/* Bottom User Card & Logout */}
        <div className="p-3 border-t border-emerald-800 bg-emerald-950/70">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-emerald-800 border border-emerald-700">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 border border-emerald-600 flex items-center justify-center text-white font-bold shrink-0">
                {roleMeta.name[0]}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate leading-tight">
                  {roleMeta.name}
                </div>
                <div className="text-[10px] text-emerald-100/80 truncate">
                  {roleMeta.sub}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout / Switch Role"
              className="p-1.5 rounded-lg text-emerald-100/70 hover:text-red-300 hover:bg-emerald-700 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
