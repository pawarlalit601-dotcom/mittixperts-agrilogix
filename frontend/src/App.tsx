import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { KycOnboardingWizard } from './components/auth/KycOnboardingWizard';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { TopBar } from './components/layout/TopBar';
import { FarmerCreateShipmentModal } from './components/farmer/FarmerCreateShipmentModal';

// Farmer Views
import { FarmerDashboardView } from './components/farmer/FarmerDashboardView';
import { FarmerLiveTrackingView } from './components/farmer/FarmerLiveTrackingView';
import { FarmerFreshnessAiView } from './components/farmer/FarmerFreshnessAiView';
import { FarmerSmartMarketsView } from './components/farmer/FarmerSmartMarketsView';
import { FarmerCropRescueView } from './components/farmer/FarmerCropRescueView';
import { FarmerVerificationView } from './components/farmer/FarmerVerificationView';
import { FarmerShipmentsView } from './components/farmer/FarmerShipmentsView';
import { FarmerAlertsView } from './components/farmer/FarmerAlertsView';
import { FarmerProfileView } from './components/farmer/FarmerProfileView';
import { FarmerInsuranceView } from './components/farmer/FarmerInsuranceView';
import { FarmerTransportQuotesView } from './components/farmer/FarmerTransportQuotesView';
import { PaymentView } from './components/common/PaymentView';

// Driver Views
import { DriverDashboardView } from './components/driver/DriverDashboardView';
import { DriverNavigationView } from './components/driver/DriverNavigationView';
import { DriverSensorStatusView } from './components/driver/DriverSensorStatusView';
import { DriverDeliveryView } from './components/driver/DriverDeliveryView';
import { DriverMyTripsView } from './components/driver/DriverMyTripsView';
import { DriverAlertsView } from './components/driver/DriverAlertsView';
import { DriverProfileView } from './components/driver/DriverProfileView';

// Buyer Views
import { BuyerDashboardView } from './components/buyer/BuyerDashboardView';
import { BuyerLiveTrackingView } from './components/buyer/BuyerLiveTrackingView';
import { BuyerVerificationView } from './components/buyer/BuyerVerificationView';
import { BuyerReceivingView } from './components/buyer/BuyerReceivingView';
import { BuyerDisputesView } from './components/buyer/BuyerDisputesView';
import { BuyerIncomingShipmentsView } from './components/buyer/BuyerIncomingShipmentsView';
import { BuyerFindProduceView } from './components/buyer/BuyerFindProduceView';
import { BuyerAlertsView } from './components/buyer/BuyerAlertsView';
import { BuyerProfileView } from './components/buyer/BuyerProfileView';
import { BusinessDashboardView } from './components/business/BusinessDashboardView';

// Admin Views
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { AdminFleetView } from './components/admin/AdminFleetView';
import { AdminRiskMonitorView } from './components/admin/AdminRiskMonitorView';
import { AdminDisputesView } from './components/admin/AdminDisputesView';
import { AdminAnalyticsView } from './components/admin/AdminAnalyticsView';
import { AdminSettingsView } from './components/admin/AdminSettingsView';
import { AdminBusinessVerificationView } from './components/admin/AdminBusinessVerificationView';
import { AdminKycView } from './components/admin/AdminKycView';
import { MobileBottomNav, MobileRoleHome } from './components/mobile/MobileRoleHome';

