import React, { useState } from 'react';
import {
  ShieldCheck,
  QrCode,
  Lock,
  Scale,
  Calendar,
  MapPin,
  Camera,
  CheckCircle2,
  FileCheck,
  Download,
  Share2,
  ExternalLink,
  Sparkles,
  Smartphone,
  Eye,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { QRCodeGenerator } from '../common/QRCodeGenerator';

export const FarmerVerificationView: React.FC = () => {
  const { selectedShipment } = useApp();
  const batch = selectedShipment.batch;
  const batchId = batch.id || 'TG102';

  const [copiedHash, setCopiedHash] = useState(false);
  const [testScanned, setTestScanned] = useState(false);
  const [qrFormat, setQrFormat] = useState<'id' | 'full'>('id');

  const qrPayload = qrFormat === 'id' 
    ? batchId 
    : JSON.stringify({
        batchId: batchId,
        crop: batch.cropType,
        quantityKg: batch.quantityKg,
        grade: 'Grade A',
        seal: batch.tamperSealId || 'SEAL-9921-IN',
        hash: batch.officialDispatchHash || '0x4f89d31b2e90c8a1fe44',
        timestamp: '2026-09-17T09:15:00Z'
      });

  const copyHash = () => {
    navigator.clipboard.writeText(batch.officialDispatchHash || '0x4f89d31b2e90c8a1');
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const simulateTestScan = () => {
    setTestScanned(true);
    setTimeout(() => setTestScanned(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Verification Success Message with Integrated Scannable QR Code */}
      <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-emerald-500/30 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left info */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black tracking-wider uppercase border border-emerald-400/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>VERIFICATION SUCCESSFUL</span>
              </span>
              <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
                Block Sealed #0x4f89d31b
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                <span>Shipment Batch Verified</span>
                <span className="text-emerald-400">✓</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                Batch ID <strong className="text-emerald-400 font-mono text-sm sm:text-base underline decoration-emerald-400/50 underline-offset-2">#{batchId}</strong> has been successfully certified with calibrated weighbridge measurements (998 kg), sealed with Tamper Tag #SEAL-9921-IN, and converted into an instant scannable QR certificate below.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Grade A Export Quality</span>
              </div>
              <span className="text-slate-600">&bull;</span>
              <div className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Tare Weight Certified (998 kg)</span>
              </div>
              <span className="text-slate-600">&bull;</span>
              <div className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Physical & Digital Seal Synchronized</span>
              </div>
            </div>
          </div>

          {/* Integrated Scannable QR Component in the Success Message */}
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/40 shadow-lg flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <div className="shrink-0 bg-white rounded-xl p-1.5 shadow-md">
              <QRCodeGenerator
                value={batchId}
                size={110}
                showActions={false}
                className="scale-100"
                altText={`Scannable QR Code for Batch ${batchId}`}
              />
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                  SCANNABLE BATCH IMAGE
                </span>
                <span className="font-mono text-sm font-black text-white">
                  Batch: {batchId}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px]">
                  Point any phone camera to scan Batch ID directly from screen.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={simulateTestScan}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  {testScanned ? (
                    <>
                      <Check className="w-3 h-3 text-white" />
                      <span>Scanned: {batchId}!</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-3 h-3" />
                      <span>Test Scan</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={copyHash}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 transition cursor-pointer flex items-center gap-1"
                >
                  <FileCheck className="w-3 h-3 text-emerald-400" />
                  <span>{copiedHash ? 'Hash Copied!' : 'Copy Hash'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Test Scan Confirmation Banner (when triggered) */}
        {testScanned && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl flex items-center justify-between text-xs text-emerald-200 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Camera Optical Scanner successfully resolved payload: <strong className="font-mono text-white font-bold">{batchId}</strong></span>
            </div>
            <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded">
              VERIFIED 100%
            </span>
          </div>
        )}
      </div>

      {/* 4 Quick Verification Cards Required by Prompt */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Batch ID
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {batchId}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            QR: QR-AGRI-{batchId}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Digital Weight
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-data">
            {batch.quantityKg || 998} kg
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Weighbridge Calibrated
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Tamper Seal Status
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono flex items-center gap-1.5">
            <Lock className="w-5 h-5 text-emerald-600" />
            <span>INTACT</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            #{batch.tamperSealId || 'SEAL-9921-IN'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Dispatch Status
          </div>
          <div className="text-2xl font-black text-emerald-700 uppercase">
            DISPATCHED
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Chain of custody locked
          </div>
        </div>
      </div>

      {/* Comprehensive Dispatch Evidence Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Evidence Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
            <span>Farm-Gate Inspection Checkpoint Records</span>
            <span className="text-xs text-slate-400 font-normal">Standard Operating Procedure v4.2</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-slate-400 font-medium">Crop Type & Variety</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  {batch.cropType} ({batch.variety || 'Hybrid Fresh'})
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-slate-400 font-medium">Verified Quantity</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5 font-mono-data">
                  {batch.quantityKg || 998} kg Certified (Tare: 4,200 kg, Gross: 5,198 kg)
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-slate-400 font-medium">Loading Timestamp</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  Today at 09:15 AM IST
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-slate-400 font-medium">GPS Dispatch Coordinates</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5 font-mono">
                  19.9975° N, 73.7898° E (Sahyadri Gate 1)
                </div>
              </div>
            </div>

            {/* Random Quality Sample Metrics */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80">
              <div className="font-bold text-slate-900 text-xs mb-2 flex items-center justify-between">
                <span>Random Quality Sample (AQL Level II)</span>
                <span className="text-emerald-700 font-bold">Grade A Verified</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-white border border-emerald-100">
                  <div className="text-[10px] text-slate-400">Brix Sugar Content</div>
                  <div className="font-bold text-slate-900 font-mono mt-0.5">4.8 °Bx</div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-emerald-100">
                  <div className="text-[10px] text-slate-400">Pulp Firmness</div>
                  <div className="font-bold text-slate-900 font-mono mt-0.5">4.5 kg/cm²</div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-emerald-100">
                  <div className="text-[10px] text-slate-400">Color Index</div>
                  <div className="font-bold text-slate-900 font-mono mt-0.5">Stage 4 (Pink-Red)</div>
                </div>
              </div>
            </div>

            {/* Loading Photos */}
            <div>
              <div className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-slate-400" />
                <span>Photographic Evidence at Loading</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="relative rounded-xl overflow-hidden border border-slate-200 h-28 bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80"
                    alt="Loading Crates"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 left-1 bg-slate-950/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                    Crates Stacked
                  </span>
                </div>
                <div className="relative rounded-xl overflow-hidden border border-slate-200 h-28 bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=500&auto=format&fit=crop&q=80"
                    alt="Truck Loading"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 left-1 bg-slate-950/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                    Reefer Cold Bay
                  </span>
                </div>
                <div className="relative rounded-xl overflow-hidden border border-slate-200 h-28 bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=500&auto=format&fit=crop&q=80"
                    alt="Tamper Seal"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 left-1 bg-slate-950/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                    Seal #9921 Locked
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Interactive High-Resolution Batch QR Generator Component */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col items-center text-center justify-between space-y-4">
          <div className="w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>Official Batch QR Code</span>
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            </div>

            {/* Toggle format: Raw Batch ID vs Full Cryptographic Record */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-3 text-xs">
              <button
                type="button"
                onClick={() => setQrFormat('id')}
                className={`flex-1 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                  qrFormat === 'id' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Batch ID ({batchId})
              </button>
              <button
                type="button"
                onClick={() => setQrFormat('full')}
                className={`flex-1 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                  qrFormat === 'full' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Full Cert JSON
              </button>
            </div>

            {/* QR Code Generator Component Instance */}
            <div className="w-full flex justify-center py-1">
              <QRCodeGenerator
                value={qrPayload}
                size={175}
                label={`ID: ${batchId}`}
                subLabel="Scan with Buyer terminal at receiving bay for instantaneous cryptographic check."
                showActions={true}
                altText={`Scannable Agricultural QR for Batch ${batchId}`}
              />
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-left space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Tamper Seal:</span>
                <span className="font-mono font-bold text-slate-800">#{batch.tamperSealId || 'SEAL-9921-IN'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Error Correction:</span>
                <span className="text-emerald-700 font-semibold">Level H (30% Damage Safe)</span>
              </div>
            </div>
          </div>

          <div className="w-full pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono truncate">
            Signature: {batch.officialDispatchHash || '0x4f89d31b2e90c8a1fe44'}
          </div>
        </div>
      </div>
    </div>
  );
};

