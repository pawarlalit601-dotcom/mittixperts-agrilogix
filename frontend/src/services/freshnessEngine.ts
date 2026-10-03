import { CropType, RiskLevel, FeasibilityStatus } from '../types';

export interface FreshnessCalculationResult {
  freshnessScore: number; // 0 to 100
  spoilageRisk: RiskLevel;
  safeSellingWindowHours: number; // e.g. 4.33 hours = 4h 20m
  safeSellingWindowFormatted: string;
  feasibilityStatus: FeasibilityStatus;
  feasibilityMessage: string;
  riskColor: string;
  decayRateFactor: number;
  temperaturePenalty: number;
  humidityFactor: number;
  cumulativeHeatHours: number;
  summaryExplanation: string;
}

// Biological baseline parameters by crop type
export const CROP_BASELINES: Record<
  CropType,
  {
    optimalTempC: number;
    criticalTempThresholdC: number;
    baseShelfLifeHours: number;
    q10DecayMultiplier: number;
    optimalHumidityPct: number;
  }
> = {
  Tomato: {
    optimalTempC: 13,
    criticalTempThresholdC: 26,
    baseShelfLifeHours: 72, // 3 days at standard 18°C
    q10DecayMultiplier: 2.3, // doubles/triples decay for every 10°C rise
    optimalHumidityPct: 85,
  },
  Strawberries: {
    optimalTempC: 2,
    criticalTempThresholdC: 10,
    baseShelfLifeHours: 36,
    q10DecayMultiplier: 3.0,
    optimalHumidityPct: 90,
  },
  'Bell Pepper': {
    optimalTempC: 8,
    criticalTempThresholdC: 22,
    baseShelfLifeHours: 96,
    q10DecayMultiplier: 2.1,
    optimalHumidityPct: 85,
  },
  Potato: {
    optimalTempC: 10,
    criticalTempThresholdC: 28,
    baseShelfLifeHours: 360, // 15 days
    q10DecayMultiplier: 1.4,
    optimalHumidityPct: 80,
  },
  Onion: {
    optimalTempC: 12,
    criticalTempThresholdC: 30,
    baseShelfLifeHours: 480,
    q10DecayMultiplier: 1.3,
    optimalHumidityPct: 70,
  },
  Grapes: {
    optimalTempC: 1,
    criticalTempThresholdC: 15,
    baseShelfLifeHours: 60,
    q10DecayMultiplier: 2.5,
    optimalHumidityPct: 88,
  },
};

export const CROP_PROFILES = {
  Tomato: {
    baseShelfLifeHours: 72,
    optimalTempMinC: 12,
    optimalTempMaxC: 18,
    q10Factor: 2.3,
    humidityOptimalMin: 80,
    humidityOptimalMax: 90,
    criticalWindowHours: 12,
  },
  Strawberries: {
    baseShelfLifeHours: 36,
    optimalTempMinC: 1,
    optimalTempMaxC: 4,
    q10Factor: 3.0,
    humidityOptimalMin: 85,
    humidityOptimalMax: 95,
    criticalWindowHours: 6,
  },
  'Bell Pepper': {
    baseShelfLifeHours: 96,
    optimalTempMinC: 7,
    optimalTempMaxC: 10,
    q10Factor: 2.1,
    humidityOptimalMin: 80,
    humidityOptimalMax: 90,
    criticalWindowHours: 18,
  },
  Potato: {
    baseShelfLifeHours: 360,
    optimalTempMinC: 8,
    optimalTempMaxC: 12,
    q10Factor: 1.4,
    humidityOptimalMin: 75,
    humidityOptimalMax: 85,
    criticalWindowHours: 48,
  },
  Onion: {
    baseShelfLifeHours: 480,
    optimalTempMinC: 10,
    optimalTempMaxC: 15,
    q10Factor: 1.3,
    humidityOptimalMin: 65,
    humidityOptimalMax: 75,
    criticalWindowHours: 72,
  },
  Grapes: {
    baseShelfLifeHours: 60,
    optimalTempMinC: 0,
    optimalTempMaxC: 2,
    q10Factor: 2.5,
    humidityOptimalMin: 85,
    humidityOptimalMax: 92,
    criticalWindowHours: 10,
  },
};

/**
 * Calculates real-time freshness score and safe selling window using
 * crop-specific enzymatic decay models (Arrhenius Q10 approximation).
 */
