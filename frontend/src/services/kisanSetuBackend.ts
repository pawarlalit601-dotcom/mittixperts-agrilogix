import { CropType, ConditionCategory, Market, ProduceLot, ProduceOpportunity, ProcessingDestination, TrustScore } from '../types';

export type AIRecommendationSuitability = 'High' | 'Medium' | 'Low';
export type AIRiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface MarketRecommendationInput {
  crop: string;
  harvestAgeHours: number;
  estimatedShelfLifeHours: number;
  markets: Market[];
  trafficDelayMinutes?: number;
  distanceKm?: number;
  spoilageRisk?: string;
  remainingShelfLifeHours?: number;
  quantityKg?: number;
}

export interface MarketRecommendationResult {
  marketId: string;
  marketName: string;
  suitability: AIRecommendationSuitability;
  etaHours: string;
  spoilageRisk: AIRiskLevel;
  remainingShelfLifeAtArrivalHours: number;
  score: number;
  reason: string;
  estimatedValue?: string;
  estimatedRevenue?: string;
}

export interface SpoilagePredictionInput {
  crop: string;
  harvestAgeHours: number;
  qualityCategory?: string;
  temperatureC?: number;
  humidityPct?: number;
  journeyDurationHours?: number;
  trafficDelayMinutes?: number;
  historicalCropData?: {
    temperatureC?: number;
    humidityPct?: number;
    spoilageRate?: number;
  }[];
}

export interface SpoilagePredictionOutput {
  estimated_quality: number;
  estimated_spoilage: number;
  remaining_shelf_life: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  conditionCategory: ConditionCategory;
}

export const normalizeCropName = (crop: string): CropType => {
  const normalized = crop.trim().toLowerCase();
  if (normalized.includes('tomato')) return 'Tomato';
  if (normalized.includes('potato')) return 'Potato';
  if (normalized.includes('grape')) return 'Grapes';
  if (normalized.includes('pepper') || normalized.includes('capsicum') || normalized.includes('bell')) return 'Bell Pepper';
  if (normalized.includes('onion')) return 'Onion';
  if (normalized.includes('strawberry')) return 'Strawberries';
  return 'Tomato';
};

export const generateProduceLotId = (year: number = new Date().getFullYear()): string => {
  const seq = Math.floor(10000 + Math.random() * 90000);
  return `KS-LOT-${year}-${String(seq).padStart(5, '0')}`;
};

export const createProduceLot = (input: {
  farmerId: string;
  crop: string;
  variety: string;
  quantityKg: number;
  harvestDateTime?: string;
  currentLocation: string;
  intendedMarket: string;
  estimatedShelfLifeHours?: number;
  currentEstimatedQuality?: number;
  currentEstimatedSpoilage?: number;
}): ProduceLot => {
  const dateTime = input.harvestDateTime || new Date().toISOString();
  const shelfLife = input.estimatedShelfLifeHours ?? 24;
  const currentQuality = input.currentEstimatedQuality ?? 82;
  const spoilage = input.currentEstimatedSpoilage ?? 18;

  return {
    id: generateProduceLotId(),
    farmerId: input.farmerId,
    crop: normalizeCropName(input.crop),
    variety: input.variety,
    quantityKg: input.quantityKg,
    harvestDateTime: dateTime,
    currentLocation: input.currentLocation,
    intendedMarket: input.intendedMarket,
    estimatedShelfLifeHours: shelfLife,
    currentEstimatedQuality: currentQuality,
    currentEstimatedSpoilage: spoilage,
    status: 'CREATED',
  };
};

