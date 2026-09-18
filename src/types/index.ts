export type CropType = 'Tomato' | 'Potato' | 'Strawberries' | 'Bell Pepper' | 'Onion' | 'Grapes';

export type QualityGrade = 'Grade A (Export/Premium)' | 'Grade B (Standard Retail)' | 'Grade C (Processing Only)';

export type SealStatus = 'INTACT' | 'TAMPERED' | 'PENDING_INSPECTION';

export type ShipmentStatus = 
  | 'CREATED' 
  | 'DISPATCHED' 
  | 'IN_TRANSIT' 
  | 'AT_RISK' 
  | 'RESCUE_ACTIVE' 
  | 'REROUTED' 
  | 'ARRIVED' 
  | 'DELIVERED' 
  | 'DISPUTED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type FeasibilityStatus = 'FEASIBLE' | 'RISKY' | 'RESCUE_REQUIRED';

export type UserRole = 'FARMER' | 'DRIVER' | 'BUYER' | 'ADMIN' | 'EXECUTIVE' | 'AUDITOR';

export interface DemoStageInfo {
  stage: number;
  title: string;
  subtitle: string;
  role: UserRole;
  targetTab: string;
  description: string;
}

export interface ShipmentTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  location: string;
  recordedBy: string;
  description: string;
  sensorSnapshot?: SensorReading;
}

export interface CropBatch {
  id: string; // e.g. "TG102"
  cropType: CropType;
  variety: string;
  quantityKg: number;
  quality: QualityGrade;
  harvestTimestamp: string; // ISO string
  farmId: string;
  farmName: string;
  farmLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  fieldInspectionNotes: string;
  samplingBrixScore?: number;
  firmnessKgCm2?: number;
  qrCodeId: string;
  tamperSealId: string;
  sealStatus: SealStatus;
  loadingPhotos: string[];
  digitalWeightVerified: boolean;
  officialDispatchHash: string;
}

export interface SensorReading {
  timestamp: string;
  temperatureC: number;
  humidityPct: number;
  cargoTempC: number;
  lat: number;
  lng: number;
  speedKmh: number;
  sealStatus: SealStatus;
  shockG?: number;
  batteryPct: number;
  routeDeviationMeters: number;
  ambientWeatherTempC?: number;
}

