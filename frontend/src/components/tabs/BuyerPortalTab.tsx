import React, { useState } from 'react';
import { 
  Building2, 
  Clock, 
  QrCode, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Truck, 
  Sparkles, 
  Gavel,
  ArrowRight,
  Search,
  Package
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BuyerPortalTab: React.FC = () => {
  const { 
    selectedShipment, 
    acceptShipmentAsBuyer, 
    completeDelivery, 
    raiseDispute, 
    setActiveTab 
  } = useApp();

  const [activeSub, setActiveSub] = useState<'incoming' | 'rescue_deals' | 'receiving'>('incoming');
  const [qrScanned, setQrScanned] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState(selectedShipment.status);

  const isAccepted = selectedShipment.matchedBuyerId === 'buyer-freshmart' || selectedShipment.status === 'REROUTED' || selectedShipment.status === 'DELIVERED';
  const isDelivered = selectedShipment.status === 'DELIVERED';

  const handleScanQr = () => {
    setQrScanned(true);
  };

  const handleAcceptDelivery = () => {
    completeDelivery(selectedShipment.id);
    setDeliveryStatus('DELIVERED');
  };

  return (
    <div id="buyer-portal-tab" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 flex items-center justify-center text-white font-black text-xl shadow-md">
              FM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">
                  FreshMart Agri Procurement Portal
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Verified Buyer
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono-data">
                Terminal: Pune Central Logistics Dock #4 • Lead: Sunil Rao
              </p>
            </div>
          </div>

          {/* Subtabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSub('incoming')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSub === 'incoming'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Incoming Inbound ({selectedShipment ? '1' : '0'})
            </button>
            <button
              onClick={() => setActiveSub('rescue_deals')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSub === 'rescue_deals'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Rescue Deals ⭐
            </button>
            <button
              onClick={() => setActiveSub('receiving')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSub === 'receiving'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Receiving Dock Verification
            </button>
          </div>
        </div>
      </div>

      {activeSub === 'incoming' && (
        <div className="space-y-4">
          {/* Incoming Batch Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-slate-900">
                    BATCH #{selectedShipment.batch.id}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-bold text-emerald-700">
                    {selectedShipment.batch.cropType} ({selectedShipment.batch.quantityKg} kg)
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    {selectedShipment.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  En-route to Pune Terminal from {selectedShipment.originName}
                </h3>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400">ETA to Gate:</div>
                <div className="text-lg font-black text-emerald-700 font-mono-data">
                  {Math.floor(selectedShipment.estimatedTravelTimeMinutes / 60)}h {selectedShipment.estimatedTravelTimeMinutes % 60}m (5:40 PM)
                </div>
              </div>
            </div>

            {/* Quality & Freshness Radar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-data">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-[10px] text-slate-400 font-sans">Freshness Index</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{selectedShipment.freshnessScore} / 100</div>
                <div className="text-[10px] text-emerald-600">Firmness Certified</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-[10px] text-slate-400 font-sans">Tamper Seal</div>
                <div className="text-xs font-bold text-emerald-700 mt-1">#SEAL-9921-IN</div>
                <div className="text-[10px] text-slate-500">Hash Verified Intact</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-[10px] text-slate-400 font-sans">Cargo Temp</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedShipment.sensorHistory[selectedShipment.sensorHistory.length - 1]?.temperatureC || 24}°C
                </div>
                <div className="text-[10px] text-slate-500">Live IoT Telemetry</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-[10px] text-slate-400 font-sans">Settlement Total</div>
                <div className="text-lg font-bold text-emerald-700 mt-0.5">₹42,000</div>
                <div className="text-[10px] text-slate-500">₹42.00 / kg Spot</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Driver: <strong>{selectedShipment.driverName}</strong> • {selectedShipment.vehicleNumber}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('tracking')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer"
                >
                  Track Truck on Map
                </button>
                <button
                  onClick={() => setActiveSub('receiving')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow cursor-pointer"
                >
                  Proceed to Gate Receiving →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSub === 'rescue_deals' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">
              Diverted Crop Rescue Market Opportunities
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Perishable produce batches in-transit requiring dynamic diversion due to highway bottlenecks. High freshness value available at competitive spot rates.
          </p>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-slate-900">BATCH #TG102</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-bold text-slate-800">Fresh Tomatoes (1,000 kg)</span>
                <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded">RESCUE ROUTED</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Originally bound for Mumbai APMC. Rerouted to Pune to preserve peak freshness. Remaining safe-selling window: 4.1 hours.
              </p>
            </div>

            <button
              onClick={() => acceptShipmentAsBuyer(selectedShipment.id)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-2.5 rounded-xl transition shadow cursor-pointer self-start md:self-auto"
            >
              {isAccepted ? 'Contract Confirmed ✅' : 'Claim & Confirm Purchase'}
            </button>
          </div>
        </div>
      )}

      {activeSub === 'receiving' && (
        /* 18. Receiving and Verification Screen */
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Receiving Dock Gate Checkpoint & Seal Verification
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Scan driver's QR identifier, inspect physical tamper seal, and complete electronic receipt.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* QR Verification Section */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Step 1: Gate QR Scan</span>
                {qrScanned && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    SCANNED & MATCHED ✅
                  </span>
                )}
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 text-center space-y-2">
                <QrCode className="w-16 h-16 text-slate-800 mx-auto" />
                <div className="text-xs font-mono text-slate-500">QR-AGRI-TG102-VERIFIED</div>
                <button
                  onClick={handleScanQr}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  {qrScanned ? 'Scan Verified Again' : 'Simulate Scanner Read'}
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Tamper Seal Serial:</span>
                  <strong className="font-mono text-emerald-700">SEAL-9921-IN (Intact)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Certified Quantity:</span>
                  <strong className="font-mono text-slate-800">1,000 kg</strong>
                </div>
              </div>
            </div>

            {/* Final Acceptance / Dispute Option */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">Step 2: Physical Inspection Decision</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Inspect skin color, firmness, and temperature. Batch meets Grade A/B specifications for FreshMart retail distribution.
                </p>
              </div>

              <div className="space-y-2">
                {!isDelivered ? (
                  <div className="space-y-2">
                    <button
                      onClick={handleAcceptDelivery}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black py-3 rounded-xl transition shadow flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ACCEPT DELIVERY & RELEASE SETTLEMENT</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('disputes')}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Gavel className="w-4 h-4 text-red-600" />
                      <span>Report Discrepancy / Open Dispute</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-300 rounded-xl text-center space-y-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                    <div className="text-xs font-bold text-emerald-900">Receipt Sealed Successfully</div>
                    <div className="text-[11px] text-slate-500 font-mono">Ledger Block #TX-8921 Sealed</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
