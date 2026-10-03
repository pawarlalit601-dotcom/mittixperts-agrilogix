import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, FilePlus2, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface InsuranceApplication {
  id: string;
  crop: string;
  coverageType: string;
  insuredValueInr: number;
  requestedCoverageInr: number;
  origin: string;
  destination: string;
  status: string;
  createdAt: string;
}

export const FarmerInsuranceView: React.FC = () => {
  const { selectedShipment } = useApp();
  const [applications, setApplications] = useState<InsuranceApplication[]>([]);
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverageType, setCoverageType] = useState('TRANSIT');
  const [insuredValue, setInsuredValue] = useState(String(selectedShipment.batch.quantityKg * 35));
  const [requestedCoverage, setRequestedCoverage] = useState(String(selectedShipment.batch.quantityKg * 30));

  useEffect(() => {
    fetch('/api/v1/insurance/applications', { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) return;
        const data: InsuranceApplication[] = await response.json();
        setApplications(data);
      })
      .catch(() => undefined);
  }, []);

  const submitApplication = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setNotice('');
    const payload = {
      shipmentId: selectedShipment.id,
      crop: selectedShipment.batch.cropType,
      coverageType,
      insuredValueInr: Number(insuredValue),
      requestedCoverageInr: Number(requestedCoverage),
      origin: selectedShipment.originName,
      destination: selectedShipment.currentDestinationName,
      harvestAt: selectedShipment.batch.harvestTimestamp,
      notes: 'Coverage application submitted from AgriLogix.',
    };

    try {
      const response = await fetch('/api/v1/insurance/applications', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.detail || 'Coverage request could not be submitted. Sign in as a farmer and try again.');
      }
      const application: InsuranceApplication = await response.json();
      setApplications((current) => [application, ...current]);
      setNotice('Coverage application recorded for administrator and insurer review. No policy has been issued.');
    } catch (error) {
      if (import.meta.env.DEV && error instanceof TypeError) {
        setApplications((current) => [{
          ...payload,
          id: crypto.randomUUID(),
          status: 'PREVIEW ONLY',
          createdAt: new Date().toISOString(),
        }, ...current]);
        setNotice('Preview request saved in this browser session only. No insurance policy or coverage is active.');
      } else {
        setNotice(error instanceof Error ? error.message : 'Coverage request could not be submitted.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-800"><ShieldCheck className="h-4 w-4" /> Produce risk protection</div>
        <h2 className="mt-2 text-xl font-bold text-slate-900">Insurance applications</h2>
        <p className="mt-1 text-sm text-slate-600">Request shipment coverage for a produce load. An application is not an insurance policy.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <form onSubmit={submitApplication} className="space-y-4">
          <div className="flex items-center gap-2"><FilePlus2 className="h-4 w-4 text-emerald-700" /><h3 className="text-sm font-bold text-slate-900">Request a coverage review</h3></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-700">Shipment<input readOnly value={`${selectedShipment.trackingNumber} · ${selectedShipment.batch.cropType}`} className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm" /></label>
            <label className="text-xs font-semibold text-slate-700">Coverage category<select value={coverageType} onChange={(event) => setCoverageType(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"><option value="TRANSIT">Transit loss</option><option value="WEATHER">Weather event</option><option value="COMPREHENSIVE">Comprehensive review</option></select></label>
            <label className="text-xs font-semibold text-slate-700">Declared cargo value (₹)<input type="number" min="1" value={insuredValue} onChange={(event) => setInsuredValue(event.target.value)} required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
            <label className="text-xs font-semibold text-slate-700">Requested cover (₹)<input type="number" min="1" max={insuredValue} value={requestedCoverage} onChange={(event) => setRequestedCoverage(event.target.value)} required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <p className="border-l-2 border-blue-600 pl-3"><span className="block text-slate-500">Origin</span><strong className="mt-1 block text-slate-800">{selectedShipment.originName}</strong></p>
            <p className="border-l-2 border-blue-600 pl-3"><span className="block text-slate-500">Destination</span><strong className="mt-1 block text-slate-800">{selectedShipment.currentDestinationName}</strong></p>
          </div>
          <button disabled={isSubmitting} className="rounded-md bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50">{isSubmitting ? 'Submitting…' : 'Submit coverage application'}</button>
          {notice && <p role="status" className="text-xs font-medium text-slate-700">{notice}</p>}
        </form>

        <section className="border-l border-slate-200 pl-0 lg:pl-6">
          <h3 className="text-sm font-bold text-slate-900">Application history</h3>
          {applications.length ? <div className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
            {applications.map((application) => <div key={application.id} className="py-3">
              <div className="flex items-center justify-between gap-3"><strong className="text-sm text-slate-900">{application.crop} · {application.coverageType}</strong><span className="rounded bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800">{application.status}</span></div>
              <p className="mt-1 text-xs text-slate-500">Declared ₹{application.insuredValueInr.toLocaleString('en-IN')} · Requested ₹{application.requestedCoverageInr.toLocaleString('en-IN')}</p>
              <p className="mt-1 text-[11px] text-slate-500">{new Date(application.createdAt).toLocaleString()}</p>
            </div>)}
          </div> : <p className="mt-3 border-y border-slate-200 py-6 text-sm text-slate-500">No coverage applications yet.</p>}
          <div className="mt-5 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>AgriLogix is not an insurer. Coverage, premium, exclusions, policy issuance, and claims decisions require a licensed insurance provider. Do not dispatch based on a pending application.</p>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500"><CheckCircle2 className="h-3.5 w-3.5" /> Shipment and value details are submitted for review only.</p>
        </section>
      </div>
    </div>
  );
};