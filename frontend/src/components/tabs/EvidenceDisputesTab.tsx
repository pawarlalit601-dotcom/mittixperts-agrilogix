import React, { useState } from 'react';
import { 
  FileText, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Scale, 
  Thermometer, 
  MapPin, 
  Camera, 
  Lock, 
  Download, 
  Sparkles,
  ChevronRight,
  Gavel,
  Check,
  AlertOctagon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DisputeRecord } from '../../types';

export const EvidenceDisputesTab: React.FC = () => {
  const { 
    selectedShipment, 
    disputes, 
    raiseDispute 
  } = useApp();

  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [claimText, setClaimText] = useState('Buyer claims: Produce arrived slightly soft with elevated surface warmth.');
  const [claimantRole, setClaimantRole] = useState<'BUYER' | 'TRANSPORTER' | 'FARMER'>('BUYER');

  const activeDispute = (disputes && disputes.find((d) => d.shipmentId === selectedShipment.id)) 
    || (disputes && disputes[0]) 
    || selectedShipment.dispute 
    || {
      id: 'DSP-2024-089',
      shipmentId: selectedShipment.id,
      raisedBy: 'FreshMart Agro Quality Dock Inspector',
      raisedAt: '05:45 PM',
      status: 'ADJUDICATED & RESOLVED',
      claimReason: 'Produce arrived with partial softening on top crates after traffic delay',
      claimType: 'TRANSIT_TEMPERATURE_ABUSE',
      claimDescription: 'Buyer noted partial skin softening on top tomato layer upon unloading at Pune dock.',
      auditOutcome: 'Transit thermal spike confirmed (+15°C). Farm origin cleared Grade A. 0% farmer liability.',
      buyerObservedQuality: 'Grade B (Firmness 3.4 kg/cm², slight softening)',
      investigationStatus: 'RESOLVED_NEUTRAL',
      transitViolationDetected: true,
      transitViolationDetails: 'Sensor logs verify container temperature exceeded 30°C between 01:00 PM and 01:45 PM during traffic gridlock on NH-160 Kasara Ghat.',
      weatherCrossCheckStatus: 'CONSISTENT',
      impartialSummary: 'Dispatch evidence demonstrates produce was loaded at Grade A (Brix 4.8) with seal intact. Spoilage risk escalated during transit due to in-cabin thermal spike (+15°C above optimal refrigeration setpoint). Tamper seal remained unbroken.',
      contributingFactors: [
        'Farm dispatch condition was verified Grade A on digital scale',
        'In-transit refrigeration temperature excursion documented by real-time IoT thermal curve',
        'Severe highway congestion added +4.2 hours to transit',
        'Tamper-evident seal was verified unbroken upon dock arrival',
      ],
    };

  const handleRaiseDispute = (e: React.FormEvent) => {
    e.preventDefault();
    raiseDispute(selectedShipment.id, claimText, claimantRole);
    setDisputeModalOpen(false);
  };

  return (
    <div id="evidence-disputes-tab" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-slate-900 text-emerald-400 text-xs font-mono font-bold px-2.5 py-0.5 rounded uppercase tracking-wide">
                DIGITAL CHAIN OF CUSTODY & EVIDENCE TIMELINE
              </span>
              <span className="text-xs text-slate-500 font-mono-data">
                Shipment #{selectedShipment.batch.id}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">
              Auditable Event Ledger & Dispute Adjudication
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Multi-point cryptographic evidence prevents finger-pointing between farmer, logistics transporter, and buyer.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="raise-dispute-trigger-btn"
              onClick={() => setDisputeModalOpen(true)}
              className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Gavel className="w-4 h-4" />
              <span>Simulate / File Dispute</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8. DISPUTE RESOLUTION REPORT CARD */}
      {activeDispute && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 border-2 border-red-500/50 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black text-red-400 uppercase tracking-wider">
                    DISPUTE CASE #{activeDispute.id}
                  </span>
                  <span className="bg-red-500/20 text-red-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                    {activeDispute.status}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  Claim: “{activeDispute.claimReason}”
                </h3>
              </div>
            </div>

            <div className="text-xs font-mono text-slate-400">
              Raised by: <strong className="text-white">{activeDispute.raisedBy}</strong>
            </div>
          </div>

          {/* 5 Forensic Questions Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              System Evidence Verification Audit
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Q1 */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>1. What was the produce quality at loading?</span>
                  <span className="text-emerald-400 font-mono">CLEARED (NO)</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Farm record shows Brix 4.8° Bx, Firmness 4.2 kg/cm², Calibrated digital weight 1,000 kg, Grade A certified with valid tamper seal #SEAL-9921-IN.
                </p>
              </div>

              {/* Q2 */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>2. Did driver take an unauthorized route?</span>
                  <span className="text-emerald-400 font-mono">CLEARED (NO)</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  GPS telemetry shows 100% adherence to NH-160 highway corridor. Zero off-route excursions or unlogged stops.
                </p>
              </div>

              {/* Q3 */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>3. Were there unexpected road schedule updates?</span>
                  <span className="text-amber-400 font-mono">CONFIRMED (YES)</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Kasara Ghat landslide bottleneck caused severe congestion, dropping velocity to 6 km/h and expanding travel time by +4h 20m.
                </p>
              </div>

              {/* Q4 */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>4. Did thermal abuse occur in cargo?</span>
                  <span className="text-red-400 font-mono">DETECTED (YES)</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Cargo container ambient spiked from 24°C to 33°C during afternoon queue, accelerating biological respiration rate by 3.2x.
                </p>
              </div>
            </div>

            {/* Q5: Seal Status */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-white">5. Tamper-Evident Seal Verification:</span>
                <span className="text-slate-400 ml-2">Digital hash matches origin. Zero physical breach.</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold">SEAL INTACT (PASSED)</span>
            </div>
          </div>

          {/* Root-Cause Diagnosis & Recommendation */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-700 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>FORENSIC CONCLUSION & LIABILITY ALLOCATION</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-white">Quality change likely followed the transit temperature increase and schedule update after the Kasara Ghat traffic incident.</strong> Initial farm quality verified as Grade A with valid tamper seal.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-slate-400 font-mono">
              <span>Farmer Liability: <strong className="text-emerald-400">0% (Vindicated)</strong></span>
              <span>Transporter/Force Majeure: <strong className="text-amber-400">Road Gridlock Incident</strong></span>
              <span>Crop Rescue Salvage: <strong className="text-emerald-400">100% Value Preserved at Market B</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* 7. DIGITAL CHAIN OF CUSTODY TIMELINE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-slate-900">
            Immutable Chain of Custody Timeline
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically sealed events with timestamp, GPS coordinate, physical sensor telemetry, and digital witness signatures.
          </p>
        </div>

        <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {selectedShipment.verificationRecords.map((record) => (
            <div key={record.id} className="relative group">
              {/* Marker Dot */}
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center shadow-xs group-hover:scale-110 transition">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
              </div>

              {/* Event Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {new Date(record.timestamp).toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                      {record.checkpoint}
                    </h4>
                    <span className="text-[10px] font-mono bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                      {record.locationName}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono">
                    Actor: <strong className="text-slate-800">{record.inspectorName}</strong>
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {record.notes}
                </p>

                {/* Sensor snapshot if available */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-mono text-slate-500 border-t border-slate-200/60">
                  <span>Quantity: <strong className="text-slate-800">{record.quantityKg} kg</strong></span>
                  <span>Quality: <strong className="text-slate-800">{record.qualityObserved}</strong></span>
                  <span>Seal: <strong className="text-emerald-700">{record.sealStatus}</strong></span>
                  <span>GPS: <strong className="text-slate-800">{record.gpsCoords.lat.toFixed(4)}, {record.gpsCoords.lng.toFixed(4)}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dispute Modal */}
      {disputeModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-slate-900">File Produce Quality Dispute</h3>
              </div>
              <button
                onClick={() => setDisputeModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRaiseDispute} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Claimant Persona:</label>
                <select
                  value={claimantRole}
                  onChange={(e) => setClaimantRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                >
                  <option value="BUYER">Buyer (Receiving Inspection)</option>
                  <option value="TRANSPORTER">Transporter (Schedule / Condition)</option>
                  <option value="FARMER">Farmer (Quality Dispute)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Dispute / Defect Observation:</label>
                <textarea
                  rows={3}
                  value={claimText}
                  onChange={(e) => setClaimText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
                Submitting will trigger instant forensic matching across Farm Loading, IoT thermal records, and GPS travel timestamps.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDisputeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow cursor-pointer"
                >
                  Run Forensic Adjudication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
