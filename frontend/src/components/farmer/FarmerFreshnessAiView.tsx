import React from 'react';
import { Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProduceQualityScanner } from './ProduceQualityScanner';

export const FarmerFreshnessAiView: React.FC = () => {
  const { selectedShipment, applyProduceScanFreshnessScore } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-700" />
          <h1 className="text-xl font-bold text-slate-900">AI Produce Quality &amp; Shelf-Life Scanner</h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Scan harvested produce for freshness, remaining shelf life, and visible quality.
        </p>
      </div>

      <ProduceQualityScanner
        suggestedTransitHours={selectedShipment.estimatedTravelTimeMinutes / 60}
        suggestedTemperatureC={selectedShipment.sensorHistory.length > 0
          ? selectedShipment.sensorHistory[selectedShipment.sensorHistory.length - 1].temperatureC
          : undefined}
        suggestedHumidityPct={selectedShipment.sensorHistory.length > 0
          ? selectedShipment.sensorHistory[selectedShipment.sensorHistory.length - 1].humidityPct
          : undefined}
        onAnalyzed={(result) => applyProduceScanFreshnessScore(result.freshnessScore)}
      />
    </div>
  );
};