export const evaluateMarketRecommendations = ({
  crop,
  harvestAgeHours,
  estimatedShelfLifeHours,
  markets,
  trafficDelayMinutes = 0,
  distanceKm,
  spoilageRisk: inputSpoilageRisk = 'LOW',
  remainingShelfLifeHours,
  quantityKg,
}: MarketRecommendationInput): MarketRecommendationResult[] => {
  const normalizedCrop = normalizeCropName(crop);
  const usableShelfLifeHours = Math.max(0, remainingShelfLifeHours ?? estimatedShelfLifeHours - harvestAgeHours);
  const maxPrice = Math.max(1, ...markets.map((market) => market.indicativePricePerKg));

  return markets
    .filter((market) => market.acceptedCrops.includes(normalizedCrop) || market.acceptedCrops.length === 0)
    .map((market) => {
      const arrivalHours = (market.etaMinutes + trafficDelayMinutes) / 60;
      const remainingAtArrival = usableShelfLifeHours - arrivalHours;
      const marginRatio = usableShelfLifeHours > 0 ? Math.max(0, remainingAtArrival / usableShelfLifeHours) : 0;
      const demandScore = market.demandLevel === 'HIGH' ? 15 : market.demandLevel === 'MEDIUM' ? 9 : 3;
      const priceScore = (market.indicativePricePerKg / maxPrice) * 10;
      const routeRiskPenalty = market.freshnessRisk === 'HIGH' ? 25 : market.freshnessRisk === 'MEDIUM' ? 10 : 0;
      const currentRiskPenalty = inputSpoilageRisk === 'CRITICAL' ? 30 : inputSpoilageRisk === 'HIGH' ? 18 : inputSpoilageRisk === 'MEDIUM' ? 8 : 0;
      const score = Math.max(0, Math.min(100, Math.round(
        (remainingAtArrival > 0 ? 40 + marginRatio * 20 : 0) + demandScore + priceScore - routeRiskPenalty - currentRiskPenalty,
      )));

      let suitability: AIRecommendationSuitability = 'Low';
      if (remainingAtArrival >= 4 && market.freshnessRisk === 'LOW' && inputSpoilageRisk !== 'CRITICAL') suitability = 'High';
      else if (remainingAtArrival > 0 && market.freshnessRisk !== 'HIGH' && inputSpoilageRisk !== 'CRITICAL') suitability = 'Medium';

      let spoilageRisk: AIRiskLevel = 'Low';
      if (remainingAtArrival <= 0 || inputSpoilageRisk === 'CRITICAL') spoilageRisk = 'Critical';
      else if (market.freshnessRisk === 'HIGH' || inputSpoilageRisk === 'HIGH' || (distanceKm ?? market.distanceKm) > 90 || remainingAtArrival < 2) spoilageRisk = 'High';
      else if (market.freshnessRisk === 'MEDIUM' || inputSpoilageRisk === 'MEDIUM' || remainingAtArrival < 6) spoilageRisk = 'Medium';

      const remainingLabel = `${Math.max(0, remainingAtArrival).toFixed(1)}h`;
      const reason = remainingAtArrival <= 0
        ? `Estimated ETA ${arrivalHours.toFixed(1)}h exceeds the ${usableShelfLifeHours.toFixed(1)}h remaining shelf-life window.`
        : `${arrivalHours.toFixed(1)}h estimated travel leaves ${remainingLabel} before the reference shelf-life limit; ${market.demandLevel.toLowerCase()} demand at ₹${market.indicativePricePerKg}/kg.`;

      return {
        marketId: market.id,
        marketName: market.name,
        suitability,
        etaHours: `${Math.floor((market.etaMinutes + trafficDelayMinutes) / 60)}h ${String((market.etaMinutes + trafficDelayMinutes) % 60).padStart(2, '0')}m`,
        spoilageRisk,
        remainingShelfLifeAtArrivalHours: Number(Math.max(0, remainingAtArrival).toFixed(1)),
        score,
        reason,
        estimatedValue: `₹${market.indicativePricePerKg}/kg estimate`,
        estimatedRevenue: quantityKg === undefined ? undefined : `₹${Math.round(quantityKg * market.indicativePricePerKg).toLocaleString('en-IN')} gross estimate`,
      };
    })
    .sort((a, b) => b.score - a.score);
};

export class SpoilagePredictionEngine {
  predict(input: SpoilagePredictionInput): SpoilagePredictionOutput {
    const crop = normalizeCropName(input.crop);
    const history = input.historicalCropData || [];
    const temperature = input.temperatureC ?? 27;
    const humidity = input.humidityPct ?? 80;
    const journeyDurationHours = input.journeyDurationHours ?? 6;
    const delayFactor = (input.trafficDelayMinutes ?? 0) / 60;
    const harvestAgeFactor = Math.min(1, input.harvestAgeHours / 40);

    const averageHistoricalTemp = history.length
      ? history.reduce((sum, item) => sum + (item.temperatureC ?? temperature), 0) / history.length
      : temperature;

    const thermalStress = Math.max(0, averageHistoricalTemp - 18) * 1.4;
    const humidityStress = Math.max(0, Math.abs(humidity - 80) / 20);
    const baseLoss = 18 + harvestAgeFactor * 32 + thermalStress + humidityStress * 12 + delayFactor * 18;
    const estimatedSpoilage = Math.min(92, Math.max(5, Number(baseLoss.toFixed(0))));
    const estimatedQuality = Math.max(6, 100 - estimatedSpoilage);
    const remainingShelfHours = Math.max(1, 24 - (journeyDurationHours + delayFactor * 6) - input.harvestAgeHours * 0.25);

    let risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (estimatedSpoilage >= 60 || temperature > 30 || remainingShelfHours < 4) risk_level = 'CRITICAL';
    else if (estimatedSpoilage >= 40 || temperature > 25 || remainingShelfHours < 8) risk_level = 'HIGH';
    else if (estimatedSpoilage >= 25 || temperature > 22 || remainingShelfHours < 12) risk_level = 'MEDIUM';

    let conditionCategory: ConditionCategory = 'FRESH';
    if (estimatedSpoilage >= 55 || risk_level === 'CRITICAL') conditionCategory = 'UNSUITABLE';
    else if (estimatedSpoilage >= 40 || risk_level === 'HIGH') conditionCategory = 'PROCESSING-SUITABLE';
    else if (estimatedSpoilage >= 25) conditionCategory = 'REDUCED-GRADE';

    return {
      estimated_quality: Number(estimatedQuality.toFixed(0)),
      estimated_spoilage: Number(estimatedSpoilage.toFixed(0)),
      remaining_shelf_life: `${Math.max(1, Math.round(remainingShelfHours))} hours`,
      risk_level,
      conditionCategory,
    };
  }
}

