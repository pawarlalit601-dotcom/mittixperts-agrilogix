import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Shipment,
  Market,
  BuyerRequest,
  NotificationItem,
  AIInsight,
  UserRole,
  VerificationRecord,
  DisputeRecord,
  CropBatch,
} from '../types';
import {
  INITIAL_SHIPMENTS,
  INITIAL_MARKETS,
  INITIAL_BUYER_REQUESTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AI_INSIGHTS,
  INITIAL_DISPUTES,
} from '../data/mockData';
import { calculateFreshnessIntelligence } from '../services/freshnessEngine';
import { evaluateFreshRoute } from '../services/freshRouteEngine';
import { apiClient, type AuthenticatedUser, type PreferredLanguage } from '../services/apiClient';
import {
  createProduceLot,
  evaluateMarketRecommendations,
  generateProduceLotId,
  getAiEstimateDisclaimer,
  getRerouteAlertText,
  SpoilagePredictionEngine,
  ProcessingDestinationEngine,
} from '../services/kisanSetuBackend';

interface AppContextType {
  // Authentication & Role
  isAuthLoading: boolean;
  isLoggedIn: boolean;
  currentUser: AuthenticatedUser | null;
  loginAsUser: (user: AuthenticatedUser) => void;
  refreshCurrentUser: () => Promise<AuthenticatedUser | null>;
  updateProfile: (profile: {
    fullName?: string;
    email?: string;
    mobileNumber?: string;
    preferredLanguage?: PreferredLanguage;
    password?: string;
  }) => Promise<void>;
  updatePreferredLanguage: (language: PreferredLanguage) => Promise<void>;
  logout: () => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navigateRoleTab: (role: UserRole, tab: string) => void;

  // Layout Controls
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  isDemoModalOpen: boolean;
  setIsDemoModalOpen: (open: boolean) => void;

  // Core Data
  shipments: Shipment[];
  selectedShipment: Shipment;
  selectedShipmentId: string;
  setSelectedShipmentId: (id: string) => void;
  applyProduceScanFreshnessScore: (score: number) => void;
  markets: Market[];
  buyerRequests: BuyerRequest[];
  notifications: NotificationItem[];
  aiInsights: AIInsight[];
  disputes: DisputeRecord[];

  // GPS Simulation & Status
  isGpsSimulating: boolean;
  toggleGpsSimulation: () => void;
  shipmentProgressPct: number;
  isTruckArrivingSoon: boolean;
  isTruckArrived: boolean;

  // Sensor & IoT Controls
  setManualTemperature: (tempC: number) => void;
  setManualTrafficCongestion: (congested: boolean) => void;
  simulateSensorEvent: (eventType: 'temp_increase' | 'humidity_increase' | 'traffic_jam' | 'delay' | 'spoilage_rise') => void;

  // Farmer Actions
  isCreateShipmentModalOpen: boolean;
  openCreateShipmentModal: () => void;
  closeCreateShipmentModal: () => void;
  createNewShipment: (batchData: Partial<CropBatch> & { destination?: string; storageCondition?: string; vehicleType?: string; cargoVolumeM3?: number; deliveryAt?: string }) => Promise<string>;
  activateCropRescue: () => void;
  confirmReroute: (targetMarketId: string) => void;

  // Driver Actions
  isDriverNavigating: boolean;
  setIsDriverNavigating: (navigating: boolean) => void;
  driverAcceptedAiRoute: boolean;
  acceptDriverAiRoute: () => void;

  // Buyer Actions
  buyerScannedQr: boolean;
  setBuyerScannedQr: (scanned: boolean) => void;
  buyerInspectionStatus: 'PENDING' | 'VERIFIED' | 'ACCEPTED' | 'DISPUTED';
  acceptBuyerShipment: (notes?: string) => void;
  reportBuyerQualityIssue: (reason: string, details?: string) => void;
  matchAndOfferToBuyer: (requestId: string) => void;
  acceptShipmentAsBuyer: (shipmentId: string) => void;
  completeDelivery: (shipmentId?: string) => void;

  // Verification & Notifications
  recordVerificationCheckpoint: (record: VerificationRecord) => void;
  raiseDispute: (arg1?: any, claimText?: string, claimantRole?: string) => void;
  markNotificationRead: (id: string) => void;
  resetToInitialState: () => void;

  // Network & Market Overview
  networkOverview: NetworkOverview;
  smartMarkets: SmartMarketItem[];
}

