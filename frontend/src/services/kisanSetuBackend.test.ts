import assert from 'node:assert/strict';
import test from 'node:test';
import { Market } from '../types';
import { evaluateMarketRecommendations } from './kisanSetuBackend';

const createMarket = (input: Partial<Market> & Pick<Market, 'id' | 'etaMinutes' | 'distanceKm' | 'indicativePricePerKg'>): Market => ({
  id: input.id,
  name: input.name ?? input.id,
  code: input.code ?? input.id.toUpperCase(),
  location: input.location ?? { lat: 19, lng: 73, city: input.id },
  distanceKm: input.distanceKm,
  etaHours: `${Math.floor(input.etaMinutes / 60)}h`,
  etaMinutes: input.etaMinutes,
  demandLevel: input.demandLevel ?? 'HIGH',
  acceptedCrops: input.acceptedCrops ?? ['Tomato'],
  requiredQuantityKg: input.requiredQuantityKg ?? 1000,
  qualityRequirement: input.qualityRequirement ?? 'Grade A (Export/Premium)',
  operatingHours: input.operatingHours ?? '24 hours',
  indicativePricePerKg: input.indicativePricePerKg,
  freshnessRisk: input.freshnessRisk ?? 'LOW',
  feasibilityStatus: input.feasibilityStatus ?? 'Suitable',
  routeStatus: input.routeStatus ?? 'FEASIBLE',
  isAlternativeCandidate: input.isAlternativeCandidate ?? true,
  contactPerson: input.contactPerson ?? 'Market desk',
});

test('a route beyond remaining shelf life is critical and ranks below a feasible market', () => {
  const recommendations = evaluateMarketRecommendations({
    crop: 'Tomato',
    harvestAgeHours: 0,
    estimatedShelfLifeHours: 48,
    remainingShelfLifeHours: 3,
    markets: [
      createMarket({ id: 'late-premium', etaMinutes: 240, distanceKm: 150, indicativePricePerKg: 100 }),
      createMarket({ id: 'nearby', etaMinutes: 30, distanceKm: 20, indicativePricePerKg: 20 }),
    ],
    quantityKg: 1000,
  });

  assert.equal(recommendations[0].marketId, 'nearby');
  assert.equal(recommendations[0].suitability, 'Medium');
  assert.equal(recommendations[1].spoilageRisk, 'Critical');
  assert.match(recommendations[1].reason, /exceeds/);
});

test('remaining shelf life falls back to reference life minus harvest age', () => {
  const [recommendation] = evaluateMarketRecommendations({
    crop: 'Tomato',
    harvestAgeHours: 20,
    estimatedShelfLifeHours: 24,
    markets: [createMarket({ id: 'late', etaMinutes: 300, distanceKm: 100, indicativePricePerKg: 30 })],
  });

  assert.equal(recommendation.remainingShelfLifeAtArrivalHours, 0);
  assert.equal(recommendation.spoilageRisk, 'Critical');
});