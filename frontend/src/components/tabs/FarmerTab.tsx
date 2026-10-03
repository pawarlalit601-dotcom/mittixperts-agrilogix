import React, { useState } from 'react';
import { 
  Sprout, 
  Scale, 
  QrCode, 
  ShieldCheck, 
  Camera, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  FileText, 
  Lock,
  Upload,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CropType, QualityGrade } from '../../types';

export const FarmerTab: React.FC = () => {
  const { 
    createNewShipment, 
    selectedShipment, 
    shipments, 
    setActiveTab 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'create' | 'active_batches' | 'inspection'>('create');

  // Form State
  const [cropType, setCropType] = useState<CropType>('Tomato');
  const [variety, setVariety] = useState('Roma Hybrid Red');
  const [quantityKg, setQuantityKg] = useState<number>(1000);
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>('Grade A (Export/Premium)');
  const [brixScore, setBrixScore] = useState<number>(4.8);
  const [firmnessScore, setFirmnessScore] = useState<number>(4.2);
  const [isDigitalScaleCalibrated, setIsDigitalScaleCalibrated] = useState<boolean>(true);
  const [sealApplied, setSealApplied] = useState<boolean>(true);
  const [photoUploaded, setPhotoUploaded] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      createNewShipment({
        cropType,
        variety,
        quantityKg,
        quality: qualityGrade,
        farmName: 'Godavari Valley Organic Farms',
      });
      setIsSubmitting(false);
      setActiveSubTab('active_batches');
    }, 600);
  };

  return (
    <div id="farmer-tab" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wide">
                FARMER DISPATCH PORTAL & DIGITAL CHAIN OF TRUST
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">
              Crop Batch Certification & Multi-Point Authentication
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Guarding farm authenticity through digital weight validation, tamper-evident seals, and cryptographic dispatch records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('create')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'create'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              + Create Batch
            </button>
            <button
              onClick={() => setActiveSubTab('active_batches')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'active_batches'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Active Batches ({shipments.length})
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Register New Harvest & Dispatch Checkpoint
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-point digital evidence prevents quality tampering between farm gate and receiving dock.
              </p>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Crop Type */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Crop Commodity:
                  </label>
                  <select
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value as CropType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Tomato">Tomato (Perishable - High Q10)</option>
                    <option value="Strawberries">Strawberries (Short freshness window)</option>
                    <option value="Bell Pepper">Bell Pepper (Medium Shelf Life)</option>
                    <option value="Potato">Potato (Cured Tuber)</option>
                    <option value="Onion">Onion (High Shelf Life)</option>
                    <option value="Grapes">Grapes (Cold Chain Required)</option>
                  </select>
                </div>

                {/* Variety */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Cultivar / Variety:
                  </label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Quantity */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Certified Quantity (kg):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={quantityKg}
                      onChange={(e) => setQuantityKg(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400 font-semibold">kg</span>
                  </div>
                </div>

                {/* Quality Grade */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Quality Inspection Grade:
                  </label>
                  <select
                    value={qualityGrade}
                    onChange={(e) => setQualityGrade(e.target.value as QualityGrade)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                  >
                    <option value="Grade A (Export/Premium)">Grade A (Export/Premium - Brix &gt; 4.5)</option>
                    <option value="Grade B (Standard Retail)">Grade B (Standard Retail)</option>
                    <option value="Grade C (Processing Only)">Grade C (Processing Only)</option>
                  </select>
                </div>
              </div>

              {/* 6. Anti-Collusion Digital Quality Sampling */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-extrabold text-slate-900">
                    Random Calibrated Quality Sampling
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px]">Brix Sugar Score:</span>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">{brixScore}° Bx</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Firmness Index:</span>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">{firmnessScore} kg/cm²</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Weigh Bridge:</span>
                    <div className="font-semibold text-emerald-700 mt-0.5">Calibrated Digital Scale ✅</div>
                  </div>
                </div>
              </div>

              {/* Security & Tamper-Evident Seals */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Tamper-Evident Chain of Custody Security:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold">RFID Tamper Seal Locked</div>
                      <div className="text-[11px] text-slate-500 font-mono">SEAL-9921-IN (Intact)</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold">Dispatch Photos Logged</div>
                      <div className="text-[11px] text-slate-500">2 timestamped photos captured</div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm py-3 rounded-xl transition shadow cursor-pointer flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>{isSubmitting ? 'Generating Official Dispatch Hash...' : 'GENERATE BATCH ID, QR & DISPATCH'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Digital Verification Certificate Mockup */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                    CRYPTOGRAPHIC DISPATCH RECORD
                  </span>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  SHA-256
                </span>
              </div>

              <div className="text-center py-4 bg-slate-950 rounded-2xl border border-slate-800/80 mb-4">
                <div className="w-24 h-24 mx-auto bg-white p-2 rounded-xl flex items-center justify-center shadow-md">
                  {/* Stylized QR Code SVG */}
                  <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                    <rect x="10" y="10" width="25" height="25" />
                    <rect x="65" y="10" width="25" height="25" />
                    <rect x="10" y="65" width="25" height="25" />
                    <rect x="15" y="15" width="15" height="15" fill="#ffffff" />
                    <rect x="70" y="15" width="15" height="15" fill="#ffffff" />
                    <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
                    <rect x="40" y="15" width="10" height="20" />
                    <rect x="45" y="45" width="20" height="20" />
                    <rect x="70" y="70" width="15" height="15" />
                  </svg>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-400 mt-2">
                  QR-AGRI-TG102-VERIFIED
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Scan at transport and buyer gates
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Seal Serial:</span>
                  <span className="text-emerald-300 font-bold">SEAL-9921-IN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Weight Certified:</span>
                  <span className="text-white">1,000.4 kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dispatch Location:</span>
                  <span className="text-white">Nashik Valley Agro</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Inspector Sign:</span>
                  <span className="text-white">Balwant Kadam</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 text-center">
              Random Independent Audit Protocol Active. Data is immutable once sealed.
            </div>
          </div>
        </div>
      ) : (
        /* Active Batches List */
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Registered Farm Shipments
          </h3>

          <div className="divide-y divide-slate-100">
            {shipments.map((s) => (
              <div key={s.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-slate-900">
                      Batch #{s.batch.id}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-700">
                      {s.batch.cropType} ({s.batch.quantityKg} kg)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {s.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 mt-1 font-mono-data">
                    Destination: <strong className="text-slate-800">{s.currentDestinationName}</strong> • Driver: {s.driverName} • Seal: {s.batch.tamperSealId}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('tracking')}
                    className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    Track Shipment Live →
                  </button>
                  <button
                    onClick={() => setActiveTab('disputes')}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1.5"
                  >
                    View Chain of Custody
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
