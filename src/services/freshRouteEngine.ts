import { RouteCandidate, RiskLevel } from '../types';

export interface RouteEvaluationResult {
  route: RouteCandidate;
  scoreBreakdown: {
    travelTimePenalty: number;
    trafficPenalty: number;
    environmentalExposurePenalty: number;
    spoilageRiskPenalty: number;
    deliveryWindowPenalty: number;
    roadQualityPenalty: number;
    totalCompositeScore: number;
  };
  recommendationVerdict: 'RECOMMENDED' | 'ACCEPTABLE' | 'REJECTED_HIGH_SPOILAGE_RISK' | 'REJECTED_WINDOW_EXCEEDED';
  aiExplanation: string;
}

/**
 * AI FreshRoute™ Evaluation Engine
 * Evaluates candidate routes by integrating physical logistics constraints with
 * real-time biochemical crop degradation rates and delivery window constraints.
 */
export function evaluateFreshRoute(
  route: RouteCandidate,
  currentSafeSellingWindowHours: number,
  cropType: string
): RouteEvaluationResult {
  const travelTimeHours = route.estimatedTravelMinutes / 60;
  
  // 1. Travel Time Penalty (base 1.2 per hour)
  const travelTimePenalty = travelTimeHours * 12;

  // 2. Traffic Congestion Penalty
  const trafficMultipliers: Record<string, number> = {
    LOW: 0,
    MODERATE: 15,
    HEAVY: 45,
    CONGESTED: 80,
  };
  const trafficPenalty = trafficMultipliers[route.trafficLevel] || 20;

  // 3. Environmental Exposure Index Penalty (heat, sun exposure on highway, ambient humidity)
  const environmentalExposurePenalty = (route.environmentalExposureIndex / 100) * 35;

  // 4. Spoilage Risk Penalty based on risk category
  const spoilageMultipliers: Record<RiskLevel, number> = {
    LOW: 5,
    MEDIUM: 25,
    HIGH: 65,
    CRITICAL: 120,
  };
  const spoilageRiskPenalty = spoilageMultipliers[route.estimatedSpoilageRisk] || 30;

  // 5. Road Quality / Roughness Penalty (vibrational stress causes bruising in tomatoes/fruits)
  const roadMultipliers: Record<string, number> = {
    EXCELLENT: 2,
    GOOD: 10,
    ROUGH_POTHOLES: 38,
  };
  const roadQualityPenalty = roadMultipliers[route.roadQuality] || 10;

  // 6. Delivery Window Compatibility Penalty
  // If travel time exceeds safe selling window, massive penalty
  let deliveryWindowPenalty = 0;
  let isWindowExceeded = false;
  if (travelTimeHours > currentSafeSellingWindowHours) {
    isWindowExceeded = true;
    const overshootHours = travelTimeHours - currentSafeSellingWindowHours;
    deliveryWindowPenalty = 150 + overshootHours * 50; // Critical failure penalty
  } else {
    // Buffer penalty: closer to threshold = higher penalty
    const margin = currentSafeSellingWindowHours - travelTimeHours;
    if (margin < 1.0) {
      deliveryWindowPenalty = (1.0 - margin) * 50;
    }
  }

  // Composite Score (Lower is better)
  const totalCompositeScore = Math.round(
    travelTimePenalty +
    trafficPenalty +
    environmentalExposurePenalty +
    spoilageRiskPenalty +
    roadQualityPenalty +
    deliveryWindowPenalty
  );

  let recommendationVerdict: RouteEvaluationResult['recommendationVerdict'] = 'ACCEPTABLE';
  let aiExplanation = '';

  if (isWindowExceeded) {
    recommendationVerdict = 'REJECTED_WINDOW_EXCEEDED';
    aiExplanation = `Route rejected: Estimated arrival time (${Math.floor(travelTimeHours)}h ${Math.round((travelTimeHours % 1) * 60)}m) exceeds the estimated safe-selling window of ${currentSafeSellingWindowHours.toFixed(1)}h by ${(travelTimeHours - currentSafeSellingWindowHours).toFixed(1)}h. High probability of produce rejection at gate.`;
  } else if (route.estimatedSpoilageRisk === 'CRITICAL' || route.estimatedSpoilageRisk === 'HIGH') {
    recommendationVerdict = 'REJECTED_HIGH_SPOILAGE_RISK';
    aiExplanation = `High risk detected: Traffic congestion and high environmental exposure index (${route.environmentalExposureIndex}/100) will accelerate ${cropType} spoilage before unloading can occur.`;
  } else {
    recommendationVerdict = 'RECOMMENDED';
    aiExplanation = `Optimal fresh-route: Delivers within the ${currentSafeSellingWindowHours.toFixed(1)}h safe-selling window with ${route.trafficLevel.toLowerCase()} traffic risk and minimal transit bruising. Recommended destination market has confirmed buyer demand.`;
  }

  return {
    route: {
      ...route,
      compositeRouteScore: totalCompositeScore,
      isRecommended: recommendationVerdict === 'RECOMMENDED',
    },
    scoreBreakdown: {
      travelTimePenalty: Math.round(travelTimePenalty),
      trafficPenalty,
      environmentalExposurePenalty: Math.round(environmentalExposurePenalty),
      spoilageRiskPenalty,
      deliveryWindowPenalty: Math.round(deliveryWindowPenalty),
      roadQualityPenalty,
      totalCompositeScore,
    },
    recommendationVerdict,
    aiExplanation,
  };
}
