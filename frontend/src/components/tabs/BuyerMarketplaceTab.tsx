import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  MapPin, 
  AlertCircle, 
  X, 
  Send,
  Building2,
  FileCheck2,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BuyerRequest, CropType, QualityGrade } from '../../types';

export const BuyerMarketplaceTab: React.FC = () => {
  const { 
    buyerRequests, 
    selectedShipment, 
    matchAndOfferToBuyer, 
    acceptShipmentAsBuyer,
    setActiveTab 
  } = useApp();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCrop, setNewCrop] = useState<CropType>('Tomato');
  const [newLocation, setNewLocation] = useState('Pune Agro Terminal');
  const [newMinKg, setNewMinKg] = useState(800);
  const [newMaxKg, setNewMaxKg] = useState(1200);
  const [newQuality, setNewQuality] = useState<QualityGrade>('Grade B (Standard Retail)');
  const [newPrice, setNewPrice] = useState(42);

  // Check if current shipment matches requirement req-01 (Pune Tomato)
  const req01 = buyerRequests.find((r) => r.id === 'req-01') || buyerRequests[0];
  const isOfferedOrMatched = req01.status === 'MATCHED' || req01.status === 'ACCEPTED';
  const isAccepted = req01.status === 'ACCEPTED' || selectedShipment.matchedBuyerId === 'buyer-freshmart';

  return (
    <div id="buyer-marketplace-tab" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wide">
                DEMAND AGGREGATION & CONTRACT MATCHING
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">
              Verified Buyer Marketplace
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Procurement orders from certified wholesale buyers, supermarket chains, and food processing facilities.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="self-start sm:self-auto bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Procurement Requirement</span>
          </button>
        </div>
      </div>

      {/* 12. MATCH FOUND SPOTLIGHT CARD */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/80 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded uppercase tracking-widest animate-pulse">
                MATCH FOUND
              </span>
              <span className="text-xs text-emerald-300 font-bold">
                Automated FreshRoute™ Crop Rescue Pairing
              </span>
            </div>

            <span className="text-xs text-slate-400 font-mono-data">Requirement Ref: #REQ-01</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Left: Matched Details */}
            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                FreshMart Agro Distribution Hub (Pune)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Buyer posted requirement for <strong className="text-white">Tomato (800 – 1,200 kg)</strong> in Pune by 7:00 PM. Incoming shipment Batch <strong className="text-emerald-300 font-mono">#{selectedShipment.batch.id}</strong> perfectly fulfills volume and quality thresholds.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono-data">
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-sans">Crop & Quantity</div>
                  <div className="text-sm font-bold text-white mt-0.5">Tomato 1,000 kg</div>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-sans">ETA to Dock</div>
                  <div className="text-sm font-bold text-emerald-300 mt-0.5">5:40 PM Today</div>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-sans">Quality Grade</div>
                  <div className="text-sm font-bold text-white mt-0.5">Grade A/B</div>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-sans">Freshness Monitor</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">LOW 🟢</div>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Offered Contract Price:</span>
                  <span className="text-lg font-black text-emerald-400 font-mono-data">₹42.00 / kg</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                  <span>Total Shipment Settlement:</span>
                  <span className="font-bold text-white font-mono-data">₹42,000.00</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                  <span>Tamper Seal Status:</span>
                  <span className="text-emerald-300 font-mono-data font-bold">#SEAL-9921-IN (INTACT)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                {!isOfferedOrMatched ? (
                  <button
                    id="offer-shipment-to-buyer-btn"
                    onClick={() => matchAndOfferToBuyer('req-01')}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-3 rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>OFFER SHIPMENT TO BUYER</span>
                  </button>
                ) : !isAccepted ? (
                  <div className="flex items-center gap-2">
                    <button
                      id="buyer-accept-shipment-btn"
                      onClick={() => acceptShipmentAsBuyer('shipment-tg102')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3 rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>BUYER: ACCEPT SHIPMENT</span>
                    </button>
                    <button
                      className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
                    >
                      Request Info
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-500/20 border border-emerald-400/50 p-3 rounded-xl text-center space-y-1">
                    <div className="text-xs font-black text-emerald-300 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>CONTRACT ACCEPTED BY FRESHMART</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Dock #4 reserved for unloading. Driver Rajesh Patil notified of gate authorization.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Other Active Buyer Requirements Feed */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-slate-900">
          All Active Wholesale Procurement Requisitions
        </h3>

        <div className="divide-y divide-slate-100">
          {buyerRequests.map((req) => (
            <div key={req.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{req.company}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 font-medium">{req.buyerName}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                    req.status === 'MATCHED' ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1 font-mono-data">
                  <span>Crop: <strong className="text-slate-900">{req.cropRequired}</strong></span>
                  <span>Qty: <strong>{req.quantityMinKg} - {req.quantityMaxKg} kg</strong></span>
                  <span>Location: <strong>{req.location}</strong></span>
                  <span>Deadline: <strong>{req.deadlineTime}</strong></span>
                  <span>Price: <strong className="text-emerald-700">₹{req.offeredPricePerKg}/kg</strong></span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {req.status === 'OPEN' && (
                  <button
                    onClick={() => matchAndOfferToBuyer(req.id)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    Match Batch #TG102
                  </button>
                )}
                {req.status === 'ACCEPTED' && (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Contract Sealed</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
