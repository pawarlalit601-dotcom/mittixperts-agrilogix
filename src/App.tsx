import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginScreen } from './components/auth/LoginScreen';
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

// Driver Views
import { DriverDashboardView } from './components/driver/DriverDashboardView';
import { DriverNavigationView } from './components/driver/DriverNavigationView';
import { DriverFreshRouteView } from './components/driver/DriverFreshRouteView';
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

// Admin Views
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { AdminFleetView } from './components/admin/AdminFleetView';
import { AdminRiskMonitorView } from './components/admin/AdminRiskMonitorView';
import { AdminDisputesView } from './components/admin/AdminDisputesView';
import { AdminAnalyticsView } from './components/admin/AdminAnalyticsView';
import { AdminSettingsView } from './components/admin/AdminSettingsView';

const RoleBasedRouter: React.FC = () => {
  const { userRole, activeTab } = useApp();

  // 1. Farmer Views Router
  if (userRole === 'FARMER') {
    switch (activeTab) {
      case 'dashboard':
        return <FarmerDashboardView />;
      case 'shipments':
      case 'my-shipments':
        return <FarmerShipmentsView />;
      case 'tracking':
        return <FarmerLiveTrackingView />;
      case 'freshness':
        return <FarmerFreshnessAiView />;
      case 'markets':
        return <FarmerSmartMarketsView />;
      case 'rescue':
        return <FarmerCropRescueView />;
      case 'verification':
        return <FarmerVerificationView />;
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
        return <DriverDashboardView />;
      case 'trips':
      case 'my-trips':
        return <DriverMyTripsView />;
      case 'navigation':
        return <DriverNavigationView />;
      case 'freshroute':
        return <DriverFreshRouteView />;
      case 'sensors':
        return <DriverSensorStatusView />;
      case 'alerts':
        return <DriverAlertsView />;
      case 'delivery':
        return <DriverDeliveryView />;
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
        return <BuyerDashboardView />;
      case 'incoming':
        return <BuyerIncomingShipmentsView />;
      case 'tracking':
        return <BuyerLiveTrackingView />;
      case 'find-produce':
        return <BuyerFindProduceView />;
      case 'verification':
        return <BuyerVerificationView />;
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

  // 4. Admin Views Router
  if (userRole === 'ADMIN' || userRole === 'EXECUTIVE') {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboardView />;
      case 'all-shipments':
      case 'fleet':
      case 'users':
        return <AdminFleetView />;
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
      case 'profile':
        return <FarmerProfileView />;
      default:
        return <AdminDashboardView />;
    }
  }

  return <FarmerDashboardView />;
};

const MainLayout: React.FC = () => {
  const { isLoggedIn } = useApp();

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Role-Based Left Sidebar Navigation */}
      <LeftSidebar />

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <TopBar />

        {/* Scrollable Main Content Body */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Role-Specific Dashboard View */}
          <RoleBasedRouter />
        </main>
      </div>

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