export interface RouteCandidate {
  id: string;
  name: string;
  destinationName: string;
  destinationType: 'ORIGINAL_MARKET' | 'ALTERNATIVE_MARKET' | 'PROCESSING_PLANT';
  distanceKm: number;
  estimatedTravelMinutes: number;
  trafficLevel: 'LOW' | 'MODERATE' | 'HEAVY' | 'CONGESTED';
  roadQuality: 'EXCELLENT' | 'GOOD' | 'ROUGH_POTHOLES';
  environmentalExposureIndex: number; // 0 - 100
  estimatedSpoilageRisk: RiskLevel;
  deliveryWindowCompatibilityPct: number; // 0 - 100%
  compositeRouteScore: number; // Lower or higher normalized
  isRecommended: boolean;
  routePath: [number, number][]; // lat, lng points
  notes: string;
  pricePerKg?: number;
  buyerDemandLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface Market {
  id: string;
  name: string;
  code: string;
  location: {
    lat: number;
    lng: number;
    city: string;
  };
  distanceKm: number;
  etaHours: string;
  etaMinutes: number;
  demandLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  acceptedCrops: CropType[];
  requiredQuantityKg: number;
  qualityRequirement: QualityGrade;
  operatingHours: string;
  indicativePricePerKg: number;
  freshnessRisk: RiskLevel;
  feasibilityStatus: 'Suitable' | 'Possible' | 'Not suitable';
  routeStatus: 'FEASIBLE' | 'RISKY' | 'CRITICAL';
  isAlternativeCandidate: boolean;
  contactPerson: string;
  buyerId?: string;
  buyerName?: string;
}

export interface BuyerRequest {
  id: string;
  buyerId: string;
  buyerName: string;
  company: string;
  location: string;
  cropRequired: CropType;
  quantityMinKg: number;
  quantityMaxKg: number;
  qualityRequired: QualityGrade;
  deadlineTime: string;
  offeredPricePerKg: number;
  status: 'OPEN' | 'MATCHED' | 'ACCEPTED' | 'REJECTED';
}

export interface VerificationRecord {
  id: string;
  shipmentId: string;
  checkpoint: 'FARM' | 'TRANSPORT' | 'BUYER';
  timestamp: string;
  inspectorName: string;
  inspectorRole: string;
  locationName: string;
  gpsCoords: { lat: number; lng: number };
  quantityKg: number;
  qualityObserved: QualityGrade;
  sealId: string;
  sealStatus: SealStatus;
  photos: string[];
  notes: string;
  cryptographicSignature: string;
  independentAuditFlag?: boolean;
}

export interface DisputeRecord {
  id: string;
  shipmentId: string;
  raisedBy: string;
  raisedAt: string;
  status?: string;
  claimReason?: string;
  auditOutcome?: string;
  claimType: 'PRE_EXISTING_SPOILAGE' | 'TRANSIT_TEMPERATURE_ABUSE' | 'SEAL_COMPROMISE' | 'QUANTITY_SHORTAGE' | string;
  claimDescription: string;
  buyerObservedQuality: string;
  investigationStatus: 'PENDING_REVIEW' | 'EVIDENCE_ANALYSED' | 'RESOLVED_NEUTRAL' | string;
  transitViolationDetected: boolean;
  transitViolationDetails: string;
  weatherCrossCheckStatus: 'CONSISTENT' | 'CONFLICT_DETECTED' | string;
  impartialSummary: string;
  contributingFactors: string[];
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  batch: CropBatch;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  isRefrigerated: boolean;
  originName: string;
  currentDestinationName: string;
  destinationMarketId: string;
  status: ShipmentStatus;
  startTime: string;
  lastUpdated: string;
  currentLocation: {
    lat: number;
    lng: number;
    label: string;
  };
  currentSpeedKmh: number;
  remainingDistanceKm: number;
  estimatedTravelTimeMinutes: number;
  safeSellingWindowHours: number; // Remaining safe-selling window
  freshnessScore: number; // 0 to 100
  spoilageRisk: RiskLevel;
  feasibilityStatus: FeasibilityStatus;
  activeRouteId: string;
  candidateRoutes: RouteCandidate[];
  sensorHistory: SensorReading[];
  timeline?: ShipmentTimelineEvent[];
  verificationRecords: VerificationRecord[];
  dispute?: DisputeRecord;
  rescueActivated: boolean;
  rerouteConfirmed: boolean;
  matchedBuyerId?: string;
  deliveryCompletedTimestamp?: string;
}

export interface NotificationItem {
  id: string;
  shipmentId: string;
  timestamp: string;
  type: 
    | 'SHIPMENT_STARTED'
    | 'TRAFFIC_DETECTED'
    | 'ROUTE_DEVIATION'
    | 'TEMP_ABNORMALITY'
    | 'HUMIDITY_ABNORMALITY'
    | 'SPOILAGE_RISK_INCREASED'
    | 'SAFE_WINDOW_WARNING'
    | 'ALTERNATIVE_MARKET_FOUND'
    | 'REROUTE_RECOMMENDED'
    | 'BUYER_MATCHED'
    | 'BUYER_ACCEPTED'
    | 'DELIVERY_COMPLETED'
    | 'DISPUTE_RAISED';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  read: boolean;
}

export interface AIInsight {
  id: string;
  shipmentId: string;
  timestamp: string;
  category: 'FRESHNESS' | 'ROUTING' | 'MARKET_OPPORTUNITY' | 'VERIFICATION';
  headline: string;
  detail: string;
  recommendation: string;
  confidenceScore: number; // 0.85 - 0.98
  factors: { label: string; impact: string }[];
}
