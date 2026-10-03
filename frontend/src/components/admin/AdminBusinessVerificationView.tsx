import React, { useEffect, useState } from 'react';
import { Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../../services/apiClient';

interface PendingBusiness {
  id: string;
  legalName: string;
  businessType: string;
  gstNumber: string | null;
  address: string;
  contactPhone: string | null;
  createdAt: string;
}

export const AdminBusinessVerificationView: React.FC = () => {
  const [profiles, setProfiles] = useState<PendingBusiness[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<PendingBusiness[]>('/business/profiles/pending')
      .then(setProfiles)
      .catch((requestError: Error) => setError(requestError.message));
  }, []);

  const verify = async (profileId: string) => {
    try {
      await apiRequest(`/business/profiles/${profileId}/verify`, { method: 'POST' });
      setProfiles((current) => current.filter((profile) => profile.id !== profileId));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Business review could not be completed.');
    }
  };

  return (
    <div className="space-y-5">
      <header className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-800"><ShieldCheck className="h-4 w-4" /> Business compliance</div>
        <h2 className="mt-2 text-xl font-bold text-slate-900">Business verification queue</h2>
        <p className="mt-1 text-sm text-slate-600">Review company details before enabling bulk trading or carrier quotations.</p>
      </header>
      {error && <p role="alert" className="border-l-2 border-red-600 pl-3 text-sm text-red-800">{error}</p>}
      {profiles.length ? <div className="divide-y divide-slate-200 border-y border-slate-200">
        {profiles.map((profile) => <article key={profile.id} className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-slate-900"><Building2 className="h-4 w-4 text-slate-500" />{profile.legalName}</h3>
            <p className="mt-1 text-xs text-slate-600">{profile.businessType} · GSTIN {profile.gstNumber || 'not supplied'}</p>
            <p className="mt-1 text-xs text-slate-500">{profile.address}{profile.contactPhone ? ` · ${profile.contactPhone}` : ''}</p>
            <p className="mt-1 text-[11px] text-slate-500">Registered {new Date(profile.createdAt).toLocaleDateString()}</p>
          </div>
          <button onClick={() => void verify(profile.id)} className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800"><CheckCircle2 className="h-4 w-4" /> Mark verified</button>
        </article>)}
      </div> : !error && <p className="border-y border-slate-200 py-8 text-center text-sm text-slate-500">No businesses awaiting review.</p>}
      <p className="text-xs text-amber-800">Marking a profile verified is an internal review status; it does not verify GSTIN with government services.</p>
    </div>
  );
};