const RoleBasedRouter: React.FC = () => {
  const { userRole, activeTab } = useApp();

  if ((activeTab === 'onboarding' || activeTab === 'kyc') && userRole !== 'ADMIN') {
    return <KycOnboardingWizard />;
  }
  if (userRole === 'ADMIN' && activeTab.startsWith('kyc-')) {
    return <AdminKycView />;
  }

  // 1. Farmer Views Router
  if (userRole === 'FARMER') {
    switch (activeTab) {
      case 'dashboard':
        return <><div className="hidden md:block"><FarmerDashboardView /></div><div className="md:hidden"><MobileRoleHome /></div></>;
      case 'shipments':
      case 'my-shipments':
        return <FarmerShipmentsView />;
      case 'transport-quotes':
        return <FarmerTransportQuotesView />;
      case 'tracking':
        return <FarmerLiveTrackingView />;
      case 'freshness':
        return <FarmerFreshnessAiView />;
      case 'markets':
        return <FarmerSmartMarketsView />;
      case 'insurance':
        return <FarmerInsuranceView />;
      case 'rescue':
        return <FarmerCropRescueView />;
      case 'verification':
        return <FarmerVerificationView />;
      case 'payments':
        return <PaymentView />;
      case 'alerts':
        return <FarmerAlertsView />;
      case 'profile':
        return <FarmerProfileView />;
      default:
        return <FarmerDashboardView />;
    }
  }

  // 2. Driver Views Router
  if (userRole === 'DRIVER') {
    switch (activeTab) {
      case 'dashboard':
        return <><div className="hidden md:block"><DriverDashboardView /></div><div className="md:hidden"><MobileRoleHome /></div></>;
      case 'trips':
      case 'my-trips':
        return <DriverMyTripsView />;
      case 'navigation':
        return <DriverNavigationView />;
      case 'sensors':
        return <DriverSensorStatusView />;
      case 'alerts':
        return <DriverAlertsView />;
      case 'delivery':
        return <DriverDeliveryView />;
      case 'payments':
        return <PaymentView />;
      case 'profile':
        return <DriverProfileView />;
      default:
        return <DriverDashboardView />;
    }
  }

  // 3. Buyer Views Router
  if (userRole === 'BUYER') {
    switch (activeTab) {
      case 'dashboard':
        return <><div className="hidden md:block"><BuyerDashboardView /></div><div className="md:hidden"><MobileRoleHome /></div></>;
      case 'incoming':
        return <BuyerIncomingShipmentsView />;
      case 'tracking':
        return <BuyerLiveTrackingView />;
      case 'find-produce':
        return <BuyerFindProduceView />;
      case 'verification':
        return <BuyerVerificationView />;
      case 'payments':
        return <PaymentView />;
      case 'receiving':
        return <BuyerReceivingView />;
      case 'disputes':
        return <BuyerDisputesView />;
      case 'alerts':
        return <BuyerAlertsView />;
      case 'profile':
        return <BuyerProfileView />;
      default:
        return <BuyerDashboardView />;
    }
  }

  if (userRole === 'BUSINESS') {
    return <BusinessDashboardView />;
  }

  // 4. Admin Views Router
  if (userRole === 'ADMIN' || userRole === 'EXECUTIVE') {
    switch (activeTab) {
      case 'dashboard':
        return <><div className="hidden md:block"><AdminDashboardView /></div><div className="md:hidden"><MobileRoleHome /></div></>;
      case 'all-shipments':
      case 'fleet':
        return <AdminFleetView />;
      case 'users':
        return <AdminFleetView />;
      case 'businesses':
        return <AdminBusinessVerificationView />;
      case 'risk-monitor':
      case 'risk':
        return <AdminRiskMonitorView />;
      case 'markets':
        return <FarmerSmartMarketsView />;
      case 'disputes':
        return <AdminDisputesView />;
      case 'analytics':
        return <AdminAnalyticsView />;
      case 'settings':
        return <AdminSettingsView />;
      case 'payments':
        return <PaymentView />;
      case 'profile':
        return <FarmerProfileView />;
      default:
        return <AdminDashboardView />;
    }
  }

  return <FarmerDashboardView />;
};

const MainLayout: React.FC = () => {
  const { isAuthLoading, isLoggedIn, currentUser, userRole, activeTab, setActiveTab } = useApp();

  if (isAuthLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm font-semibold text-slate-600">Restoring your session...</div>;
  }

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* Role-Based Left Sidebar Navigation */}
      <LeftSidebar />

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <TopBar />

        {/* Scrollable Main Content Body */}
        <main className="flex-1 overflow-y-auto px-4 py-4 pb-28 sm:px-6 lg:px-8 lg:py-6 lg:pb-6">
          {currentUser && userRole !== 'ADMIN' && currentUser.kycStatus !== 'VERIFIED' && !['onboarding', 'kyc'].includes(activeTab) && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="status">
              <span>KYC status: <strong>{currentUser.kycStatus.replace(/_/g, ' ')}</strong>. Verified actions stay restricted until approval.</span>
              <button onClick={() => setActiveTab('onboarding')} className="rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-100">View verification</button>
            </div>
          )}
          {/* Role-Specific Dashboard View */}
          <RoleBasedRouter />
        </main>
      </div>

      <MobileBottomNav />

      {/* Farmer Create Shipment Modal */}
      <FarmerCreateShipmentModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