export function calculateFreshnessIntelligence(params: {
  cropType: CropType;
  currentTempC: number;
  currentHumidityPct: number;
  transitDurationHours: number;
  etaHours: number;
  tempHistory?: { tempC: number; hours: number }[];
}): FreshnessCalculationResult {
  const { cropType, currentTempC, currentHumidityPct, transitDurationHours, etaHours, tempHistory } = params;
  const baseline = CROP_BASELINES[cropType] || CROP_BASELINES.Tomato;

  // Temperature acceleration calculation based on delta from optimal
  const tempDelta = Math.max(0, currentTempC - baseline.optimalTempC);
  // Q10 decay rate: rate = Q10 ^ (delta / 10)
  const tempDecayRate = Math.pow(baseline.q10DecayMultiplier, tempDelta / 10);

  // Cumulative heat index calculation
  let cumulativeHeatHours = 0;
  if (tempHistory && tempHistory.length > 0) {
    for (const entry of tempHistory) {
      if (entry.tempC > baseline.criticalTempThresholdC) {
        cumulativeHeatHours += (entry.tempC - baseline.criticalTempThresholdC) * entry.hours;
      }
    }
  } else {
    // Current estimate
    if (currentTempC > baseline.criticalTempThresholdC) {
      cumulativeHeatHours = (currentTempC - baseline.criticalTempThresholdC) * Math.min(transitDurationHours, 3);
    }
  }

  // Humidity penalty (desiccation vs moisture condensation risk)
  const humidityDelta = Math.abs(currentHumidityPct - baseline.optimalHumidityPct);
  const humidityPenaltyFactor = 1 + (humidityDelta / 100) * 0.4;

  // Total equivalent shelf-life consumed (hours)
  const equivalentHoursConsumed = (transitDurationHours * tempDecayRate * humidityPenaltyFactor) + (cumulativeHeatHours * 1.5);

  // Remaining safe-selling window in hours
  const rawRemainingWindowHours = Math.max(0.5, (baseline.baseShelfLifeHours - equivalentHoursConsumed) / tempDecayRate);
  
  // Normalized freshness score (0 - 100)
  const freshnessRatio = Math.max(0, Math.min(1, rawRemainingWindowHours / (baseline.baseShelfLifeHours * 0.5)));
  const freshnessScore = Math.round(Math.max(12, Math.min(99, freshnessRatio * 100)));

  // Risk Level Determination
  let spoilageRisk: RiskLevel = 'LOW';
  let riskColor = '#10b981'; // green

  if (rawRemainingWindowHours < 4 || currentTempC >= 32 || freshnessScore < 45) {
    spoilageRisk = 'CRITICAL';
    riskColor = '#ef4444'; // red
  } else if (rawRemainingWindowHours < 6 || currentTempC >= 28 || freshnessScore < 65) {
    spoilageRisk = 'HIGH';
    riskColor = '#f97316'; // orange-red
  } else if (rawRemainingWindowHours < 12 || currentTempC >= 25 || freshnessScore < 80) {
    spoilageRisk = 'MEDIUM';
    riskColor = '#f59e0b'; // amber
  }

  // Delivery Window Feasibility Assessment
  // Safety margin: 1.0 hour buffer for market unloading & inspection
  const safetyBuffer = 1.0;
  let feasibilityStatus: FeasibilityStatus = 'FEASIBLE';
  let feasibilityMessage = '🟢 CURRENT ROUTE IS FEASIBLE';

  if (etaHours > rawRemainingWindowHours) {
    feasibilityStatus = 'RESCUE_REQUIRED';
    feasibilityMessage = '🚨 CROP RESCUE MODE: Safe window exceeded by estimated transit time';
  } else if (etaHours + safetyBuffer >= rawRemainingWindowHours) {
    feasibilityStatus = 'RISKY';
    feasibilityMessage = '🟡 FRESHNESS ADVISORY: ETA approaches the safe-selling window limit';
  }

  const hours = Math.floor(rawRemainingWindowHours);
  const minutes = Math.round((rawRemainingWindowHours - hours) * 60);
  const safeSellingWindowFormatted = `${hours}h ${minutes < 10 ? '0' : ''}${minutes}m`;

  let summaryExplanation = `Produce retains estimated ${safeSellingWindowFormatted} of shelf stability. Normal container temperatures observed.`;
  if (currentTempC > baseline.criticalTempThresholdC) {
    summaryExplanation = `Refrigeration thermal surge detected at ${currentTempC}°C. Enzymatic degradation is accelerating at ${tempDecayRate.toFixed(1)}x normal rate, shrinking the safe window to ${safeSellingWindowFormatted}.`;
  }

  return {
    freshnessScore,
    spoilageRisk,
    safeSellingWindowHours: Number(rawRemainingWindowHours.toFixed(2)),
    safeSellingWindowFormatted,
    feasibilityStatus,
    feasibilityMessage,
    riskColor,
    decayRateFactor: Number(tempDecayRate.toFixed(2)),
    temperaturePenalty: Math.round(tempDelta * 1.8),
    humidityFactor: Number(humidityPenaltyFactor.toFixed(2)),
    cumulativeHeatHours: Number(cumulativeHeatHours.toFixed(1)),
    summaryExplanation,
  };
}
