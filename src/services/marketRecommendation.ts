import { Market, RiskLevel, Shipment } from '../types';

export interface MarketRecommendation {
  market: Market;
  arrivalHours: number;
  bufferHours: number;
  isSafe: boolean;
  matchReason: string;
  rank: number;
}

const riskPenalty: Record<RiskLevel, number> = {
  LOW: 0,
  MEDIUM: 12,
  HIGH: 28,
  CRITICAL: 45,
};

export function recommendMarketsForShipment(
  shipment: Shipment,
  markets: Market[],
): MarketRecommendation[] {
  const safeWindow = shipment.safeSellingWindowHours;
  const cropType = shipment.batch.cropType;

  return markets
    .filter((market) => market.acceptedCrops.includes(cropType))
    .map((market) => {
      const arrivalHours = market.etaMinutes / 60;
      const bufferHours = safeWindow - arrivalHours;
      const isSafe = bufferHours >= 1;
      const demandScore = market.demandLevel === 'HIGH' ? 24 : market.demandLevel === 'MEDIUM' ? 12 : 4;
      const priceScore = Math.min(20, market.indicativePricePerKg / 3);
      const rank = (isSafe ? 100 : 0) + bufferHours * 8 + demandScore + priceScore - riskPenalty[market.freshnessRisk];

      let matchReason = isSafe
        ? `${formatHours(bufferHours)} safety buffer after arrival`
        : `Arrives ${formatHours(Math.abs(bufferHours))} after the predicted safe window`;

      if (market.demandLevel === 'HIGH') {
        matchReason += ' with confirmed high buyer demand';
      }

      return { market, arrivalHours, bufferHours, isSafe, matchReason, rank };
    })
    .sort((a, b) => b.rank - a.rank);
}

export function formatHours(hours: number): string {
  const totalMinutes = Math.max(0, Math.round(hours * 60));
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${wholeHours}h ${minutes.toString().padStart(2, '0')}m`;
}