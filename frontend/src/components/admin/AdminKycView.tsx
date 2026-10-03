import React, { useEffect, useState } from 'react';
import { BadgeCheck, FileText, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiClient, KycApplication, KycApplicationSummary, KycDocument } from '../../services/apiClient';
import { formatVerificationStatus } from '../../utils/statusLabels';

const ACCOUNT_LABELS: Record<string, string> = {
  FARMER: 'Farmer', TRANSPORTER: 'Transporter', DRIVER: 'Driver', WHOLESALER: 'Wholesaler',
  RETAILER: 'Retailer', FPO: 'FPO', BUYER_BUSINESS: 'Buyer / Business',
};

const TAB_FILTERS: Record<string, string> = {
  'kyc-farmers': 'FARMER', 'kyc-transporters': 'TRANSPORTER', 'kyc-drivers': 'DRIVER',
  'kyc-wholesalers': 'WHOLESALER', 'kyc-retailers': 'RETAILER', 'kyc-fpos': 'FPO',
  'kyc-businesses': 'BUYER_BUSINESS',
};

const labelFor = (value: string) => value.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
const dateLabel = (value: string | null | undefined) => value ? new Date(value).toLocaleDateString() : 'Not submitted';
const profileText = (profile: Record<string, unknown>, keys: string[], fallback: string) => {
  const value = keys.map((key) => profile[key]).find((item) => typeof item === 'string' && item.trim());
  return typeof value === 'string' ? value : fallback;
};