export class ProcessingDestinationEngine {
  private static readonly processingDatabase: ProcessingDestination[] = [
    {
      id: 'proc-grapes-1',
      crop: 'Grapes',
      processingType: 'wine / juice processing',
      eligibleCondition: 'PROCESSING-SUITABLE',
      facility: 'Sahyadri Juice Works',
      location: 'Nashik Industrial Estate',
      distanceKm: 42,
      operatingStatus: 'OPEN',
      capacityKg: 3000,
      acceptedQuantityKg: 1200,
      acceptanceRequirements: 'Must pass visual screening and temperature intake logs. Final acceptance depends on facility validation.',
    },
    {
      id: 'proc-tomato-1',
      crop: 'Tomato',
      processingType: 'puree / paste / processing',
      eligibleCondition: 'PROCESSING-SUITABLE',
      facility: 'AgriPure Processing Unit',
      location: 'Navi Mumbai Food Cluster',
      distanceKm: 72,
      operatingStatus: 'OPEN',
      capacityKg: 5000,
      acceptedQuantityKg: 2000,
      acceptanceRequirements: 'Tomato must be free from visible mould and within receipt quality thresholds. Final facility acceptance required.',
    },
    {
      id: 'proc-mango-1',
      crop: 'Mango',
      processingType: 'pulp / processing',
      eligibleCondition: 'PROCESSING-SUITABLE',
      facility: 'Konkan Mango Pulp Co-op',
      location: 'Ratnagiri Processing Park',
      distanceKm: 140,
      operatingStatus: 'OPEN',
      capacityKg: 2500,
      acceptedQuantityKg: 800,
      acceptanceRequirements: 'Mango lot must meet brix and defect thresholds; final acceptance subject to facility inspection.',
    },
    {
      id: 'proc-banana-1',
      crop: 'Banana',
      processingType: 'food / value-added processing',
      eligibleCondition: 'PROCESSING-SUITABLE',
      facility: 'Banana Value Add Unit',
      location: 'Bhiwandi Agro Park',
      distanceKm: 64,
      operatingStatus: 'OPEN',
      capacityKg: 4000,
      acceptedQuantityKg: 1500,
      acceptanceRequirements: 'Fruit must be sorted for processing grade and delivered within intake window.',
    },
  ];

  findEligibleDestinations(crop: string, condition: ConditionCategory): ProcessingDestination[] {
    const normalizedCrop = normalizeCropName(crop);
    return ProcessingDestinationEngine.processingDatabase.filter((destination) => {
      const matchesCrop = destination.crop === normalizedCrop || destination.crop === crop;
      const matchesCondition = destination.eligibleCondition === condition || condition === 'PROCESSING-SUITABLE';
      return matchesCrop && matchesCondition && destination.operatingStatus === 'OPEN';
    });
  }
}

export const createProduceOpportunity = (input: {
  lotId: string;
  crop: string;
  quantityKg: number;
  condition: ConditionCategory;
  estimatedRemainingShelfLifeHours: number;
  destination: string;
  buyerName?: string;
}): ProduceOpportunity => ({
  id: `OPP-${Math.floor(1000 + Math.random() * 9000)}`,
  lotId: input.lotId,
  crop: normalizeCropName(input.crop),
  quantityKg: input.quantityKg,
  condition: input.condition,
  estimatedRemainingShelfLifeHours: input.estimatedRemainingShelfLifeHours,
  destination: input.destination,
  buyerName: input.buyerName,
  createdAt: new Date().toISOString(),
});

export const calculateTrustScore = (input: {
  completedTransactions: number;
  successfulTransactions: number;
  cancellations: number;
  disputes: number;
  ratings: number;
}): TrustScore => {
  const baseScore = input.completedTransactions * 10 + input.successfulTransactions * 12 - input.cancellations * 8 - input.disputes * 15 + input.ratings * 5;
  const clamped = Math.max(0, Math.min(100, baseScore));

  return {
    userId: 'system-user',
    completedTransactions: input.completedTransactions,
    successfulTransactions: input.successfulTransactions,
    cancellations: input.cancellations,
    disputes: input.disputes,
    ratings: input.ratings,
    score: Number(clamped.toFixed(0)),
  };
};

export const getRerouteAlertText = (destination: string): string => {
  return `Schedule updates may shorten the freshness window. A suitable alternative destination is available: ${destination}.`;
};

export const getAiEstimateDisclaimer = (): string => {
  return 'AI-generated estimate. Final acceptance is subject to buyer requirements and actual condition on arrival.';
};
