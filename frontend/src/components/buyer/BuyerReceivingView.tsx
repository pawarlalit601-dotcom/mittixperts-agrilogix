import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Scale,
  Award,
  Lock,
  Camera,
  ShieldCheck,
  Building,
  Truck,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BuyerReceivingView: React.FC = () => {
  const { selectedShipment, completeDelivery, setActiveTab } = useApp();

  const [receivedWeight, setReceivedWeight] = useState('998');
  const [inspectedGrade, setInspectedGrade] = useState('Grade A');
  const [sealCondition, setSealCondition] = useState('Intact');
  const [notes, setNotes] = useState('Produce arrived in crisp condition with no thermal bruising.');
  const [successBanner, setSuccessBanner] = useState(false);

  const isAlreadyDelivered = selectedShipment.status === 'DELIVERED';

  const handleAcceptShipment = () => {
    completeDelivery();
    setSuccessBanner(true);
  };

  const handleReportIssue = () => {
    setActiveTab('disputes');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Dock Receiving & Quality Handover Form
          </h2>
          <p className="text-xs text-slate-500">
            Certified delivery acceptance for Batch #TG102 &bull; 1,000 kg Tomatoes
          </p>
        </div>

        {isAlreadyDelivered && (
          <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4" />
            <span>Delivery Accepted & Ledger Sealed</span>
          </span>
        )}
      </div>

      {successBanner && (
        <div className="p-5 rounded-3xl bg-emerald-600 text-white shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-base">Shipment Accepted Successfully!</h4>
              <p className="text-xs text-emerald-100">
                Tamper seal confirmed intact, all 998 kg accounted for, and the full shipment preserved. Digital receipt generated.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('disputes')}
            className="px-4 py-2 rounded-xl bg-white text-emerald-800 text-xs font-bold shadow-xs cursor-pointer"
          >
            View Chain of Custody
          </button>
        </div>
      )}

      {/* Main Receiving Form Required by Prompt:
          - Received quantity (e.g. 998 kg)
          - Quality inspection grade (Grade A / Grade B)
          - Tamper seal condition (Intact / Broken)
          - Photos of delivered produce
          Buttons:
          - ACCEPT SHIPMENT
          - REQUEST QUALITY REVIEW
      */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Received Quantity */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Received Quantity (kg) *
            </label>
            <div className="relative">
              <input
                type="number"
                value={receivedWeight}
                onChange={(e) => setReceivedWeight(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <Scale className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Farm Dispatch tare: 998 kg (0 kg variance)
            </p>
          </div>

          {/* Quality Inspection Grade */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Quality Inspection Grade *
            </label>
            <select
              value={inspectedGrade}
              onChange={(e) => setInspectedGrade(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="Grade A">Grade A (Firm, Export/Retail standard)</option>
              <option value="Grade B">Grade B (Slight softening / Processing grade)</option>
              <option value="Grade C">Grade C (Severe thermal degradation)</option>
            </select>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">
              Matches Farm Gate Dispatch Grade A
            </p>
          </div>

          {/* Tamper Seal Condition */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tamper Seal Condition *
            </label>
            <select
              value={sealCondition}
              onChange={(e) => setSealCondition(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="Intact">Intact (Seal #SEAL-9921-IN verified)</option>
              <option value="Broken">Broken / Tampered</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Physical seal was inspected prior to bay door unlock
            </p>
          </div>
        </div>

        {/* Photos of Delivered Produce */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Photos of Delivered Produce (Dock Receiving Proof)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-28 bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80"
                alt="Unloaded Produce"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1.5 left-1.5 bg-slate-950/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                Unloaded Crates
              </span>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-28 bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=500&auto=format&fit=crop&q=80"
                alt="Cold Bay Inspection"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1.5 left-1.5 bg-slate-950/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                Bay Cold Chamber
              </span>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-3 text-slate-400 hover:border-amber-400 cursor-pointer h-28">
              <Camera className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] font-bold mt-1">Add Photo</span>
            </div>
          </div>
        </div>

        {/* Inspector Remarks */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Inspector Receiving Remarks
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Required Buttons: ACCEPT SHIPMENT and REQUEST QUALITY REVIEW */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-end gap-3">
          <button
            type="button"
            id="report-quality-issue-btn"
            onClick={handleReportIssue}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold transition cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>REQUEST QUALITY REVIEW</span>
          </button>

          <button
            type="button"
            id="accept-shipment-btn"
            onClick={handleAcceptShipment}
            className="flex items-center justify-center gap-2 px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ACCEPT SHIPMENT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