export const AdminKycView: React.FC = () => {
  const { activeTab } = useApp();
  const [applications, setApplications] = useState<KycApplicationSummary[]>([]);
  const [selected, setSelected] = useState<KycApplication | null>(null);
  const [auditEvents, setAuditEvents] = useState<Array<{ eventType: string; detail: string; actorId: string; createdAt: string }>>([]);
  const [expiryDocuments, setExpiryDocuments] = useState<KycDocument[]>([]);
  const [applicationReason, setApplicationReason] = useState('');
  const [documentReasons, setDocumentReasons] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadQueue = async () => {
    setError('');
    try {
      const rows = await apiClient.listKycApplications();
      const accountType = TAB_FILTERS[activeTab];
      const filtered = rows.filter((row) => {
        if (accountType && row.accountType !== accountType) return false;
        if (activeTab === 'kyc-requests') return ['PENDING', 'UNDER_REVIEW'].includes(row.status);
        return true;
      });
      setApplications(filtered);
      if (selected && !filtered.some((row) => row.id === selected.id)) setSelected(null);
      if (activeTab === 'kyc-reports') setExpiryDocuments(await apiClient.expiringKycDocuments(45));
      else setExpiryDocuments([]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'KYC queue could not be loaded.');
    }
  };

  useEffect(() => { void loadQueue(); }, [activeTab]);

  const selectApplication = async (applicationId: string) => {
    setBusy(true);
    setError('');
    try {
      const [application, audit] = await Promise.all([
        apiClient.adminKycApplication(applicationId),
        apiClient.kycAuditEvents(applicationId),
      ]);
      setSelected(application);
      setAuditEvents(audit);
      setApplicationReason('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Application details could not be loaded.');
    } finally {
      setBusy(false);
    }
  };

  const reviewDocument = async (document: KycDocument, action: 'VERIFIED' | 'REQUEST_REUPLOAD') => {
    const reason = (documentReasons[document.id] || '').trim();
    if (action === 'REQUEST_REUPLOAD' && !reason) {
      setError('Enter a reason before requesting a replacement document.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await apiClient.reviewKycDocument(document.id, action, reason);
      await selectApplication(selected!.id);
      await loadQueue();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Document review could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const reviewApplication = async (action: 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED') => {
    if (!selected) return;
    if (action === 'REJECTED' && !applicationReason.trim()) {
      setError('Add a reason before recording this decision.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const updated = await apiClient.reviewKycApplication(selected.id, action, applicationReason.trim() || undefined);
      setSelected(updated);
      await loadQueue();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Application review could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const title = activeTab === 'kyc-reports'
    ? 'Document renewal report'
    : activeTab === 'kyc-history'
      ? 'Verification history'
      : activeTab === 'kyc-documents'
        ? 'KYC documents'
        : activeTab === 'kyc-vehicles'
          ? 'Transporter vehicles'
          : activeTab === 'kyc-requests'
            ? 'KYC requests'
            : `${ACCOUNT_LABELS[TAB_FILTERS[activeTab] || 'BUYER_BUSINESS']} verification`;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-800"><ShieldCheck className="h-4 w-4" /> Identity & business compliance</div>
          <h2 className="mt-2 text-xl font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">Review role-specific information and documents. Uploads alone never approve an account.</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">{applications.length} applications</div>
      </header>

      {error && <p role="alert" className="border-l-2 border-red-600 pl-3 text-sm text-red-800">{error}</p>}

      {activeTab === 'kyc-reports' && <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h3 className="font-semibold text-amber-950">Documents needing renewal or approaching renewal within 45 days</h3>
        {expiryDocuments.length ? <div className="mt-3 divide-y divide-amber-200">{expiryDocuments.map((document) => <p key={document.id} className="py-2 text-xs text-amber-950">{document.documentType} · {document.originalFilename} · {formatVerificationStatus(document.status)} · {dateLabel(document.expiresAt)}</p>)}</div> : <p className="mt-2 text-sm text-amber-900">No document renewals are due.</p>}
      </section>}

      <div className="grid gap-5 xl:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.4fr)]">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="grid grid-cols-[1.1fr_0.8fr_0.7fr] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase text-slate-500">
            <span>Applicant</span><span>Role / submitted</span><span>Status</span>
          </div>
          {applications.map((application) => <button
            type="button"
            key={application.id}
            onClick={() => void selectApplication(application.id)}
            className={`grid w-full grid-cols-[1.1fr_0.8fr_0.7fr] gap-2 border-b border-slate-100 px-3 py-3 text-left transition hover:bg-emerald-50 ${selected?.id === application.id ? 'bg-emerald-50' : 'bg-white'}`}
          >
            <span className="min-w-0"><strong className="block truncate text-xs text-slate-900">{application.applicantName}</strong><small className="block truncate text-[10px] text-slate-500">{application.applicantEmail}</small></span>
            <span className="text-[10px] text-slate-600">{ACCOUNT_LABELS[application.accountType]}<small className="mt-1 block">{dateLabel(application.submittedAt)}</small></span>
            <span className="text-[10px] font-semibold text-amber-800">{formatVerificationStatus(application.status)}</span>
          </button>)}
          {!applications.length && <p className="px-4 py-8 text-center text-sm text-slate-500">No KYC applications in this view.</p>}
        </section>

        <section className="min-h-96 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
          {busy && <p className="mb-3 text-xs text-slate-500">Saving review…</p>}
          {!selected ? <div className="flex h-full min-h-72 flex-col items-center justify-center text-center text-slate-500"><FileText className="h-8 w-8" /><p className="mt-2 text-sm">Select a KYC request to review.</p></div> : <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
              <div><h3 className="text-base font-bold text-slate-900">{profileText(selected.profile, ['fullName', 'businessName', 'ownerName'], 'Applicant')}</h3><p className="mt-1 text-xs text-slate-500">{selected.applicationNumber} · {ACCOUNT_LABELS[selected.accountType]} · {formatVerificationStatus(selected.status)}</p><p className="mt-1 text-xs text-slate-500">Email: {profileText(selected.profile, ['email'], 'Account email')} · Mobile: {profileText(selected.profile, ['mobileNumber'], 'Account mobile')}</p></div>
              <span className="text-xs text-slate-500">Profile {selected.completionPercent}%</span>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500">Applicant details (restricted)</h4>
              <dl className="mt-2 grid gap-2 sm:grid-cols-2">{Object.entries(selected.profile).map(([key, value]) => <div key={key} className="min-w-0 border-b border-slate-100 py-1"><dt className="text-[10px] text-slate-500">{labelFor(key)}</dt><dd className="break-words text-xs text-slate-900">{Array.isArray(value) ? value.join(', ') : typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '—')}</dd></div>)}</dl>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500">Documents</h4>
              <div className="mt-2 divide-y divide-slate-200 border-y border-slate-200">
                {selected.documents.map((document) => <article key={document.id} className="space-y-2 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs font-semibold text-slate-900">{labelFor(document.documentType)} · {formatVerificationStatus(document.status)}</p><p className="mt-0.5 text-[10px] text-slate-500">{document.originalFilename} · {(document.sizeBytes / 1024).toFixed(0)} KB{document.expiresAt ? ` · Renewal date ${dateLabel(document.expiresAt)}` : ''}</p>{document.reviewReason && <p className="mt-1 text-xs text-red-700">{document.reviewReason}</p>}</div><a href={`/api/v1/kyc/documents/${document.id}/file`} target="_blank" rel="noreferrer" className="rounded border border-slate-300 px-2.5 py-1.5 text-[11px] font-semibold text-blue-800 hover:bg-blue-50">View document</a></div>
                  <div className="flex flex-wrap items-center gap-2"><input aria-label={`Reason for ${document.documentType}`} value={documentReasons[document.id] || ''} onChange={(event) => setDocumentReasons((current) => ({ ...current, [document.id]: event.target.value }))} placeholder="Reason required for re-upload" className="min-w-48 flex-1 rounded border border-slate-300 px-2 py-1.5 text-xs" /><button disabled={busy || document.status === 'VERIFIED'} onClick={() => void reviewDocument(document, 'VERIFIED')} className="rounded bg-emerald-700 px-2.5 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50">Approve</button><button disabled={busy} onClick={() => void reviewDocument(document, 'REQUEST_REUPLOAD')} className="rounded border border-red-300 px-2.5 py-1.5 text-[11px] font-semibold text-red-800 disabled:opacity-50">Request re-upload</button></div>
                </article>)}
                {!selected.documents.length && <p className="py-5 text-sm text-slate-500">No documents uploaded.</p>}
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-4">
              <h4 className="text-xs font-bold uppercase text-slate-500">Application decision</h4>
              <textarea value={applicationReason} onChange={(event) => setApplicationReason(event.target.value)} rows={2} placeholder="Reason required for this decision" className="w-full rounded border border-slate-300 px-3 py-2 text-xs" />
              <div className="flex flex-wrap gap-2"><button disabled={busy} onClick={() => void reviewApplication('UNDER_REVIEW')} className="rounded border border-blue-300 px-3 py-2 text-xs font-semibold text-blue-800 disabled:opacity-50">Mark under review</button><button disabled={busy} onClick={() => void reviewApplication('REJECTED')} className="rounded border border-red-300 px-3 py-2 text-xs font-semibold text-red-800 disabled:opacity-50">Mark not approved</button><button disabled={busy || selected.status === 'VERIFIED'} onClick={() => void reviewApplication('APPROVED')} className="inline-flex items-center gap-1.5 rounded bg-emerald-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><BadgeCheck className="h-4 w-4" />Approve verified documents</button></div>
            </div>

            <details className="border-t border-slate-200 pt-3"><summary className="cursor-pointer text-xs font-semibold text-slate-700">Verification history</summary><div className="mt-2 space-y-2">{auditEvents.map((event, index) => <p key={`${event.createdAt}-${index}`} className="text-[11px] text-slate-600">{new Date(event.createdAt).toLocaleString()} · {event.eventType}{event.detail ? ` · ${event.detail}` : ''}</p>)}</div></details>
          </div>}
        </section>
      </div>
      <p className="text-[11px] text-amber-800">Internal review status only. Government identity, GSTIN, bank and driving-licence checks require separately configured verification providers.</p>
    </div>
  );
};
