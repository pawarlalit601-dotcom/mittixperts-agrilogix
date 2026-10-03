export type CropType = 'Tomato' | 'Potato' | 'Strawberries' | 'Bell Pepper' | 'Onion' | 'Grapes';

export type QualityGrade = 'Grade A (Export/Premium)' | 'Grade B (Standard Retail)' | 'Grade C (Processing Only)';

export type SealStatus = 'INTACT' | 'TAMPERED' | 'PENDING_INSPECTION';

export type ShipmentStatus =
  | 'CREATED'
  | 'BUYER_CONFIRMED'
  | 'DISPATCHED'
  | 'TRANSPORT_SELECTED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'AT_RISK'
  | 'REROUTE_REQUESTED'
  | 'FARMER_CONFIRMED'
  | 'DESTINATION_UPDATED'
  | 'REROUTED'
  | 'RESCUE_ACTIVE'
  | 'ARRIVED'
  | 'DELIVERED'
  | 'OTP_CONFIRMED'
  | 'COMPLETED'
  | 'DISPUTED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ConditionCategory = 'FRESH' | 'REDUCED-GRADE' | 'PROCESSING-SUITABLE' | 'UNSUITABLE';

export type FeasibilityStatus = 'FEASIBLE' | 'RISKY' | 'RESCUE_REQUIRED';

export type UserRole = 'FARMER' | 'DRIVER' | 'BUYER' | 'BUSINESS' | 'ADMIN' | 'EXECUTIVE' | 'AUDITOR';

export interface DemoStageInfo {
  stage: number;
  title: string;
  subtitle: string;
  role: UserRole;
  targetTab: string;
  description: string;
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

export interface ProduceLot {
  id: string;
  farmerId: string;
  crop: CropType | string;
  variety: string;
  quantityKg: number;
  harvestDateTime: string;
  currentLocation: string;
  intendedMarket: string;
  estimatedShelfLifeHours: number;
  currentEstimatedQuality: number;
  currentEstimatedSpoilage: number;
  status: 'CREATED' | 'ACTIVE' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED';
}

export interface ProcessingDestination {
  id: string;
  crop: CropType | string;
  processingType: string;
  eligibleCondition: ConditionCategory;
  facility: string;
  location: string;
  distanceKm: number;
  operatingStatus: 'OPEN' | 'CLOSED';
  capacityKg: number;
  acceptedQuantityKg: number;
  acceptanceRequirements: string;
}

export interface ProduceOpportunity {
  id: string;
  lotId: string;
  crop: CropType | string;
  quantityKg: number;
  condition: ConditionCategory;
  estimatedRemainingShelfLifeHours: number;
  destination: string;
  buyerName?: string;
  createdAt: string;
}

export interface RerouteEvent {
  id: string;
  shipmentId: string;
  trigger: string;
  reason: string;
  recommendedDestination: string;
  farmerConfirmed: boolean;
  createdAt: string;
}

export interface TrustScore {
  userId: string;
  completedTransactions: number;
  successfulTransactions: number;
  cancellations: number;
  disputes: number;
  ratings: number;
  score: number;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  batch: CropBatch;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  requestedVehicleType?: string;
  cargoVolumeM3?: number;
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
  verificationRecords: VerificationRecord[];
  dispute?: DisputeRecord;
  rescueActivated: boolean;
  rerouteConfirmed: boolean;
  matchedBuyerId?: string;
  deliveryCompletedTimestamp?: string;
  produceLotId?: string;
  aiConditionCategory?: ConditionCategory;
  aiEstimatedQuality?: number;
  aiEstimatedSpoilage?: number;
  aiRemainingShelfLifeHours?: number;
  marketRecommendations?: Array<{
    marketId: string;
    marketName: string;
    suitability: 'High' | 'Medium' | 'Low';
    etaHours: string;
    spoilageRisk: 'Low' | 'Medium' | 'High' | 'Critical';
    remainingShelfLifeAtArrivalHours?: number;
    score?: number;
    reason?: string;
    estimatedValue?: string;
    estimatedRevenue?: string;
  }>;
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
