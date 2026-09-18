import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock3,
  HelpCircle,
  MapPin,
  ShieldAlert,
  Store,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatHours, recommendMarketsForShipment } from '../../services/marketRecommendation';

const FAQ_ITEMS = [
  {
    question: 'How does the AI predict spoil time?',
    answer: 'It combines the selected crop profile with the latest temperature, humidity, time already in transit, and the current route ETA. The result is a conservative safe-selling window before the produce is likely to lose commercial grade.',
  },
  {
    question: 'Why is a market marked safe?',
    answer: 'A market is safe when its estimated travel time fits inside the predicted window with at least one hour reserved for unloading, inspection, and buyer handoff.',
  },
  {
    question: 'What happens if no market fits the window?',
    answer: 'The advisor shows the least-risk fallback markets and highlights the shortfall. The farmer can activate Crop Rescue or contact the buyer to agree on an immediate offtake plan.',
  },
  {
    question: 'Can the buyer trust the arrival prediction?',
    answer: 'The buyer sees the same live shipment telemetry, route ETA, freshness score, and chain-of-custody evidence. Predictions are estimates, so the buyer should confirm the final quality at receiving.',
  },
];

export const AiSellAdvisor: React.FC = () => {
  const { markets, selectedShipment, setActiveTab, confirmReroute } = useApp();
  const [openFaq, setOpenFaq] = useState(0);
  const recommendations = useMemo(
    () => recommendMarketsForShipment(selectedShipment, markets),
    [markets, selectedShipment],
  );
  const safeRecommendations = recommendations.filter((recommendation) => recommendation.isSafe);
  const bestRecommendation = safeRecommendations[0] || recommendations[0];

  return (
    <section className="space-y-4">
      <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-extrabold">AI Sell-Time Advisor</h3>
                <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-300 border border-emerald-400/40 rounded-full px-2 py-0.5">
                  Live prediction
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                {selectedShipment.batch.cropType} should reach a buyer within{' '}
                <strong className="text-white">{formatHours(selectedShipment.safeSellingWindowHours)}</strong>.
                Markets below are ranked by arrival safety, demand, and expected price.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 rounded-xl px-3 py-2 shrink-0">
            <Clock3 className="w-4 h-4 text-emerald-300" />
            <span>Live safe window: <strong className="text-white">{formatHours(selectedShipment.safeSellingWindowHours)}</strong></span>
          </div>
        </div>

        {bestRecommendation ? (
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-center bg-white/5 border border-white/10 rounded-2xl p-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
                {bestRecommendation.isSafe ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4 text-amber-300" />}
                {bestRecommendation.isSafe ? 'Best safe market' : 'No market fits the safety buffer'}
              </div>
              <h4 className="text-sm font-bold text-white mt-1">{bestRecommendation.market.name}</h4>
              <p className="text-xs text-slate-300 mt-1">{bestRecommendation.matchReason}</p>
            </div>
            <button
              onClick={() => {
                if (bestRecommendation.isSafe) {
                  confirmReroute(bestRecommendation.market.id);
                }
                setActiveTab('markets');
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 transition cursor-pointer"
            >
              Review markets <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <p className="mt-5 text-xs text-amber-200 bg-amber-500/20 border border-amber-400/40 rounded-xl p-3">
            No listed market currently accepts this crop. Add a buyer request or contact a nearby receiving center.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Markets that can receive in time</h3>
              <p className="text-xs text-slate-500 mt-0.5">One hour is reserved for unloading and buyer inspection.</p>
            </div>
            <Store className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="space-y-2.5">
            {recommendations.map((recommendation) => (
              <div key={recommendation.market.id} className={`border rounded-2xl p-3 ${recommendation.isSafe ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {recommendation.isSafe ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />}
                      <h4 className="text-xs font-bold text-slate-900 truncate">{recommendation.market.name}</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{recommendation.market.location.city} · {recommendation.market.demandLevel} demand</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md shrink-0 ${recommendation.isSafe ? 'text-emerald-800 bg-emerald-100' : 'text-amber-800 bg-amber-100'}`}>
                    {recommendation.isSafe ? 'SAFE' : 'LATE'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[11px] text-slate-600">
                  <span>Arrival: <strong>{formatHours(recommendation.arrivalHours)}</strong></span>
                  <span>Price: <strong>₹{recommendation.market.indicativePricePerKg}/kg</strong></span>
                  <span className={recommendation.isSafe ? 'text-emerald-700' : 'text-amber-700'}>{recommendation.matchReason}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Ask AI Freshness FAQ</h3>
              <p className="text-xs text-slate-500">Quick answers for farmer and buyer decisions.</p>
            </div>
          </div>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={item.question} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button onClick={() => setOpenFaq(isOpen ? -1 : index)} className="w-full flex items-center justify-between gap-3 text-left px-3 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer">
                    <span>{item.question}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && <p className="px-3 pb-3 text-[11px] text-slate-600 leading-relaxed">{item.answer}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};