import React, { useState } from 'react';
import {
  Store,
  MapPin,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  Building2,
  Phone,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Market } from '../../types';

interface SmartMarketOption {
  id: string;
  name: string;
  location: string;
  distanceKm: number;
  etaHours: string;
  etaMinutes: number;
  demand: string;
  demandStatus: string;
  requiredQuantity: string;
  cropRequirement: string;
  receivingHours: string;
  freshnessRisk: string;
  riskColor: string;
  isOriginal?: boolean;
  isRecommended?: boolean;
  notes: string;
  contactPerson: string;
  phone: string;
}

export const FarmerSmartMarketsView: React.FC = () => {
  const {
    markets,
    selectedShipment,
    confirmReroute,
    setActiveTab
  } = useApp();

  const [selectedMarketModal, setSelectedMarketModal] = useState<SmartMarketOption | null>(null);
  const [divertConfirmSuccess, setDivertConfirmSuccess] = useState(false);

  // Formatted market list strictly containing prompt requirements
  const smartMarketList: SmartMarketOption[] = [
    {
      id: 'market-a',
      name: 'Market A (Mumbai Central APMC)',
      location: 'Vashi Wholesale Complex, Navi Mumbai',
      distanceKm: 110,
      etaHours: '7h 20m (Congested)',
      etaMinutes: 440,
      demand: 'HIGH (₹48/kg wholesale)',
      demandStatus: 'HIGH',
      requiredQuantity: '1,500 kg',
      cropRequirement: 'Tomato (Vine or Hybrid Grade A)',
      receivingHours: '04:00 AM – 11:30 PM (24/7 Cold Bay)',
      freshnessRisk: 'HIGH RISK 🔴',
      riskColor: 'text-red-600 bg-red-50 border-red-200',
      isOriginal: true,
      notes: 'Heavy Kasara Ghat gridlock on primary NH-160 highway corridor. Not recommended under current thermal load.',
      contactPerson: 'Harish Mehta (Wholesale Desk)',
      phone: '+91 98200 44102',
    },
    {
      id: 'market-b',
      name: 'Market B (Pune Agro Logistics Terminal)',
      location: 'Hadapsar Express Cold Yard, Pune',
      distanceKm: 55,
      etaHours: '3h 50m (Clear SH-44)',
      etaMinutes: 220,
      demand: 'HIGH (₹44/kg wholesale offtake)',
      demandStatus: 'HIGH',
      requiredQuantity: '1,000 kg (Immediate Match)',
      cropRequirement: 'Tomato Hybrid / Fresh Market Grade A/B',
      receivingHours: '06:00 AM – 09:00 PM',
      freshnessRisk: 'LOW RISK 🟢',
      riskColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      isRecommended: true,
      notes: 'Optimal detour! Road conditions clear via SH-44. FreshMart warehouse dock ready with instant weighbridge clearance.',
      contactPerson: 'Sunil Rao (Procurement Lead)',
      phone: '+91 94220 88711',
    },
    {
      id: 'market-c',
      name: 'Market C (Thane Regional Agro Mandi)',
      location: 'Kalyan Bypass Link Terminal, Thane',
      distanceKm: 72,
      etaHours: '4h 40m (Moderate traffic)',
      etaMinutes: 280,
      demand: 'MODERATE (₹40/kg wholesale)',
      demandStatus: 'MODERATE',
      requiredQuantity: '800 kg',
      cropRequirement: 'Tomato (Any Grade)',
      receivingHours: '05:00 AM – 08:00 PM',
      freshnessRisk: 'MEDIUM RISK 🟡',
      riskColor: 'text-amber-700 bg-amber-50 border-amber-200',
      notes: 'Viable secondary backup. Slight delay at Bhiwandi toll plaza.',
      contactPerson: 'Dilip Sawant (APMC Inspector)',
      phone: '+91 97650 33209',
    },
  ];

  const handleSelectDestination = (market: typeof smartMarketList[0]) => {
    confirmReroute(market.id);
    setDivertConfirmSuccess(true);
    setTimeout(() => {
      setDivertConfirmSuccess(false);
      setActiveTab('tracking');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Smart Market Finder™
              </h2>
              <p className="text-xs text-slate-500">
                AI-ranked nearby alternate markets to liquidate produce before decay occurs
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Current Destination:</span>
          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md">
            {selectedShipment.currentDestinationName || 'Mumbai Central APMC'}
          </span>
        </div>
      </div>

      {divertConfirmSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white flex items-center justify-between shadow-lg animate-bounce">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5" />
            <span>Destination Updated! Driver navigation updated to Pune Market via SH-44.</span>
          </div>
        </div>
      )}

      {/* 3 Market Cards: Market A, Market B, Market C */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {smartMarketList.map((market) => {
          const isCurrentActiveDest =
            selectedShipment.currentDestinationName?.toLowerCase().includes('pune') &&
            market.id === 'market-b';

          return (
            <div
              key={market.id}
              className={`bg-white rounded-3xl border-2 p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all duration-200 ${
                market.isRecommended
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-slate-200/90'
              }`}
            >
              <div>
                {/* Header Tag */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {market.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{market.location}</span>
                    </div>
                  </div>

                  {market.isRecommended && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase shrink-0 border border-emerald-200">
                      Recommended ★
                    </span>
                  )}
                </div>

                {/* Mandated Specifications Grid */}
                <div className="space-y-2.5 my-4 text-xs border-y border-slate-100 py-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Distance:</span>
                    <span className="font-bold text-slate-900 font-mono-data">
                      {market.distanceKm} km
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Estimated Travel Time:</span>
                    <span className="font-bold text-slate-900 font-mono-data">
                      {market.etaHours}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Demand:</span>
                    <span className="font-bold text-emerald-700">
                      {market.demand}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Required Quantity:</span>
                    <span className="font-bold text-slate-800">
                      {market.requiredQuantity}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Crop Requirement:</span>
                    <span className="font-medium text-slate-800 truncate max-w-37.5">
                      {market.cropRequirement}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Receiving Hours:</span>
                    <span className="font-medium text-slate-800">
                      {market.receivingHours}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-50">
                    <span className="text-slate-400">Freshness Risk:</span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${market.riskColor}`}>
                      {market.freshnessRisk}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2 mb-4">
                  {market.notes}
                </p>
              </div>

              {/* Action Buttons: VIEW and SELECT DESTINATION */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => setSelectedMarketModal(market as any)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  VIEW
                </button>

                <button
                  onClick={() => handleSelectDestination(market)}
                  disabled={isCurrentActiveDest}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer flex items-center justify-center gap-1 ${
                    isCurrentActiveDest
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : market.isRecommended
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isCurrentActiveDest ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>CURRENT</span>
                    </>
                  ) : (
                    <span>SELECT DESTINATION</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mandatory Disclaimer from Prompt */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Application Disclaimer:</strong>
          <p className="mt-0.5 text-amber-800">
            Buyer confirmation is required before rerouting produce. The platform automatically issues an electronic offtake proposal to the target procurement dock; upon mutual digital acceptance, driver GPS routing updates automatically.
          </p>
        </div>
      </div>

      {/* Detail View Modal */}
      {selectedMarketModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedMarketModal.name}</h3>
                <p className="text-xs text-slate-500">{selectedMarketModal.location}</p>
              </div>
              <button
                onClick={() => setSelectedMarketModal(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 mb-6">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Distance from Truck</span>
                <span className="font-bold text-slate-900">{selectedMarketModal.distanceKm} km</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Travel Duration</span>
                <span className="font-bold text-slate-900">{selectedMarketModal.etaHours}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Offtake Capacity</span>
                <span className="font-bold text-emerald-700">Ready for 1,000 kg</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Dock Supervisor</span>
                <span className="font-bold text-slate-900">{selectedMarketModal.contactPerson}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Direct Terminal Phone</span>
                <span className="font-mono text-slate-900">{selectedMarketModal.phone}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedMarketModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleSelectDestination(selectedMarketModal);
                  setSelectedMarketModal(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                Confirm Divert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