export interface NetworkOverview {
  activeShipments: number;
  highRiskCount: number;
  produceRescuedKg: number;
  valueSavedTodayInr: number;
}

export interface SmartMarketItem {
  id: string;
  name: string;
  location: string;
  distanceKm: number;
  currentPricePerKg: number;
  demandKg: number;
  estimatedTravelTimeMinutes: number;
  freshnessScore: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('FARMER');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    apiClient.currentUser()
      .then((user) => {
        if (!isMounted || !user) return;
        setCurrentUser(user);
        setUserRole(user.role);
        setIsLoggedIn(true);
      })
      .catch(() => undefined)
      .finally(() => {
        if (isMounted) setIsAuthLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Core Data
  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string>('shipment-tg102');
  const [produceScanFreshnessScores, setProduceScanFreshnessScores] = useState<Record<string, number>>({});
  const [markets, setMarkets] = useState<Market[]>(INITIAL_MARKETS);
  const [buyerRequests, setBuyerRequests] = useState<BuyerRequest[]>(INITIAL_BUYER_REQUESTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>(INITIAL_AI_INSIGHTS);
  const [disputes, setDisputes] = useState<DisputeRecord[]>(INITIAL_DISPUTES);

  // Operational Simulation
  const [isGpsSimulating, setIsGpsSimulating] = useState<boolean>(true);
  const [isCreateShipmentModalOpen, setIsCreateShipmentModalOpen] = useState<boolean>(false);
  const [isDriverNavigating, setIsDriverNavigating] = useState<boolean>(false);
  const [driverAcceptedAiRoute, setDriverAcceptedAiRoute] = useState<boolean>(false);
  const [buyerScannedQr, setBuyerScannedQr] = useState<boolean>(false);
  const [buyerInspectionStatus, setBuyerInspectionStatus] = useState<'PENDING' | 'VERIFIED' | 'ACCEPTED' | 'DISPUTED'>('PENDING');

  const displayedShipments = useMemo(
    () => shipments.map((shipment) => {
      const scannedScore = produceScanFreshnessScores[shipment.id];
      return scannedScore === undefined ? shipment : { ...shipment, freshnessScore: scannedScore };
    }),
    [shipments, produceScanFreshnessScores],
  );
  const selectedShipment = useMemo(
    () => displayedShipments.find((s) => s.id === selectedShipmentId) || displayedShipments[0],
    [displayedShipments, selectedShipmentId],
  );

  const applyProduceScanFreshnessScore = useCallback((score: number) => {
    setProduceScanFreshnessScores((prev) => ({
      ...prev,
      [selectedShipmentId]: Math.max(0, Math.min(100, Math.round(score))),
    }));
  }, [selectedShipmentId]);

  // Dynamic progress derived from distance and status
  const shipmentProgressPct = useMemo(() => {
    if (!selectedShipment) return 0;
    if (selectedShipment.status === 'DELIVERED') return 100;
    if (selectedShipment.status === 'ARRIVED') return 98;
    const initialDistance = 165;
    const remaining = selectedShipment.remainingDistanceKm;
    const traveled = Math.max(0, initialDistance - remaining);
    const pct = Math.min(96, Math.max(10, Math.round((traveled / initialDistance) * 100)));
    return pct;
  }, [selectedShipment]);

  const isTruckArrivingSoon = useMemo(() => {
    if (!selectedShipment) return false;
    return selectedShipment.remainingDistanceKm <= 15 && selectedShipment.remainingDistanceKm > 2;
  }, [selectedShipment]);

  const isTruckArrived = useMemo(() => {
    if (!selectedShipment) return false;
    return selectedShipment.remainingDistanceKm <= 2 || selectedShipment.status === 'ARRIVED' || selectedShipment.status === 'DELIVERED';
  }, [selectedShipment]);

  // Auth Handlers
  const loginAsUser = useCallback((user: AuthenticatedUser) => {
    setCurrentUser(user);
    setUserRole(user.role);
    setIsLoggedIn(true);
    setActiveTab('dashboard');
    setIsMobileSidebarOpen(false);
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    const user = await apiClient.currentUser();
    setCurrentUser(user);
    if (user) setUserRole(user.role);
    return user;
  }, []);

  const updateProfile = useCallback(async (profile: {
    fullName?: string;
    email?: string;
    mobileNumber?: string;
    preferredLanguage?: PreferredLanguage;
    password?: string;
  }) => {
    const user = await apiClient.updateProfile(profile);
    setCurrentUser(user);
    if (user) setUserRole(user.role);
  }, []);

  const updatePreferredLanguage = useCallback(async (language: PreferredLanguage) => {
    const user = await apiClient.updatePreferences(language);
    setCurrentUser(user);
  }, []);

  const logout = useCallback(() => {
    void apiClient.logout().catch(() => undefined);
    setCurrentUser(null);
    setIsLoggedIn(false);
    setIsMobileSidebarOpen(false);
  }, []);

  const navigateRoleTab = useCallback((role: UserRole, tab: string) => {
    setUserRole(role);
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  }, []);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [activeTab, userRole]);

  const toggleMobileSidebar = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      return;
    }
    setIsMobileSidebarOpen((prev) => !prev);
  }, []);

  // Telemetry Modifier
  const updateShipmentTelemetry = useCallback((
    shipmentId: string,
    modifier: (current: Shipment) => Partial<Shipment>
  ) => {
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id !== shipmentId) return s;
        const updated = { ...s, ...modifier(s) };

        const currentTemp = updated.sensorHistory.length > 0 
          ? updated.sensorHistory[updated.sensorHistory.length - 1].temperatureC 
          : 24;
        const currentHumidity = updated.sensorHistory.length > 0 
          ? updated.sensorHistory[updated.sensorHistory.length - 1].humidityPct 
          : 80;

        const freshness = calculateFreshnessIntelligence({
          cropType: updated.batch.cropType,
          currentTempC: currentTemp,
          currentHumidityPct: currentHumidity,
          transitDurationHours: 4.5,
          etaHours: updated.estimatedTravelTimeMinutes / 60,
        });

        const evaluatedRoutes = (updated.candidateRoutes || []).map((r) => {
          const evalRes = evaluateFreshRoute(r, freshness.safeSellingWindowHours, updated.batch.cropType);
          return evalRes.route;
        });

        return {
          ...updated,
          freshnessScore: freshness.freshnessScore,
          spoilageRisk: freshness.spoilageRisk,
          safeSellingWindowHours: freshness.safeSellingWindowHours,
          feasibilityStatus: freshness.feasibilityStatus,
          candidateRoutes: evaluatedRoutes,
          lastUpdated: new Date().toISOString(),
        };
      })
    );
  }, []);

  // Live GPS simulation movement ticker
  useEffect(() => {
    if (!isGpsSimulating) return;

    const interval = setInterval(() => {
      setShipments((prev) =>
        prev.map((s) => {
          if (s.status !== 'IN_TRANSIT' && s.status !== 'REROUTED' && s.status !== 'RESCUE_ACTIVE' && s.status !== 'AT_RISK') {
            return s;
          }

          if (s.remainingDistanceKm <= 1) {
            return {
              ...s,
              remainingDistanceKm: 0,
              estimatedTravelTimeMinutes: 0,
              status: 'ARRIVED',
            };
          }

          // Step truck slightly forward
          const decrement = 1.5;
          const nextDist = Math.max(0, s.remainingDistanceKm - decrement);
          const nextEta = Math.max(2, Math.round((nextDist / (s.currentSpeedKmh || 40)) * 60));

          return {
            ...s,
            remainingDistanceKm: nextDist,
            estimatedTravelTimeMinutes: nextEta,
          };
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [isGpsSimulating]);

  // Sensor manual controls
  const setManualTemperature = useCallback((tempC: number) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    updateShipmentTelemetry(selectedShipmentId, (curr) => {
      const lastReading = curr.sensorHistory[curr.sensorHistory.length - 1];
      const newReading = {
        ...lastReading,
        timestamp: nowTime,
        temperatureC: tempC,
        cargoTempC: Math.max(14, tempC - 3),
      };

      return {
        sensorHistory: [...curr.sensorHistory, newReading],
      };
    });
  }, [selectedShipmentId, updateShipmentTelemetry]);

  const setManualTrafficCongestion = useCallback((congested: boolean) => {
    updateShipmentTelemetry(selectedShipmentId, (curr) => ({
      currentSpeedKmh: congested ? 12 : 58,
      estimatedTravelTimeMinutes: congested ? 440 : 180,
      candidateRoutes: curr.candidateRoutes.map((r) =>
        r.id === 'route-original-mumbai'
          ? {
              ...r,
              trafficLevel: congested ? 'CONGESTED' : 'LOW',
              estimatedTravelMinutes: congested ? 440 : 180,
            }
          : r
      ),
    }));
  }, [selectedShipmentId, updateShipmentTelemetry]);

  // Demo sensor mode simulations
  const simulateSensorEvent = useCallback((eventType: 'temp_increase' | 'humidity_increase' | 'traffic_jam' | 'delay' | 'spoilage_rise') => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    updateShipmentTelemetry(selectedShipmentId, (curr) => {
      const last = curr.sensorHistory[curr.sensorHistory.length - 1];
      switch (eventType) {
        case 'temp_increase':
          return {
            status: 'AT_RISK',
            sensorHistory: [
              ...curr.sensorHistory,
              { ...last, timestamp: nowTime, temperatureC: 34, cargoTempC: 31 },
            ],
          };
        case 'humidity_increase':
          return {
            sensorHistory: [
              ...curr.sensorHistory,
              { ...last, timestamp: nowTime, humidityPct: 89 },
            ],
          };
        case 'traffic_jam':
          return {
            currentSpeedKmh: 8,
            estimatedTravelTimeMinutes: curr.estimatedTravelTimeMinutes + 240,
            status: 'AT_RISK',
          };
        case 'delay':
          return {
            estimatedTravelTimeMinutes: curr.estimatedTravelTimeMinutes + 180,
          };
        case 'spoilage_rise':
          return {
            freshnessScore: 58,
            spoilageRisk: 'HIGH',
            status: 'AT_RISK',
            rescueActivated: true,
          };
        default:
          return {};
      }
    });

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        shipmentId: selectedShipmentId,
        timestamp: 'Just now',
        type: 'TEMP_ABNORMALITY',
        title: `Sensor Event Simulated: ${eventType.replace('_', ' ').toUpperCase()}`,
        message: 'Telemetry updated. AI freshness model and route feasibility recalculated in real-time.',
        severity: 'warning',
        read: false,
      },
      ...prev,
    ]);
  }, [selectedShipmentId, updateShipmentTelemetry]);

  // Crop Rescue & Rerouting
  const activateCropRescue = useCallback(() => {
    updateShipmentTelemetry(selectedShipmentId, () => ({
      status: 'RESCUE_ACTIVE',
      rescueActivated: true,
    }));
    setActiveTab('rescue');
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        shipmentId: selectedShipmentId,
        timestamp: 'Just now',
        type: 'SAFE_WINDOW_WARNING',
        title: '🚨 Crop Rescue Mode Activated',
        message: 'Current ETA exceeds estimated safe-selling window. Recommended to divert to Pune Agro Terminal.',
        severity: 'critical',
        read: false,
      },
      ...prev,
    ]);
  }, [selectedShipmentId, updateShipmentTelemetry]);

  const confirmReroute = useCallback((targetMarketId: string) => {
    const targetMarket = markets.find((m) => m.id === targetMarketId) || markets[1];
    updateShipmentTelemetry(selectedShipmentId, (curr) => ({
      status: 'REROUTED',
      rerouteConfirmed: true,
      currentDestinationName: targetMarket.name,
      destinationMarketId: targetMarket.id,
      remainingDistanceKm: targetMarket.distanceKm,
      estimatedTravelTimeMinutes: targetMarket.etaMinutes,
      currentSpeedKmh: 55,
      activeRouteId: 'route-rescue-pune',
      candidateRoutes: curr.candidateRoutes.map((r) => ({
        ...r,
        isRecommended: r.id === 'route-rescue-pune',
      })),
    }));

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        shipmentId: selectedShipmentId,
        timestamp: 'Just now',
        type: 'REROUTE_RECOMMENDED',
        title: `Reroute Confirmed to ${targetMarket.name}`,
        message: `Driver navigator updated with SH-44 clear route. Travel time reduced to ${targetMarket.etaHours}. Spoilage avoided.`,
        severity: 'success',
        read: false,
      },
      ...prev,
    ]);
  }, [selectedShipmentId, markets, updateShipmentTelemetry]);

  // Driver actions
  const acceptDriverAiRoute = useCallback(() => {
    setDriverAcceptedAiRoute(true);
    confirmReroute('market-b');
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        shipmentId: selectedShipmentId,
        timestamp: 'Just now',
        type: 'REROUTE_RECOMMENDED',
        title: 'Driver Accepted AI FreshRoute™',
        message: 'In-cabin turn-by-turn navigation updated to Pune Terminal. ETA 3h 40m.',
        severity: 'success',
        read: false,
      },
      ...prev,
    ]);
  }, [confirmReroute, selectedShipmentId]);

  // Buyer actions
  const matchAndOfferToBuyer = useCallback((requestId: string) => {
    setBuyerRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'MATCHED' as const } : r))
    );
  }, []);

  const acceptShipmentAsBuyer = useCallback((shipmentId: string) => {
    updateShipmentTelemetry(shipmentId, () => ({
      matchedBuyerId: 'buyer-freshmart',
    }));
  }, [updateShipmentTelemetry]);

  const acceptBuyerShipment = useCallback((notes?: string) => {
    setBuyerInspectionStatus('ACCEPTED');
    completeDelivery(selectedShipmentId);
  }, [selectedShipmentId]);

  const reportBuyerQualityIssue = useCallback((reason: string, details?: string) => {
    setBuyerInspectionStatus('DISPUTED');
    const newDispute: DisputeRecord = {
      id: `DISP-${Math.floor(100 + Math.random() * 900)}`,
      shipmentId: selectedShipmentId,
      raisedBy: 'Sunil Rao (FreshMart Buyer Terminal)',
      raisedAt: new Date().toISOString(),
      claimType: 'TRANSIT_TEMPERATURE_ABUSE',
      claimDescription: details || reason || 'Observed softening in bottom crates upon dock opening.',
      buyerObservedQuality: 'Grade B (Standard Retail)',
      investigationStatus: 'PENDING_REVIEW',
      transitViolationDetected: true,
      transitViolationDetails: 'Thermal sensor logged 33°C reading during 1h 45m traffic delay.',
      weatherCrossCheckStatus: 'CONSISTENT',
      impartialSummary: 'Evidence indicates thermal refrigeration lapse during highway gridlock contributed to minor grade shift. Intact seal confirms zero physical tampering.',
      contributingFactors: ['Highway gridlock delay (+2h 10m)', 'Refrigeration unit transient thermal spike'],
    };

    setDisputes((prev) => [newDispute, ...prev]);

    updateShipmentTelemetry(selectedShipmentId, () => ({
      status: 'DISPUTED',
      dispute: newDispute,
    }));

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        shipmentId: selectedShipmentId,
        timestamp: 'Just now',
        type: 'DISPUTE_RAISED',
        title: `Quality Issue Flagged on Batch #${selectedShipment.batch.id}`,
        message: 'Neutral digital chain of evidence generated. Both farmer loading certificate and in-transit IoT records submitted for review.',
        severity: 'warning',
        read: false,
      },
      ...prev,
    ]);
  }, [selectedShipmentId, selectedShipment, updateShipmentTelemetry]);

  const completeDelivery = useCallback((shipmentId?: string) => {
    const targetId = shipmentId || selectedShipmentId;
    updateShipmentTelemetry(targetId, () => ({
      status: 'DELIVERED',
      remainingDistanceKm: 0,
      estimatedTravelTimeMinutes: 0,
      currentSpeedKmh: 0,
      deliveryCompletedTimestamp: new Date().toISOString(),
    }));

    confetti({
      particleCount: 85,
      spread: 70,
      origin: { y: 0.6 },
    });

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        shipmentId: targetId,
        timestamp: 'Just now',
        type: 'DELIVERY_COMPLETED',
        title: `Delivery Completed Successfully!`,
        message: `Batch #${selectedShipment.batch.id} safely received and verified. ₹8,500 wastage avoided.`,
        severity: 'success',
        read: false,
      },
      ...prev,
    ]);
  }, [selectedShipmentId, selectedShipment, updateShipmentTelemetry]);

  // Farmer verification & shipment creation
  const recordVerificationCheckpoint = useCallback((record: VerificationRecord) => {
    updateShipmentTelemetry(record.shipmentId, (curr) => ({
      verificationRecords: [...(curr.verificationRecords || []), record],
    }));
  }, [updateShipmentTelemetry]);

  const raiseDispute = useCallback((arg1?: any, claimText?: string) => {
    reportBuyerQualityIssue(claimText || 'Quality inspection disparity');
  }, [reportBuyerQualityIssue]);

  const openCreateShipmentModal = useCallback(() => setIsCreateShipmentModalOpen(true), []);
  const closeCreateShipmentModal = useCallback(() => setIsCreateShipmentModalOpen(false), []);

  const createNewShipment = useCallback(async (batchData: Partial<CropBatch> & { destination?: string; storageCondition?: string; vehicleType?: string; cargoVolumeM3?: number; deliveryAt?: string }) => {
    const batchId = `TG${Math.floor(100 + Math.random() * 900)}`;
    const cropType = batchData.cropType || 'Tomato';
    const harvestTimestamp = batchData.harvestTimestamp || new Date().toISOString();
    const originName = batchData.farmName || batchData.farmLocation?.address || 'Farm pickup location';
    const destinationName = batchData.destination || 'Pune Market';
    const savedShipment = await apiClient.createShipment({
      crop: cropType,
      variety: batchData.variety || 'Hybrid Fresh',
      quantityKg: batchData.quantityKg || 1000,
      vehicleType: batchData.vehicleType,
      cargoVolumeM3: batchData.cargoVolumeM3,
      harvestAt: harvestTimestamp,
      expectedShelfLifeHours: 36,
      qualityGrade: batchData.quality || 'Grade A (Export/Premium)',
      storageCondition: batchData.storageCondition || 'Refrigerated transport requested',
      origin: originName,
      destination: destinationName,
    });
    const newShipmentId = savedShipment.id;
    let carrierRequestError = '';
    if (batchData.vehicleType && batchData.cargoVolumeM3) {
      try {
        await apiClient.createTransportRequest({
          shipmentId: newShipmentId,
          pickup: originName,
          destination: destinationName,
          quantityKg: batchData.quantityKg || 1000,
          preferredVehicleType: batchData.vehicleType,
          cargoVolumeM3: batchData.cargoVolumeM3,
          refrigerated: (batchData.storageCondition || '').toLowerCase().includes('refrigerated'),
          truckCount: 1,
          deliveryAt: batchData.deliveryAt || new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        });
      } catch (error) {
        carrierRequestError = error instanceof Error ? error.message : 'Carrier quotes could not be requested.';
      }
    }
    const produceLot = createProduceLot({
      farmerId: 'farmer-nashik-user',
      crop: cropType,
      variety: batchData.variety || 'Hybrid Fresh',
      quantityKg: batchData.quantityKg || 1000,
      currentLocation: 'Sahyadri Valley Farm Gate, Nashik',
      intendedMarket: 'Pune Agro Logistics Terminal',
      estimatedShelfLifeHours: 36,
      currentEstimatedQuality: 84,
      currentEstimatedSpoilage: 16,
    });

    const spoilagePrediction = new SpoilagePredictionEngine().predict({
      crop: cropType,
      harvestAgeHours: 6,
      qualityCategory: batchData.quality || 'Grade A (Export/Premium)',
      temperatureC: 24,
      humidityPct: 82,
      journeyDurationHours: 4,
      trafficDelayMinutes: 20,
      historicalCropData: [{ temperatureC: 23, humidityPct: 80, spoilageRate: 18 }],
    });

    const recommendedMarkets = evaluateMarketRecommendations({
      crop: cropType,
      harvestAgeHours: 6,
      estimatedShelfLifeHours: 36,
      markets,
      trafficDelayMinutes: 20,
      quantityKg: batchData.quantityKg || 1000,
      spoilageRisk: spoilagePrediction.risk_level,
    });

    const processingMatches = new ProcessingDestinationEngine().findEligibleDestinations(cropType, spoilagePrediction.conditionCategory);
    const bestMarket = recommendedMarkets[0];
    const marketMessage = bestMarket
      ? `AI market recommendation: ${bestMarket.marketName} (${bestMarket.suitability} suitability, ETA ${bestMarket.etaHours}).`
      : 'AI market recommendation prepared for dispatch.';

    const newBatch: CropBatch = {
      id: batchId,
      cropType,
      variety: batchData.variety || 'Hybrid Fresh',
      quantityKg: batchData.quantityKg || 1000,
      quality: batchData.quality || 'Grade A (Export/Premium)',
      harvestTimestamp,
      farmId: 'farm-nashik-user',
      farmName: originName,
      farmLocation: batchData.farmLocation || { lat: 0, lng: 0, address: originName },
      fieldInspectionNotes: 'Harvested under optimal morning humidity; calibrated digital weight certification.',
      samplingBrixScore: 4.8,
      firmnessKgCm2: 4.5,
      qrCodeId: `QR-AGRI-${batchId}-VERIFIED`,
      tamperSealId: `SEAL-${Math.floor(1000 + Math.random() * 9000)}-IN`,
      sealStatus: 'INTACT',
      loadingPhotos: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'],
      digitalWeightVerified: true,
      officialDispatchHash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
    };

    const newShipment: Shipment = {
      id: newShipmentId,
      trackingNumber: savedShipment.trackingNumber,
      batch: newBatch,
      driverName: 'Awaiting driver assignment',
      driverPhone: '',
      vehicleNumber: 'Unassigned',
      requestedVehicleType: batchData.vehicleType,
      cargoVolumeM3: batchData.cargoVolumeM3,
      isRefrigerated: (batchData.storageCondition || '').toLowerCase().includes('refrigerated'),
      originName,
      currentDestinationName: destinationName,
      destinationMarketId: markets.find((market) => market.name.toLowerCase().includes(destinationName.toLowerCase()))?.id || '',
      status: 'CREATED',
      startTime: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      currentLocation: { lat: 0, lng: 0, label: originName },
      currentSpeedKmh: 0,
      remainingDistanceKm: 0,
      estimatedTravelTimeMinutes: 0,
      safeSellingWindowHours: Math.max(8, spoilagePrediction.estimated_quality / 10),
      freshnessScore: Math.max(65, 100 - spoilagePrediction.estimated_spoilage),
      spoilageRisk: spoilagePrediction.risk_level === 'CRITICAL' ? 'CRITICAL' : spoilagePrediction.risk_level === 'HIGH' ? 'HIGH' : 'LOW',
      feasibilityStatus: 'FEASIBLE',
      activeRouteId: '',
      rescueActivated: false,
      rerouteConfirmed: false,
      candidateRoutes: [],
      sensorHistory: [],
      verificationRecords: [],
      produceLotId: produceLot.id,
      aiConditionCategory: spoilagePrediction.conditionCategory,
      aiEstimatedQuality: spoilagePrediction.estimated_quality,
      aiEstimatedSpoilage: spoilagePrediction.estimated_spoilage,
      aiRemainingShelfLifeHours: Number(spoilagePrediction.remaining_shelf_life.replace(/\D+/g, '')),
      marketRecommendations: recommendedMarkets.slice(0, 3),
    };

    setShipments((prev) => [newShipment, ...prev]);
    setSelectedShipmentId(newShipmentId);
    setActiveTab(carrierRequestError ? 'tracking' : 'transport-quotes');
    setIsCreateShipmentModalOpen(false);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        shipmentId: newShipmentId,
        timestamp: 'Just now',
        type: 'SHIPMENT_STARTED',
        title: `Shipment ${savedShipment.trackingNumber} created`,
        message: `${marketMessage} ${processingMatches.length > 0 ? 'A processing destination is available if freshness falls below fresh-market suitability.' : 'No processing destination has been configured for this crop yet.'} ${getAiEstimateDisclaimer()}${carrierRequestError ? ` Carrier rate request failed: ${carrierRequestError}` : ' A carrier rate request was sent to verified transporters.'}`,
        severity: carrierRequestError ? 'warning' : 'success',
        read: false,
      },
      {
        id: `notif-${Date.now() + 1}`,
        shipmentId: newShipmentId,
        timestamp: 'Just now',
        type: 'ALTERNATIVE_MARKET_FOUND',
        title: 'Best market found',
        message: getRerouteAlertText(bestMarket ? bestMarket.marketName : 'Pune Agro Logistics Terminal'),
        severity: 'info',
        read: false,
      },
      ...prev,
    ]);

    return produceLot.id;
  }, [markets]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const toggleGpsSimulation = useCallback(() => {
    setIsGpsSimulating((prev) => !prev);
  }, []);

  const resetToInitialState = useCallback(() => {
    setShipments(INITIAL_SHIPMENTS);
    setProduceScanFreshnessScores({});
    setDriverAcceptedAiRoute(false);
    setBuyerScannedQr(false);
    setBuyerInspectionStatus('PENDING');
    setUserRole('FARMER');
    setActiveTab('dashboard');
  }, []);

  const networkOverview = useMemo<NetworkOverview>(() => {
    const active = shipments.filter((s) => s.status !== 'DELIVERED').length;
    const highRisk = shipments.filter(
      (s) =>
        s.spoilageRisk === 'HIGH' ||
        s.spoilageRisk === 'CRITICAL' ||
        s.status === 'AT_RISK' ||
        s.status === 'RESCUE_ACTIVE'
    ).length;

    const isRescued =
      selectedShipment?.status === 'REROUTED' ||
      selectedShipment?.status === 'DELIVERED' ||
      selectedShipment?.rescueActivated;

    return {
      activeShipments: Math.max(12, active),
      highRiskCount: highRisk > 0 ? highRisk : 2,
      produceRescuedKg: isRescued ? 4400 : 3400,
      valueSavedTodayInr: isRescued ? 187000 : 145000,
    };
  }, [shipments, selectedShipment]);

  const smartMarkets = useMemo<SmartMarketItem[]>(() => {
    return markets.map((m) => ({
      id: m.id,
      name: m.name,
      location: `${m.location.city}, Maharashtra Regional Corridor`,
      distanceKm: m.distanceKm,
      currentPricePerKg: m.indicativePricePerKg,
      demandKg: m.requiredQuantityKg,
      estimatedTravelTimeMinutes: m.etaMinutes,
      freshnessScore: m.freshnessRisk === 'LOW' ? 95 : m.freshnessRisk === 'MEDIUM' ? 78 : 45,
    }));
  }, [markets]);

  const value = useMemo(
    () => ({
      isAuthLoading,
      isLoggedIn,
      currentUser,
      loginAsUser,
      refreshCurrentUser,
      updateProfile,
      updatePreferredLanguage,
      logout,
      userRole,
      setUserRole,
      activeTab,
      setActiveTab,
      navigateRoleTab,
      isMobileSidebarOpen,
      setIsMobileSidebarOpen,
      toggleMobileSidebar,
      isDemoModalOpen,
      setIsDemoModalOpen,
      shipments: displayedShipments,
      selectedShipment,
      selectedShipmentId,
      setSelectedShipmentId,
      applyProduceScanFreshnessScore,
      markets,
      buyerRequests,
      notifications,
      aiInsights,
      disputes,
      isGpsSimulating,
      toggleGpsSimulation,
      shipmentProgressPct,
      isTruckArrivingSoon,
      isTruckArrived,
      setManualTemperature,
      setManualTrafficCongestion,
      simulateSensorEvent,
      isCreateShipmentModalOpen,
      openCreateShipmentModal,
      closeCreateShipmentModal,
      createNewShipment,
      activateCropRescue,
      confirmReroute,
      isDriverNavigating,
      setIsDriverNavigating,
      driverAcceptedAiRoute,
      acceptDriverAiRoute,
      buyerScannedQr,
      setBuyerScannedQr,
      buyerInspectionStatus,
      acceptBuyerShipment,
      reportBuyerQualityIssue,
      matchAndOfferToBuyer,
      acceptShipmentAsBuyer,
      completeDelivery,
      recordVerificationCheckpoint,
      raiseDispute,
      markNotificationRead,
      resetToInitialState,
      networkOverview,
      smartMarkets,
    }),
    [
      isLoggedIn,
      currentUser,
      loginAsUser,
      refreshCurrentUser,
      updateProfile,
      updatePreferredLanguage,
      logout,
      userRole,
      activeTab,
      navigateRoleTab,
      isMobileSidebarOpen,
      isDemoModalOpen,
      shipments,
      displayedShipments,
      selectedShipment,
      selectedShipmentId,
      applyProduceScanFreshnessScore,
      markets,
      buyerRequests,
      notifications,
      aiInsights,
      disputes,
      isGpsSimulating,
      toggleGpsSimulation,
      shipmentProgressPct,
      isTruckArrivingSoon,
      isTruckArrived,
      setManualTemperature,
      setManualTrafficCongestion,
      simulateSensorEvent,
      isCreateShipmentModalOpen,
      openCreateShipmentModal,
      closeCreateShipmentModal,
      createNewShipment,
      activateCropRescue,
      confirmReroute,
      isDriverNavigating,
      driverAcceptedAiRoute,
      acceptDriverAiRoute,
      buyerScannedQr,
      buyerInspectionStatus,
      acceptBuyerShipment,
      reportBuyerQualityIssue,
      matchAndOfferToBuyer,
      acceptShipmentAsBuyer,
      completeDelivery,
      recordVerificationCheckpoint,
      raiseDispute,
      markNotificationRead,
      resetToInitialState,
      networkOverview,
      smartMarkets,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
