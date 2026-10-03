import React, { useEffect, useState } from 'react';
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
  ExternalLink,
  MessageSquareText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiClient, CropMarketCategoryRate } from '../../services/apiClient';
import { Market } from '../../types';
import { evaluateMarketRecommendations } from '../../services/kisanSetuBackend';
import { CROP_BASELINES } from '../../services/freshnessEngine';

export const FarmerSmartMarketsView: React.FC = () => {
  const {
    markets,
    selectedShipment,
    confirmReroute,
    setActiveTab
  } = useApp();

  const [selectedMarketModal, setSelectedMarketModal] = useState<Market | null>(null);
  const [divertConfirmSuccess, setDivertConfirmSuccess] = useState(false);
  const [cropCategories, setCropCategories] = useState<CropMarketCategoryRate[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState('');
  const [cropMasterCrops, setCropMasterCrops] = useState<string[]>([]);
  const [selectedRecommendationCrop, setSelectedRecommendationCrop] = useState('');
  const [communityFilter, setCommunityFilter] = useState<'All topics' | 'Crop advice' | 'Transport' | 'Market prices' | 'General'>('All topics');
  const cropOptions = cropMasterCrops.length > 0 ? cropMasterCrops : (Object.keys(CROP_BASELINES) as string[]);

  const communityPosts = [
    {
      id: 'market-post-1',
      author: 'Sonal Patil',
      location: 'Nashik, Maharashtra',
      postedAt: '18 min ago',
      topic: 'Crop advice',
      body: 'Pre-cooling before loading helped us keep the harvest fresh for the longer Pune route.',
    },
    {
      id: 'market-post-2',
      author: 'Rahul Jadhav',
      location: 'Pune, Maharashtra',
      postedAt: '42 min ago',
      topic: 'Transport',
      body: 'We are coordinating a refrigerated load for the next morning dispatch and can share space if needed.',
    },
    {
      id: 'market-post-3',
      author: 'Meena Deshmukh',
      location: 'Satara, Maharashtra',
      postedAt: '1 hr ago',
      topic: 'Market prices',
      body: 'Tomato rates are trending higher at the morning auction, so reviewing destination options before dispatch matters.',
    },
  ] as const;

  const communityFilters = ['All topics', 'Crop advice', 'Transport', 'Market prices', 'General'] as const;
  const visibleCommunityPosts = communityFilter === 'All topics'
    ? communityPosts
    : communityPosts.filter((post) => post.topic === communityFilter);

  useEffect(() => {
    let active = true;
    apiClient.cropMasterCrops()
      .then((crops) => {
        if (!active) return;
        const nextCropList = crops.length ? crops : cropOptions;
        setCropMasterCrops(nextCropList);
        setSelectedRecommendationCrop((current) => current || (nextCropList.includes(selectedShipment.batch.cropType) ? selectedShipment.batch.cropType : nextCropList[0] || ''));
      })
      .catch((requestError) => {
        if (!active) return;
        setCropMasterCrops(cropOptions);
        setSelectedRecommendationCrop((current) => current || (cropOptions.includes(selectedShipment.batch.cropType) ? selectedShipment.batch.cropType : cropOptions[0] || ''));
        setCategoryError(requestError instanceof Error ? requestError.message : 'Crop market data is not available. Refresh to try again.');
      });
    return () => { active = false; };
  }, [selectedShipment.batch.cropType]);

  useEffect(() => {
    let active = true;
    setCategoryLoading(true);
    setCategoryError('');
    if (!selectedRecommendationCrop) {
      setCropCategories([]);
      setCategoryLoading(false);
      return () => { active = false; };
    }
    apiClient.cropMarketCategories(selectedRecommendationCrop, selectedShipment.batch.quantityKg)
      .then((categories) => { if (active) setCropCategories(categories); })
      .catch((requestError) => {
        if (!active) return;
        setCropCategories([]);
        setCategoryError(requestError instanceof Error ? requestError.message : 'No eligible categories are configured for this crop.');
      })
      .finally(() => { if (active) setCategoryLoading(false); });
    return () => { active = false; };
  }, [selectedRecommendationCrop, selectedShipment.batch.quantityKg]);

  const cropBaseline = CROP_BASELINES[selectedShipment.batch.cropType];
  const harvestAgeHours = Math.max(
    0,
    (Date.now() - new Date(selectedShipment.batch.harvestTimestamp).getTime()) / 3_600_000,
  );
  const recommendations = evaluateMarketRecommendations({
    crop: selectedShipment.batch.cropType,
    harvestAgeHours,
    estimatedShelfLifeHours: cropBaseline.baseShelfLifeHours,
    remainingShelfLifeHours: selectedShipment.safeSellingWindowHours,
    quantityKg: selectedShipment.batch.quantityKg,
    spoilageRisk: selectedShipment.spoilageRisk,
    markets,
  });
  const bestFeasibleMarketId = recommendations.find((item) => item.suitability !== 'Low')?.marketId;
  const smartMarketList = recommendations.flatMap((recommendation) => {
    const sourceMarket = markets.find((market) => market.id === recommendation.marketId);
    if (!sourceMarket) return [];

    const riskColor = recommendation.spoilageRisk === 'Critical'
      ? 'text-red-700 bg-red-50 border-red-200'
      : recommendation.spoilageRisk === 'High'
        ? 'text-amber-800 bg-amber-50 border-amber-200'
        : recommendation.spoilageRisk === 'Medium'
          ? 'text-amber-700 bg-amber-50 border-amber-200'
          : 'text-emerald-800 bg-emerald-50 border-emerald-200';

    return [{
      id: sourceMarket.id,
      sourceMarket,
      name: sourceMarket.name,
      location: sourceMarket.location.city,
      distanceKm: sourceMarket.distanceKm,
      etaHours: recommendation.etaHours,
      demand: `${sourceMarket.demandLevel} · ₹${sourceMarket.indicativePricePerKg}/kg`,
      requiredQuantity: `${sourceMarket.requiredQuantityKg.toLocaleString()} kg`,
      cropRequirement: sourceMarket.acceptedCrops.join(', '),
      receivingHours: sourceMarket.operatingHours,
      freshnessRisk: `${recommendation.spoilageRisk} freshness level`,
      riskColor,
      isOriginal: sourceMarket.id === selectedShipment.destinationMarketId,
      isRecommended: sourceMarket.id === bestFeasibleMarketId,
      notes: recommendation.reason,
      contactPerson: sourceMarket.contactPerson,
      score: recommendation.score,
      suitability: recommendation.suitability,
      remainingShelfLifeAtArrivalHours: recommendation.remainingShelfLifeAtArrivalHours,
      estimatedRevenue: recommendation.estimatedRevenue,
    }];
  });

  const handleSelectDestination = (marketId: string) => {
    confirmReroute(marketId);
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
              <h2 className="text-2xl font-bold text-slate-900">
                Smart Market Finder™
              </h2>
              <p className="text-xs text-slate-500">
                Freshness-window market ranking using expected arrival time, demand, price, and shipment conditions
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

      <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white">
        <div className="border-b border-emerald-100 bg-emerald-50 px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h3 className="text-sm font-bold text-emerald-950">Eligible selling categories</h3><p className="mt-1 text-[11px] text-emerald-900">Choose from the crop master. Rates are asking prices from active, verified business listings, not guaranteed transaction prices.</p></div>
            <label className="text-xs font-semibold text-emerald-950">Crop<select value={selectedRecommendationCrop} onChange={(event) => setSelectedRecommendationCrop(event.target.value)} className="ml-2 min-w-48 rounded-md border border-emerald-300 bg-white px-2.5 py-2 text-xs"><option value="">Choose crop</option>{cropOptions.map((crop) => <option key={crop} value={crop}>{crop}</option>)}</select></label>
          </div>
        </div>
        {categoryLoading ? <p className="p-4 text-sm text-slate-500">Loading crop-eligible market categories…</p> : categoryError ? <div role="status" className="p-4 text-sm text-amber-900">No crop-category recommendation is available: {categoryError}</div> : (
          <div className="grid gap-px bg-slate-200 sm:grid-cols-2 xl:grid-cols-3">
            {cropCategories.map((category) => <article key={category.categoryId} className="bg-white p-4">
              <div className="flex items-start justify-between gap-2"><h4 className="text-sm font-semibold text-slate-900">{category.category}</h4><span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600">{category.sourceCategoryId}</span></div>
              <p className="mt-2 text-lg font-bold text-emerald-800">{category.averagePricePerKg === null ? 'No verified rate yet' : `₹${category.lowPricePerKg}–₹${category.highPricePerKg}/kg`}</p>
              <p className="mt-1 text-[11px] text-slate-600">{category.activeOfferCount ? `${category.activeOfferCount} verified offer(s) · ${category.availableQuantityKg.toLocaleString()} kg available · average ₹${category.averagePricePerKg}/kg` : 'No active verified business listings in this category.'}</p>
              <p className="mt-2 text-[10px] text-slate-500">{category.recommendationUse}</p>
            </article>)}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Farmer network</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">Market community</h3>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
            <MessageSquareText className="h-3.5 w-3.5" />
            Community
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {communityFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setCommunityFilter(filter)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
                communityFilter === filter
                  ? 'border-emerald-700 bg-emerald-700 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-200 hover:text-emerald-700'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {visibleCommunityPosts.map((post) => (
            <div key={post.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{post.author}</p>
                  <p className="text-[11px] text-slate-500">{post.location} · {post.postedAt}</p>
                </div>
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-800">
                  {post.topic}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{post.body}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-[11px] text-amber-800">The destination cards below are planning estimates from configured market data. Compare them with live verified offer rates above before deciding where to sell.</p>

      {/* 3 Market Cards: Market A, Market B, Market C */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {smartMarketList.map((market) => {
          const isCurrentActiveDest =
            selectedShipment.destinationMarketId === market.id;

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
                    <span className="text-slate-400">Shelf life remaining at ETA:</span>
                    <span className={`font-bold font-mono-data ${market.remainingShelfLifeAtArrivalHours > 0 ? 'text-slate-900' : 'text-red-700'}`}>
                      {market.remainingShelfLifeAtArrivalHours.toFixed(1)} h
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
                    <span className="font-medium text-slate-800 truncate max-w-[150px]">
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
                    <span className="text-slate-400">Freshness Monitor:</span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${market.riskColor}`}>
                      {market.freshnessRisk}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Decision score:</span>
                    <span className="font-bold text-slate-800">{market.score}/100 · {market.suitability}</span>
                  </div>
                  {market.estimatedRevenue && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Gross produce value:</span>
                      <span className="font-bold text-slate-800">{market.estimatedRevenue}</span>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2 mb-4">
                  {market.notes}
                </p>
              </div>

              {/* Action Buttons: VIEW and SELECT DESTINATION */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => setSelectedMarketModal(market.sourceMarket)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  VIEW
                </button>

                <button
                  onClick={() => handleSelectDestination(market.id)}
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
                <p className="text-xs text-slate-500">{selectedMarketModal.location.city}</p>
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
                  handleSelectDestination(selectedMarketModal.id);
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
