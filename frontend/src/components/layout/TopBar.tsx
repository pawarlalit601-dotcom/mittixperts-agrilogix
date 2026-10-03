import React, { useEffect, useState } from 'react';
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
  Repeat,
  Save
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { PreferredLanguage } from '../../services/apiClient';
import agrilogixLogo from '../../assets/agrilogix-logo.svg';

export const TopBar: React.FC = () => {
  const {
    userRole,
    setUserRole,
    activeTab,
    setActiveTab,
    toggleMobileSidebar,
    notifications,
    markNotificationRead,
    currentUser,
    updatePreferredLanguage,
    updateProfile,
    logout,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [preferenceError, setPreferenceError] = useState('');
  const [profileDraft, setProfileDraft] = useState({
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    mobileNumber: currentUser?.mobileNumber || '',
    preferredLanguage: currentUser?.preferredLanguage || 'en',
    password: '',
  });
  const [profileError, setProfileError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfileDraft({
        fullName: currentUser.fullName || '',
        email: currentUser.email || '',
        mobileNumber: currentUser.mobileNumber || '',
        preferredLanguage: currentUser.preferredLanguage || 'en',
        password: '',
      });
    }
  }, [currentUser]);

  const unreadNotifications = notifications.filter((n) => !n.read);
  const currentLanguage = currentUser?.preferredLanguage || 'en';

  const localeMap = {
    en: {
      overview: 'Operations Overview',
      ready: 'System Ready',
      profile: 'Profile',
      account: 'Account',
      notifications: 'Notifications',
      switchRole: 'Switch Role View',
      logOut: 'Log Out to Login Screen',
      accountSettings: 'Account settings',
      personalDetails: 'Personal details',
      name: 'Name',
      email: 'Email',
      mobile: 'Mobile number',
      password: 'New password',
      optional: 'Optional',
      saveChanges: 'Save changes',
      saving: 'Saving...',
      couldNotSave: 'Could not save language preference.',
      couldNotSaveProfile: 'Could not save profile details.',
      language: 'Language',
      farmer: 'Farmer',
      driver: 'Driver',
      buyer: 'Buyer',
      business: 'Business',
      admin: 'Admin',
      dashboard: 'Shipment Dashboard',
      driverOperations: 'Driver Operations',
      buyerOperations: 'Buyer Operations',
      businessOperations: 'Business Operations',
      controlCenter: 'Network Control Center',
      kyc: 'KYC Onboarding & Verification',
      kycRequests: 'KYC Requests',
      farmerVerification: 'Farmer Verification',
      transporterVerification: 'Transporter Verification',
      vehicleVerification: 'Vehicle Verification',
      wholesalerVerification: 'Wholesaler Verification',
      retailerVerification: 'Retailer Verification',
      fpoVerification: 'FPO Verification',
      businessVerification: 'Business Verification',
      kycDocuments: 'KYC Documents',
      verificationHistory: 'Verification History',
      expiryReports: 'Document Expiry Reports',
      businessMarketplace: 'Bulk Business Marketplace',
      businessOffers: 'Business Orders & Offers',
      transportQuotations: 'Bulk Transport Quotations',
      companyVerification: 'Company Verification & Locations',
      invoices: 'Business Invoices & Payments',
      shipmentRecords: 'Shipment Records',
      shipmentTracking: 'Shipment Tracking',
      conditionIntelligence: 'Shipment Condition Intelligence',
      destinationFinder: 'Destination Finder',
      community: 'Farmer Community',
      riskMonitoring: 'Route Advisory',
      dispatchVerification: 'Dispatch & Inspection Verification',
      alerts: 'Operational Alerts & Notifications',
      assignedTrips: 'My Assigned Trips',
      navigation: 'Turn-by-Turn GPS Navigation',
      sensorTelemetry: 'IoT Sensor Telemetry & Simulation',
      deliveryHandover: 'Delivery Completion Handover',
      incomingShipments: 'Incoming Produce Shipments',
      regionalMarketplace: 'Regional Produce Marketplace',
      receiving: 'Dock Receiving & Acceptance',
      disputes: 'Dispute Evidence & Audit Timeline',
      shipmentsDirectory: 'Network Shipments Directory',
      fleetTelemetry: 'Live Fleet Telemetry',
      riskMonitor: 'Freshness & Route Advisories',
      analytics: 'Produce Preservation Analytics',
      stakeholders: 'Authorized Stakeholders Directory',
      settings: 'System & Threshold Settings',
      accountProfile: 'User Account Profile',
      agrilogix: 'AgriLogix Logistics',
    },
    hi: {
      overview: 'ऑपरेशन्स अवलोकन',
      ready: 'सिस्टम तैयार',
      profile: 'प्रोफ़ाइल',
      account: 'अकाउंट',
      notifications: 'सूचनाएँ',
      switchRole: 'रोल बदलें',
      logOut: 'लॉगआउट करके लॉगिन स्क्रीन पर जाएँ',
      accountSettings: 'अकाउंट सेटिंग्स',
      personalDetails: 'व्यक्तिगत विवरण',
      name: 'नाम',
      email: 'ईमेल',
      mobile: 'मोबाइल नंबर',
      password: 'नया पासवर्ड',
      optional: 'वैकल्पिक',
      saveChanges: 'परिवर्तन सेव करें',
      saving: 'सेव हो रहा है...',
      couldNotSave: 'भाषा पसंद सेव नहीं हो सकी।',
      couldNotSaveProfile: 'प्रोफ़ाइल विवरण सेव नहीं हो सका।',
      language: 'भाषा',
      farmer: 'कृषक',
      driver: 'ड्राइवर',
      buyer: 'खरीदार',
      business: 'व्यवसाय',
      admin: 'एडमिन',
      dashboard: 'शिपमेंट डैशबोर्ड',
      driverOperations: 'ड्राइवर परिचालन',
      buyerOperations: 'खरीदार परिचालन',
      businessOperations: 'व्यवसाय परिचालन',
      controlCenter: 'नेटवर्क कंट्रोल सेंटर',
      kyc: 'केवाईसी ऑनबोर्डिंग और सत्यापन',
      kycRequests: 'केवाईसी अनुरोध',
      farmerVerification: 'कृषक सत्यापन',
      transporterVerification: 'परिवहनकर्ता सत्यापन',
      vehicleVerification: 'वाहन सत्यापन',
      wholesalerVerification: 'थोक व्यापारी सत्यापन',
      retailerVerification: 'रिटेलर सत्यापन',
      fpoVerification: 'एफपीओ सत्यापन',
      businessVerification: 'व्यवसाय सत्यापन',
      kycDocuments: 'केवाईसी दस्तावेज़',
      verificationHistory: 'सत्यापन इतिहास',
      expiryReports: 'दस्तावेज़ समाप्ति रिपोर्ट',
      businessMarketplace: 'बल्क बिज़नेस मार्केटप्लेस',
      businessOffers: 'व्यवसाय ऑर्डर और ऑफर',
      transportQuotations: 'बल्क ट्रांसपोर्ट कोटेशन',
      companyVerification: 'कंपनी सत्यापन और स्थान',
      invoices: 'व्यवसाय चालान और भुगतान',
      shipmentRecords: 'शिपमेंट रिकॉर्ड',
      shipmentTracking: 'शिपमेंट ट्रैकिंग',
      conditionIntelligence: 'शिपमेंट स्थिति इंटेलिजेंस',
      destinationFinder: 'गंतव्य ढूँढें',
      community: 'किसान समुदाय',
      riskMonitoring: 'मार्ग सलाह',
      dispatchVerification: 'डिस्पैच और निरीक्षण सत्यापन',
      alerts: 'परिचालन अलर्ट और सूचना',
      assignedTrips: 'मेरे असाइन किए गए ट्रिप्स',
      navigation: 'टर्न-बाय-टर्न जीपीएस नेविगेशन',
      sensorTelemetry: 'आईओटी सेंसर टेलीमेट्री',
      deliveryHandover: 'डिलीवरी पूर्ण हैंडओवर',
      incomingShipments: 'आने वाले फसल शिपमेंट',
      regionalMarketplace: 'क्षेत्रीय फसल मार्केटप्लेस',
      receiving: 'डॉक रिसीविंग और स्वीकार',
      disputes: 'विवाद प्रमाण और ऑडिट टाइमलाइन',
      shipmentsDirectory: 'नेटवर्क शिपमेंट निर्देशिका',
      fleetTelemetry: 'लाइव फ्लीट टेलीमेट्री',
      riskMonitor: 'फ्रेशनेस और मार्ग सलाह',
      analytics: 'उपज संरक्षण एनालिटिक्स',
      stakeholders: 'अधिकृत हितधारक निर्देशिका',
      settings: 'सिस्टम और थ्रेशोल्ड सेटिंग्स',
      accountProfile: 'उपयोगकर्ता खाता प्रोफ़ाइल',
      agrilogix: 'अग्रिलॉजिक्स लॉजिस्टिक्स',
    },
    mr: {
      overview: 'ऑपरेशन्स व्ह्यू',
      ready: 'सिस्टम तयार',
      profile: 'प्रोफाइल',
      account: 'खाते',
      notifications: 'संदेश',
      switchRole: 'रोल बदला',
      logOut: 'लॉगआउट करून लॉगिन स्क्रीनवर जा',
      accountSettings: 'खाते सेटिंग्ज',
      personalDetails: 'वैयक्तिक तपशील',
      name: 'नाव',
      email: 'ईमेल',
      mobile: 'मोबाइल नंबर',
      password: 'नवीन पासवर्ड',
      optional: 'पर्यायी',
      saveChanges: 'बदल जतन करा',
      saving: 'जतन होत आहे...',
      couldNotSave: 'भाषेची पसंती जतन होऊ शकली नाही.',
      couldNotSaveProfile: 'प्रोफाइल तपशील जतन होऊ शकले नाहीत.',
      language: 'भाषा',
      farmer: 'शेतकरी',
      driver: 'ड्रायव्हर',
      buyer: 'खरेदीदार',
      business: 'व्यवसाय',
      admin: 'अॅडमिन',
      dashboard: 'शिपमेंट डॅशबोर्ड',
      driverOperations: 'ड्रायव्हर ऑपरेशन्स',
      buyerOperations: 'खरेदीदार ऑपरेशन्स',
      businessOperations: 'व्यवसाय ऑपरेशन्स',
      controlCenter: 'नेटवर्क कंट्रोल सेंटर',
      kyc: 'केवायसी ऑनबोर्डिंग आणि पडताळणी',
      kycRequests: 'केवायसी विनंत्या',
      farmerVerification: 'शेतकरी पडताळणी',
      transporterVerification: 'वाहतूकदार पडताळणी',
      vehicleVerification: 'वाहन पडताळणी',
      wholesalerVerification: 'घाऊक पडताळणी',
      retailerVerification: 'रिटेलर पडताळणी',
      fpoVerification: 'एफपीओ पडताळणी',
      businessVerification: 'व्यवसाय पडताळणी',
      kycDocuments: 'केवायसी दस्तऐवज',
      verificationHistory: 'पडताळणी इतिहास',
      expiryReports: 'दस्तऐवज कालबाह्यता अहवाल',
      businessMarketplace: 'बल्क बिझनेस मार्केटप्लेस',
      businessOffers: 'व्यवसाय ऑर्डर आणि ऑफर्स',
      transportQuotations: 'बल्क ट्रान्सपोर्ट कोटेशन',
      companyVerification: 'कंपनी पडताळणी आणि स्थाने',
      invoices: 'व्यवसाय चलन आणि पेमेंट',
      shipmentRecords: 'शिपमेंट रेकॉर्ड',
      shipmentTracking: 'शिपमेंट ट्रॅकिंग',
      conditionIntelligence: 'शिपमेंट स्थिती इंटेलिजन्स',
      destinationFinder: 'गंतव्य शोध',
      community: 'शेतकरी समुदाय',
      riskMonitoring: 'मार्ग सल्ला',
      dispatchVerification: 'डिस्पॅच आणि तपासणी पडताळणी',
      alerts: 'ऑपरेशनल अलर्ट आणि सूचना',
      assignedTrips: 'माझे नियुक्त ट्रिप्स',
      navigation: 'टर्न-बाय-टर्न जीपीएस नेव्हिगेशन',
      sensorTelemetry: 'आयओटी सेन्सर टेलीमेट्री',
      deliveryHandover: 'डिलिव्हरी पूर्ण हैंडओवर',
      incomingShipments: 'येणाऱ्या फळांची शिपमेंट',
      regionalMarketplace: 'क्षेत्रीय फसल मार्केटप्लेस',
      receiving: 'डॉक रिसिव्हिंग आणि स्वीकार',
      disputes: 'वाद पुरावे आणि ऑडिट टाइमलाइन',
      shipmentsDirectory: 'नेटवर्क शिपमेंट निर्देशिका',
      fleetTelemetry: 'लाइव्ह फ्लीट टेलीमेट्री',
      riskMonitor: 'फ्रेशनेस आणि मार्ग सल्ला',
      analytics: 'उत्पादन संरक्षण विश्लेषण',
      stakeholders: 'अधिकृत हितधारक निर्देशिका',
      settings: 'सिस्टम आणि थ्रेशोल्ड सेटिंग्ज',
      accountProfile: 'वापरकर्ता खाते प्रोफाइल',
      agrilogix: 'अग्रिलॉजिक्स लॉजिस्टिक्स',
    },
  } as const;

  const text = localeMap[currentLanguage] || localeMap.en;
  const t = (key: keyof typeof localeMap.en) => text[key] || localeMap.en[key];

  // Derive dynamic page title based on role & active tab
  const getPageTitle = () => {
    const titleMap = {
      dashboard: userRole === 'FARMER' ? t('dashboard') : userRole === 'DRIVER' ? t('driverOperations') : userRole === 'BUYER' ? t('buyerOperations') : userRole === 'BUSINESS' ? t('businessOperations') : t('controlCenter'),
      onboarding: t('kyc'),
      kyc: t('kyc'),
      'kyc-requests': t('kycRequests'),
      'kyc-farmers': t('farmerVerification'),
      'kyc-transporters': t('transporterVerification'),
      'kyc-drivers': t('farmerVerification'),
      'kyc-vehicles': t('vehicleVerification'),
      'kyc-wholesalers': t('wholesalerVerification'),
      'kyc-retailers': t('retailerVerification'),
      'kyc-fpos': t('fpoVerification'),
      'kyc-businesses': t('businessVerification'),
      'kyc-documents': t('kycDocuments'),
      'kyc-history': t('verificationHistory'),
      'kyc-reports': t('expiryReports'),
      marketplace: t('businessMarketplace'),
      orders: t('businessOffers'),
      transport: t('transportQuotations'),
      company: t('companyVerification'),
      invoices: t('invoices'),
      payments: t('invoices'),
      'shipments': t('shipmentRecords'),
      'my-shipments': t('shipmentRecords'),
      tracking: t('shipmentTracking'),
      freshness: t('conditionIntelligence'),
      markets: t('destinationFinder'),
      community: t('community'),
      rescue: t('riskMonitoring'),
      verification: t('dispatchVerification'),
      alerts: t('alerts'),
      trips: t('assignedTrips'),
      navigation: t('navigation'),
      sensors: t('sensorTelemetry'),
      delivery: t('deliveryHandover'),
      incoming: t('incomingShipments'),
      'find-produce': t('regionalMarketplace'),
      receiving: t('receiving'),
      disputes: t('disputes'),
      'all-shipments': t('shipmentsDirectory'),
      fleet: t('fleetTelemetry'),
      'risk-monitor': t('riskMonitor'),
      analytics: t('analytics'),
      users: t('stakeholders'),
      businesses: t('businessVerification'),
      settings: t('settings'),
      profile: t('accountProfile'),
    } as const;

    return titleMap[activeTab as keyof typeof titleMap] || t('agrilogix');
  };

  const rolesList: { role: UserRole; label: string; icon: string; color: string }[] = [
    { role: 'FARMER', label: t('farmer'), icon: '👨‍🌾', color: 'text-emerald-700 bg-emerald-50' },
    { role: 'DRIVER', label: t('driver'), icon: '🚚', color: 'text-blue-700 bg-blue-50' },
    { role: 'BUYER', label: t('buyer'), icon: '🏪', color: 'text-amber-700 bg-amber-50' },
    { role: 'BUSINESS', label: t('business'), icon: '🏢', color: 'text-blue-700 bg-blue-50' },
    { role: 'ADMIN', label: t('admin'), icon: '🛠️', color: 'text-purple-700 bg-purple-50' },
  ];

  const availableRoles = import.meta.env.DEV
    ? rolesList
    : rolesList.filter((item) => item.role === userRole);
  const currentRoleItem = rolesList.find((r) => r.role === userRole) || rolesList[0];

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = currentLanguage;
    }
  }, [currentLanguage]);

  return (
    <header className="relative sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/90 h-16 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile Menu Toggle & Page Title */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          onClick={toggleMobileSidebar}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden lg:block">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {getPageTitle()}
          </h1>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500">
            <span>{t('overview')}</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">{t('ready')}</span>
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-2 lg:hidden">
          <img src={agrilogixLogo} alt="AGRILOGIX" className="h-9 w-32 shrink-0 object-contain object-left" />
          <span className="truncate text-xs font-semibold text-slate-600">{currentUser?.fullName?.trim() || t('account')}</span>
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
            aria-label={t('notifications')}
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

        <div className="hidden flex-col items-end lg:flex">
          <label className="sr-only" htmlFor="language-preference">Language preference</label>
          <select
            id="language-preference"
            aria-label="Language preference"
            value={currentUser?.preferredLanguage || 'en'}
            onChange={(event) => {
              setPreferenceError('');
              void updatePreferredLanguage(event.target.value as PreferredLanguage).catch(() => {
                setPreferenceError('Could not save language preference.');
              });
            }}
            className="h-9 max-w-[92px] rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-600"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="mr">मराठी</option>
          </select>
          {preferenceError && <span role="status" className="absolute right-24 top-12 text-[10px] text-red-700">{preferenceError}</span>}
        </div>

        <div className="relative flex items-center gap-2">
          <button
            aria-label="Open account settings"
            onClick={() => {
              setShowProfileMenu((value) => !value);
              setShowRoleMenu(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 lg:px-2.5"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600"><User className="h-3.5 w-3.5" /></span>
            <span className="hidden lg:inline">{currentUser?.fullName || t('profile')}</span>
            <ChevronDown className="hidden h-3.5 w-3.5 opacity-60 lg:block" />
          </button>

          <div className="relative hidden lg:block">
            <button
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowNotifications(false);
                setShowProfileMenu(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold cursor-pointer hover:bg-slate-50 transition ${currentRoleItem.color}`}
            >
              <span>{currentRoleItem.icon}</span>
              <span className="hidden sm:inline">{currentRoleItem.label}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 text-left">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
                  {t('switchRole')}
                </div>

                <div className="space-y-1">
                  {availableRoles.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => {
                        setUserRole(r.role);
                        setActiveTab('dashboard');
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
                    <span>{t('logOut')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {showProfileMenu && (
          <div className="absolute right-2 top-16 z-50 w-[calc(100vw-1rem)] max-w-80 rounded-lg border border-slate-200 bg-white p-4 shadow-xl sm:w-80">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('accountSettings')}</p>
                <p className="text-sm font-bold text-slate-900">{t('personalDetails')}</p>
              </div>
              <button onClick={() => setShowProfileMenu(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">×</button>
            </div>

            <div className="space-y-3">
              <label className="block text-[11px] font-semibold text-slate-600">{t('name')}<input value={profileDraft.fullName} onChange={(event) => setProfileDraft((prev) => ({ ...prev, fullName: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500" /></label>
              <label className="block text-[11px] font-semibold text-slate-600">{t('email')}<input value={profileDraft.email} onChange={(event) => setProfileDraft((prev) => ({ ...prev, email: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500" /></label>
              <label className="block text-[11px] font-semibold text-slate-600">{t('mobile')}<input value={profileDraft.mobileNumber} onChange={(event) => setProfileDraft((prev) => ({ ...prev, mobileNumber: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500" /></label>
              <label className="block text-[11px] font-semibold text-slate-600">{t('language')}<select value={profileDraft.preferredLanguage} onChange={(event) => setProfileDraft((prev) => ({ ...prev, preferredLanguage: event.target.value as PreferredLanguage }))} className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"><option value="en">English</option><option value="hi">हिन्दी</option><option value="mr">मराठी</option></select></label>
              <label className="block text-[11px] font-semibold text-slate-600">{t('password')}<input type="password" value={profileDraft.password} onChange={(event) => setProfileDraft((prev) => ({ ...prev, password: event.target.value }))} placeholder={t('optional')} className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500" /></label>

              {profileError && <p className="text-[11px] text-red-700">{profileError}</p>}

              <button
                type="button"
                onClick={async () => {
                  setProfileError('');
                  setProfileSaving(true);
                  try {
                    await updateProfile({
                      fullName: profileDraft.fullName.trim(),
                      email: profileDraft.email.trim(),
                      mobileNumber: profileDraft.mobileNumber.trim(),
                      preferredLanguage: profileDraft.preferredLanguage,
                      password: profileDraft.password.trim() || undefined,
                    });
                    setShowProfileMenu(false);
                  } catch (error) {
                    setProfileError(error instanceof Error ? error.message : 'Could not save profile details.');
                  } finally {
                    setProfileSaving(false);
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-bold text-white hover:bg-emerald-500"
              >
                <Save className="h-4 w-4" />
                {profileSaving ? t('saving') : t('saveChanges')}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
