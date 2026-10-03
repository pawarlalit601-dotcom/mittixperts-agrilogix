import React from 'react';
import { 
  Store, 
  MapPin, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Info, 
  Phone, 
  Check, 
  Calendar,
  Building2,
  DollarSign
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Market } from '../../types';

export const SmartMarketsTab: React.FC = () => {
  const { 
    markets, 
    selectedShipment, 
    confirmReroute, 
    matchAndOfferToBuyer,
    buyerRequests,
    setActiveTab 
  } = useApp();

  const isRerouted = selectedShipment.status === 'REROUTED' || selectedShipment.status === 'DELIVERED';

  return (
    <div id="smart-markets-tab" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wide">
                SMART MARKET FINDER
              </span>
              <span className="text-xs text-slate-500 font-mono-data">
                Active Crop: {selectedShipment.batch.cropType} ({selectedShipment.batch.quantityKg} kg)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">
              Regional Agricultural Terminals & Buyer Demand Radar
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Evaluating candidate markets within the current remaining safe-selling window of <strong className="text-slate-800 font-mono-data">{selectedShipment.safeSellingWindowHours.toFixed(1)} hours</strong>.
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs shrink-0">
            <div className="text-slate-500 font-medium">Original Destination:</div>
            <div className="font-bold text-slate-900">{selectedShipment.currentDestinationName}</div>
            <div className="text-red-600 font-mono-data font-semibold">
              ETA: {Math.floor(selectedShipment.estimatedTravelTimeMinutes / 60)}h {selectedShipment.estimatedTravelTimeMinutes % 60}m (Kasara Block)
            </div>
          </div>
        </div>
      </div>

      {/* 31. Important Principle Disclaimer */}
      <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-2xl text-xs text-blue-900 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Agrilogix Evidence & Decision-Support Notice:</strong> The platform does not claim guaranteed buyer acceptance, guaranteed freshness, or guaranteed legal proof. Market assessments are estimated based on real-time intake telemetry, historical intake volumes, and active verified buyer requirements. Final confirmation occurs upon bilateral electronic handshake.
        </div>
      </div>

      {/* 5. Smart Markets Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {markets.slice(0, 3).map((market) => {
          const isSelectedTarget = selectedShipment.destinationMarketId === market.id;
          const isMarketB = market.id === 'market-b';
          const isOriginal = market.id === 'market-a';

          // Risk & Feasibility badge colors
          const riskBadge = 
            market.freshnessRisk === 'LOW' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
            market.freshnessRisk === 'MEDIUM' ? 'bg-amber-100 text-amber-800 border-amber-300' :
            'bg-red-100 text-red-800 border-red-300';

          const feasibilityBadge =
            market.feasibilityStatus === 'Suitable' ? 'bg-emerald-500 text-white' :
            market.feasibilityStatus === 'Possible' ? 'bg-amber-500 text-slate-950 font-bold' :
            'bg-red-500 text-white';

          return (
            <div
              key={market.id}
              className={`rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                isSelectedTarget
                  ? 'bg-emerald-50/50 border-emerald-500 shadow-lg ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[11px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${feasibilityBadge}`}>
                    {market.feasibilityStatus === 'Not suitable' ? 'ALTERNATIVE MARKET' : market.feasibilityStatus.toUpperCase()}
                  </span>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${riskBadge}`}>
                    Freshness Monitor: {market.freshnessRisk} {market.freshnessRisk === 'LOW' ? '🟢' : market.freshnessRisk === 'MEDIUM' ? '🟡' : '🔴'}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {market.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{market.location.city} Region Agricultural Hub</span>
                </p>

                {/* Quantitative Metrics List */}
                <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs font-mono-data">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Distance:</span>
                    <strong className="text-slate-900 font-bold">{market.distanceKm} km</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Estimated Travel Time:</span>
                    <strong className={`font-bold ${isMarketB ? 'text-emerald-700' : isOriginal ? 'text-red-600' : 'text-slate-800'}`}>
                      {market.etaHours}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Demand Level:</span>
                    <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                      market.demandLevel === 'HIGH' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {market.demandLevel} DEMAND
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Required Quantity:</span>
                    <strong className="text-slate-800">{market.requiredQuantityKg} kg</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Crop Required:</span>
                    <strong className="text-slate-800">{market.acceptedCrops.join(', ')}</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Quality Spec:</span>
                    <span className="text-slate-800 text-[11px] font-sans font-medium">{market.qualityRequirement}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Operating Hours:</span>
                    <span className="text-slate-800 font-medium">{market.operatingHours}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/80 pt-1.5">
                    <span className="text-slate-500 font-sans font-bold">Indicative Price:</span>
                    <strong className="text-emerald-700 text-sm font-bold">₹{market.indicativePricePerKg}/kg</strong>
                  </div>
                </div>

                {/* Buyer / Contact Meta */}
                <div className="mt-3 text-[11px] text-slate-500 space-y-1">
                  <div>Buyer/Operator: <strong className="text-slate-700">{market.buyerName || market.contactPerson}</strong></div>
                  <div>Gate Clearance: <span className="text-slate-600">Dock Inspection & Weighbridge Certified</span></div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-100">
                {isMarketB ? (
                  <button
                    id="market-b-select-btn"
                    onClick={() => confirmReroute(market.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black py-3 rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                    <span>{isSelectedTarget ? 'CURRENT ACTIVE DESTINATION' : 'RECOMMEND & REROUTE HERE'}</span>
                  </button>
                ) : isOriginal ? (
                  <button
                    disabled
                    className="w-full bg-red-50 text-red-700 border border-red-200 text-xs font-semibold py-2.5 rounded-xl opacity-80 cursor-not-allowed text-center"
                  >
                    Original Destination (Freshness Attention • HIGH 🔴)
                  </button>
                ) : (
                  <button
                    onClick={() => confirmReroute(market.id)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2.5 rounded-xl transition cursor-pointer text-center"
                  >
                    Select Alternative Market C
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Linked Buyer Marketplace Fast-Action */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            INTEGRATED BUYER MATCHING
          </div>
          <h4 className="text-lg font-bold text-white mt-0.5">
            Looking for pre-negotiated purchase contracts?
          </h4>
          <p className="text-xs text-slate-300 mt-1">
            Review verified procurement requirements from FreshMart, Reliance Agri, and local food processors.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('marketplace')}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold px-5 py-2.5 rounded-xl transition shrink-0 cursor-pointer"
        >
          Open Buyer Marketplace →
        </button>
      </div>
    </div>
  );
};
