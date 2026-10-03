import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, Clock3, ExternalLink, FileText, ShieldCheck, Upload } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiClient, KycAccountType, KycApplication, KycDocument, KycVehicle } from '../../services/apiClient';
import { FarmLocationPicker, FarmLocationValue } from './FarmLocationPicker';

type FieldDefinition = {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'number' | 'textarea' | 'select';
  optional?: boolean;
  options?: string[];
};

type DocumentDefinition = { type: string; label: string; required?: boolean; expiry?: boolean };

const ACCOUNT_LABELS: Record<KycAccountType, string> = {
  FARMER: 'Farmer',
  TRANSPORTER: 'Transporter / Logistics Company',
  DRIVER: 'Driver',
  WHOLESALER: 'Wholesaler',
  RETAILER: 'Retailer',
  FPO: 'FPO / Farmer Organization',
  BUYER_BUSINESS: 'Buyer / Business',
};

const DETAILS: Record<KycAccountType, FieldDefinition[]> = {
  FARMER: [
    { key: 'fullName', label: 'Full name' }, { key: 'dateOfBirth', label: 'Date of birth', type: 'date' },
    { key: 'address', label: 'Address', type: 'textarea' }, { key: 'village', label: 'Village' },
    { key: 'taluka', label: 'Taluka' }, { key: 'district', label: 'District' }, { key: 'state', label: 'State' },
    { key: 'pinCode', label: 'PIN code' }, { key: 'farmLocation', label: 'Farm location', type: 'textarea' },
    { key: 'landArea', label: 'Land area (acres)', type: 'number' },
    { key: 'landTenure', label: 'Land ownership / lease', type: 'select', options: ['Owned', 'Leased', 'Shared'] },
    { key: 'majorCrops', label: 'Major crops', type: 'textarea' },
    { key: 'expectedProduction', label: 'Expected production (kg)' },
    { key: 'availableHarvestPeriod', label: 'Available harvest period' },
    { key: 'preferredMarkets', label: 'Preferred markets', type: 'textarea' },
  ],
  TRANSPORTER: [
    { key: 'businessName', label: 'Company / transporter name' }, { key: 'ownerName', label: 'Owner / authorized person' },
    { key: 'registeredAddress', label: 'Registered address', type: 'textarea' },
    { key: 'operatingLocations', label: 'Operating locations', type: 'textarea' },
    { key: 'yearsInBusiness', label: 'Years in business', type: 'number' },
    { key: 'vehicleCount', label: 'Number of vehicles', type: 'number' },
    { key: 'vehicleTypes', label: 'Vehicle types', type: 'textarea' },
    { key: 'totalCapacity', label: 'Total carrying capacity (kg)', type: 'number' },
    { key: 'temperatureControlledVehicles', label: 'Refrigerated / temperature-controlled vehicles', type: 'number' },
    { key: 'serviceRoutes', label: 'Service routes', type: 'textarea' },
    { key: 'commoditiesHandled', label: 'Agricultural commodities handled', type: 'textarea' },
  ],
  DRIVER: [
    { key: 'fullName', label: 'Full name' }, { key: 'address', label: 'Address', type: 'textarea' },
    { key: 'emergencyContact', label: 'Emergency contact number', type: 'tel' as FieldDefinition['type'] },
    { key: 'transporterName', label: 'Transporter / logistics company' },
    { key: 'drivingLicenceNumber', label: 'Driving licence number' },
    { key: 'licenceType', label: 'Licence type / vehicle class' },
    { key: 'licenceExpiresAt', label: 'Licence expiry date', type: 'date' },
  ],
  WHOLESALER: [
    { key: 'businessName', label: 'Business name' }, { key: 'ownerName', label: 'Owner name' },
    { key: 'businessAddress', label: 'Business address', type: 'textarea' },
    { key: 'warehouseAddress', label: 'Warehouse address', type: 'textarea' },
    { key: 'operatingMarkets', label: 'Operating markets', type: 'textarea' },
    { key: 'commoditiesHandled', label: 'Commodities handled', type: 'textarea' },
    { key: 'storageCapacity', label: 'Storage capacity (kg)', type: 'number' },
    { key: 'coldStorageAvailable', label: 'Cold storage available', type: 'select', options: ['Yes', 'No'] },
    { key: 'loadingFacilities', label: 'Loading / unloading facilities', type: 'textarea', optional: true },
  ],
  RETAILER: [
    { key: 'businessName', label: 'Shop / business name' }, { key: 'ownerName', label: 'Owner name' },
    { key: 'shopAddress', label: 'Shop address', type: 'textarea' },
    { key: 'deliveryAddress', label: 'Delivery address', type: 'textarea' },
    { key: 'operatingArea', label: 'Operating area' },
    { key: 'productCategories', label: 'Product categories', type: 'textarea' },
    { key: 'weeklyDemand', label: 'Approximate weekly demand (kg)', type: 'number' },
    { key: 'preferredSuppliers', label: 'Preferred suppliers', type: 'textarea', optional: true },
    { key: 'deliveryRequirements', label: 'Delivery requirements', type: 'textarea' },
  ],
  FPO: [
    { key: 'businessName', label: 'FPO / organization name' }, { key: 'registrationNumber', label: 'Registration number' },
    { key: 'authorizedPerson', label: 'Authorized person' },
    { key: 'registeredAddress', label: 'Registered address', type: 'textarea' },
    { key: 'farmerCount', label: 'Number of farmers', type: 'number' },
    { key: 'mainCrops', label: 'Main crops', type: 'textarea' },
    { key: 'productionCapacity', label: 'Production capacity (kg)', type: 'number' },
  ],
  BUYER_BUSINESS: [
    { key: 'businessName', label: 'Business name' }, { key: 'ownerName', label: 'Owner / authorized person' },
    { key: 'businessAddress', label: 'Registered address', type: 'textarea' },
    { key: 'operatingMarkets', label: 'Operating markets', type: 'textarea' },
    { key: 'commoditiesHandled', label: 'Commodities handled', type: 'textarea' },
  ],
};

const KYC_FIELDS: Record<KycAccountType, FieldDefinition[]> = {
  FARMER: [
    { key: 'aadhaarLastFour', label: 'Aadhaar last four digits', optional: true },
    { key: 'panNumber', label: 'PAN (if applicable)', optional: true },
    { key: 'farmerRegistrationNumber', label: 'Farmer / FPO registration number', optional: true },
    { key: 'bankAccountHolder', label: 'Bank account holder name' },
    { key: 'bankAccountNumber', label: 'Bank account number' }, { key: 'ifscCode', label: 'IFSC code' },
  ],
  TRANSPORTER: [
    { key: 'gstNumber', label: 'GSTIN (if applicable)', optional: true }, { key: 'panNumber', label: 'PAN' },
    { key: 'bankAccountHolder', label: 'Bank account holder name' },
    { key: 'bankAccountNumber', label: 'Bank account number' }, { key: 'ifscCode', label: 'IFSC code' },
    { key: 'authorizedSignatory', label: 'Authorized signatory name' },
  ],
  DRIVER: [
    { key: 'aadhaarLastFour', label: 'Aadhaar last four digits', optional: true },
    { key: 'panNumber', label: 'PAN (if applicable)', optional: true },
  ],
  WHOLESALER: [
    { key: 'gstNumber', label: 'GSTIN (if applicable)', optional: true }, { key: 'panNumber', label: 'PAN' },
    { key: 'bankAccountHolder', label: 'Bank account holder name' },
    { key: 'bankAccountNumber', label: 'Bank account number' }, { key: 'ifscCode', label: 'IFSC code' },
  ],
  RETAILER: [
    { key: 'gstNumber', label: 'GSTIN (if applicable)', optional: true }, { key: 'panNumber', label: 'PAN (if applicable)', optional: true },
    { key: 'identityName', label: 'Name on identity document' },
    { key: 'bankAccountHolder', label: 'Bank account holder name' },
    { key: 'bankAccountNumber', label: 'Bank account number' }, { key: 'ifscCode', label: 'IFSC code' },
  ],
  FPO: [
    { key: 'panNumber', label: 'Organization PAN' }, { key: 'gstNumber', label: 'GSTIN (if applicable)', optional: true },
    { key: 'bankAccountHolder', label: 'Organization bank account holder' },
    { key: 'bankAccountNumber', label: 'Bank account number' }, { key: 'ifscCode', label: 'IFSC code' },
    { key: 'authorizedSignatory', label: 'Authorized signatory' },
  ],
  BUYER_BUSINESS: [
    { key: 'gstNumber', label: 'GSTIN (if applicable)', optional: true }, { key: 'panNumber', label: 'PAN (if applicable)', optional: true },
    { key: 'bankAccountHolder', label: 'Bank account holder name' },
    { key: 'bankAccountNumber', label: 'Bank account number' }, { key: 'ifscCode', label: 'IFSC code' },
  ],
};

const DOCUMENTS: Record<KycAccountType, DocumentDefinition[]> = {
  FARMER: [
    { type: 'IDENTITY', label: 'Identity document (Aadhaar or accepted ID)', required: true },
    { type: 'BANK_PROOF', label: 'Passbook / cancelled cheque', required: true },
    { type: 'PAN', label: 'PAN card', expiry: false },
    { type: 'ORGANIZATION_REGISTRATION', label: 'Farmer / FPO registration', expiry: false },
  ],
  TRANSPORTER: [
    { type: 'BUSINESS_REGISTRATION', label: 'Business registration certificate', required: true },
    { type: 'BANK_PROOF', label: 'Cancelled cheque / bank proof', required: true },
    { type: 'AUTHORIZED_SIGNATORY_ID', label: 'Authorized signatory ID', required: true },
    { type: 'GST_CERTIFICATE', label: 'GST certificate' },
    { type: 'PAN', label: 'Company PAN' },
  ],
  DRIVER: [
    { type: 'IDENTITY', label: 'Identity document', required: true },
    { type: 'DRIVING_LICENCE', label: 'Driving licence', required: true, expiry: true },
    { type: 'ADDRESS_PROOF', label: 'Address proof', required: true },
    { type: 'PROFILE_PHOTO', label: 'Profile photo' },
  ],
  WHOLESALER: [
    { type: 'BUSINESS_REGISTRATION', label: 'Business registration / applicable proof', required: true },
    { type: 'BANK_PROOF', label: 'Cancelled cheque / bank proof', required: true },
    { type: 'AUTHORIZED_SIGNATORY_ID', label: 'Authorized person ID', required: true },
    { type: 'GST_CERTIFICATE', label: 'GST certificate' }, { type: 'PAN', label: 'PAN card' },
  ],
  RETAILER: [
    { type: 'IDENTITY', label: 'Owner identity document', required: true },
    { type: 'BUSINESS_REGISTRATION', label: 'Business registration / applicable proof', required: true },
    { type: 'BANK_PROOF', label: 'Cancelled cheque / bank proof' },
    { type: 'GST_CERTIFICATE', label: 'GST certificate' }, { type: 'PAN', label: 'PAN card' },
  ],
  FPO: [
    { type: 'ORGANIZATION_REGISTRATION', label: 'FPO registration certificate', required: true },
    { type: 'BANK_PROOF', label: 'Organization bank proof', required: true },
    { type: 'AUTHORIZED_SIGNATORY_ID', label: 'Authorized signatory documents', required: true },
    { type: 'GST_CERTIFICATE', label: 'GST certificate' }, { type: 'PAN', label: 'Organization PAN' },
  ],
  BUYER_BUSINESS: [
    { type: 'BUSINESS_REGISTRATION', label: 'Business registration / applicable proof', required: true },
    { type: 'BANK_PROOF', label: 'Cancelled cheque / bank proof', required: true },
    { type: 'AUTHORIZED_SIGNATORY_ID', label: 'Authorized person ID', required: true },
    { type: 'GST_CERTIFICATE', label: 'GST certificate' }, { type: 'PAN', label: 'PAN card' },
  ],
};

const STEP_LABELS = ['Account', 'Details', 'KYC', 'Documents', 'Review', 'Submit'];
const VEHICLE_DOCUMENTS = [
  { type: 'VEHICLE_RC', label: 'Registration certificate', expiry: false },
  { type: 'VEHICLE_INSURANCE', label: 'Insurance', expiry: true },
  { type: 'VEHICLE_FITNESS', label: 'Fitness certificate', expiry: true },
  { type: 'VEHICLE_PERMIT', label: 'Permit', expiry: true },
  { type: 'VEHICLE_POLLUTION', label: 'Pollution certificate', expiry: true },
];
const statusLabels: Record<string, string> = {
  NOT_STARTED: 'Not started', DRAFT: 'Draft', PENDING: 'Pending verification',
  UNDER_REVIEW: 'Under review', VERIFIED: 'Verified', REJECTED: 'Re-upload required',
};

function initials(value: unknown): string {
  return String(value ?? '').replace(/[^0-9]/g, '').slice(-4);
}

function maskAccount(value: unknown): string {
  const digits = String(value ?? '').replace(/\s/g, '');
  return digits.length > 4 ? `•••• ${digits.slice(-4)}` : digits;
}

function missingRequiredFields(fields: FieldDefinition[], profile: Record<string, unknown>): string[] {
  return fields
    .filter((field) => {
      if (field.optional) return false;
      const value = profile[field.key];
      if (field.key === 'farmLocation') {
        if (typeof value !== 'object' || value === null) return true;
        const location = value as Partial<FarmLocationValue>;
        return typeof location.lat !== 'number' || typeof location.lng !== 'number';
      }
      return !String(value ?? '').trim();
    })
    .map((field) => field.label);
}

function inputClass(): string {
  return 'mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100';
}

export const KycOnboardingWizard: React.FC = () => {
  const { currentUser, refreshCurrentUser, setActiveTab } = useApp();
  const accountType = (currentUser?.accountType || (currentUser?.role === 'DRIVER' ? 'DRIVER' : currentUser?.role === 'FARMER' ? 'FARMER' : 'BUYER_BUSINESS')) as KycAccountType;
  const [application, setApplication] = useState<KycApplication | null>(null);
  const [profile, setProfile] = useState<Record<string, unknown>>({});
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [vehicles, setVehicles] = useState<KycVehicle[]>([]);
  const [vehicleDraft, setVehicleDraft] = useState<Record<string, unknown>>({ refrigerated: false, availability: 'Available' });
  const [vehicleError, setVehicleError] = useState('');

  useEffect(() => {
    let active = true;
    apiClient.myKyc()
      .then((saved) => {
        if (!active) return;
        setApplication(saved);
        if (saved) setProfile(saved.profile);
        if (saved && ['PENDING', 'UNDER_REVIEW', 'VERIFIED'].includes(saved.status)) setStep(6);
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Could not load your KYC application.'))
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (accountType !== 'TRANSPORTER' || currentUser?.kycStatus !== 'VERIFIED') return;
    apiClient.vehicles().then(setVehicles).catch((requestError) => {
      setVehicleError(requestError instanceof Error ? requestError.message : 'Could not load vehicles.');
    });
    apiClient.myKyc().then((saved) => { if (saved) setApplication(saved); }).catch(() => undefined);
  }, [accountType, currentUser?.kycStatus]);

  const documents = useMemo(() => DOCUMENTS[accountType], [accountType]);
  const requiredDocuments = documents.filter((document) => document.required);
  const latestDocument = (documentType: string): KycDocument | undefined =>
    application?.documents.find((document) => document.documentType === documentType);

  const setField = (key: string, value: unknown) => {
    setError('');
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const saveProfile = async () => {
    setError('');
    setIsSaving(true);
    try {
      const saved = await apiClient.saveKycProfile(accountType, profile);
      setApplication(saved);
      setProfile(saved.profile);
      return true;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not save your application.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const continueStep = async () => {
    setError('');
    if (step === 2 || step === 3) {
      const requiredFields = step === 2 ? DETAILS[accountType] : KYC_FIELDS[accountType];
      const missingFields = missingRequiredFields(requiredFields, profile);
      if (missingFields.length > 0) {
        setError(`Complete these required fields to continue: ${missingFields.join(', ')}`);
        return;
      }
      if (!(await saveProfile())) return;
    }
    if (step === 4) {
      const missing = requiredDocuments.filter((document) => {
        const uploaded = latestDocument(document.type);
        return !uploaded || !['UPLOADED', 'UNDER_REVIEW', 'VERIFIED'].includes(uploaded.status);
      });
      if (missing.length) {
        setError(`Upload the required documents: ${missing.map((document) => document.label).join(', ')}`);
        return;
      }
    }
    setStep((current) => Math.min(5, current + 1));
  };

  const uploadDocument = async (documentType: string, file?: File, expiry?: string) => {
    if (!file) return;
    setError('');
    setUploadProgress((current) => ({ ...current, [documentType]: 1 }));
    try {
      const uploaded = await apiClient.uploadKycDocument(documentType, file, expiry, (percent) => {
        setUploadProgress((current) => ({ ...current, [documentType]: percent }));
      });
      setApplication((current) => current ? {
        ...current,
        documents: [uploaded, ...current.documents.filter((item) => item.id !== uploaded.id)],
      } : current);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Document upload failed.');
      setUploadProgress((current) => ({ ...current, [documentType]: 0 }));
    }
  };

  const submitApplication = async () => {
    setError('');
    setIsSaving(true);
    try {
      const saved = await apiClient.submitKyc();
      setApplication(saved);
      await refreshCurrentUser();
      setStep(6);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not submit your KYC application.');
    } finally {
      setIsSaving(false);
    }
  };

  const saveVehicle = async () => {
    setVehicleError('');
    try {
      const saved = await apiClient.addVehicle(vehicleDraft);
      setVehicles((current) => [saved, ...current]);
      setVehicleDraft({ refrigerated: false, availability: 'Available' });
    } catch (requestError) {
      setVehicleError(requestError instanceof Error ? requestError.message : 'Vehicle could not be added.');
    }
  };

  const uploadVehicleDocument = async (vehicleId: string, documentType: string, file?: File, expiresAt?: string) => {
    if (!file) return;
    const progressKey = `${vehicleId}:${documentType}`;
    setVehicleError('');
    try {
      const document = await apiClient.uploadKycDocument(documentType, file, expiresAt, (percent) => {
        setUploadProgress((current) => ({ ...current, [progressKey]: percent }));
      }, vehicleId);
      setApplication((current) => current ? { ...current, documents: [document, ...current.documents] } : current);
      const savedVehicles = await apiClient.vehicles();
      setVehicles(savedVehicles);
    } catch (requestError) {
      setVehicleError(requestError instanceof Error ? requestError.message : 'Vehicle document upload failed.');
      setUploadProgress((current) => ({ ...current, [progressKey]: 0 }));
    }
  };

  if (isLoading) return <div className="mx-auto max-w-4xl py-16 text-center text-sm text-slate-500">Loading your verification application…</div>;

  if (application?.status === 'VERIFIED') {
    return (
      <section className="mx-auto max-w-4xl space-y-5 rounded-xl border border-emerald-200 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3 text-emerald-800"><BadgeCheck className="h-7 w-7" /><h2 className="text-xl font-bold">Verified {ACCOUNT_LABELS[accountType]}</h2></div><button onClick={() => setActiveTab('dashboard')} className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">Continue to dashboard</button></div>
        <p className="text-sm text-slate-600">Your Agrilogix profile has passed internal verification. This is not a government-issued verification or Aadhaar authentication.</p>
        {accountType === 'TRANSPORTER' && <div className="space-y-4 border-t border-slate-200 pt-5">
          <div><h3 className="text-base font-bold text-slate-900">Transport vehicles</h3><p className="mt-1 text-xs text-slate-500">Vehicle records and certificates are private to your organization and authorized reviewers.</p></div>
          {vehicleError && <p role="alert" className="text-sm text-red-700">{vehicleError}</p>}
          <div className="grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
            {[
              ['vehicleNumber', 'Vehicle number'], ['vehicleType', 'Vehicle type'], ['model', 'Vehicle model'],
              ['manufacturingYear', 'Manufacturing year'], ['loadCapacity', 'Load capacity (kg)'],
              ['fuelType', 'Fuel type'], ['gpsDeviceId', 'GPS device ID'],
            ].map(([key, label]) => <label key={key} className="text-xs font-semibold text-slate-700">{label}<input value={String(vehicleDraft[key] ?? '')} onChange={(event) => setVehicleDraft((current) => ({ ...current, [key]: event.target.value }))} className={inputClass()} /></label>)}
            <label className="flex items-center gap-2 self-end rounded-lg border border-slate-200 bg-white px-3 py-3 text-xs font-semibold text-slate-700"><input type="checkbox" checked={Boolean(vehicleDraft.refrigerated)} onChange={(event) => setVehicleDraft((current) => ({ ...current, refrigerated: event.target.checked }))} />Refrigerated / temperature controlled</label>
            <label className="text-xs font-semibold text-slate-700">Availability<select value={String(vehicleDraft.availability ?? 'Available')} onChange={(event) => setVehicleDraft((current) => ({ ...current, availability: event.target.value }))} className={inputClass()}><option>Available</option><option>Assigned</option><option>Maintenance</option></select></label>
            <button type="button" onClick={() => void saveVehicle()} className="self-end rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">Add vehicle</button>
          </div>
          <div className="space-y-3">{vehicles.map((vehicle) => <article key={vehicle.id} className="rounded-lg border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><div><h4 className="text-sm font-bold text-slate-900">{String(vehicle.details.vehicleNumber || 'Vehicle')}</h4><p className="mt-1 text-xs text-slate-500">{String(vehicle.details.vehicleType || '')} · {String(vehicle.details.model || '')} · {String(vehicle.details.loadCapacity || '')} kg</p></div><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-900">{vehicle.status.replace(/_/g, ' ')}</span></div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">{VEHICLE_DOCUMENTS.map((document) => {
              const savedDocument = application.documents.find((item) => item.vehicleId === vehicle.id && item.documentType === document.type);
              const progressKey = `${vehicle.id}:${document.type}`;
              return <div key={document.type} className="rounded-md bg-slate-50 p-2.5">
                <p className="text-[11px] font-semibold text-slate-700">{document.label}: {savedDocument?.status.replace(/_/g, ' ') || 'Not uploaded'}</p>
                {savedDocument?.expiresAt && <p className="mt-0.5 text-[10px] text-slate-500">Expires {new Date(savedDocument.expiresAt).toLocaleDateString()}</p>}
                {document.expiry && <input aria-label={`${document.label} expiry`} type="date" className="mt-1 rounded border border-slate-300 bg-white px-2 py-1 text-[10px]" onChange={(event) => setProfile((current) => ({ ...current, [`${vehicle.id}:${document.type}:expiry`]: event.target.value }))} />}
                {(!savedDocument || ['REJECTED', 'EXPIRED'].includes(savedDocument.status)) && <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-[10px] font-semibold text-blue-800"><Upload className="h-3.5 w-3.5" />Upload / replace<input type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(event) => void uploadVehicleDocument(vehicle.id, document.type, event.target.files?.[0], String(profile[`${vehicle.id}:${document.type}:expiry`] || ''))} /></label>}
                {uploadProgress[progressKey] > 0 && uploadProgress[progressKey] < 100 && <div className="mt-2 h-1 overflow-hidden rounded bg-slate-200"><div className="h-full bg-emerald-600" style={{ width: `${uploadProgress[progressKey]}%` }} /></div>}
              </div>;
            })}</div>
          </article>)}</div>
        </div>}
      </section>
    );
  }

  if (application && ['PENDING', 'UNDER_REVIEW'].includes(application.status)) {
    return (
      <section className="mx-auto max-w-3xl rounded-xl border border-amber-200 bg-white p-6 sm:p-8">
        <div className="flex items-center gap-3 text-amber-800"><Clock3 className="h-7 w-7" /><div><h2 className="text-xl font-bold">Verification submitted</h2><p className="mt-1 text-sm">Your application is awaiting an authorized Agrilogix review.</p></div></div>
        <dl className="mt-6 grid gap-4 border-y border-slate-200 py-4 sm:grid-cols-2">
          <div><dt className="text-xs text-slate-500">Application ID</dt><dd className="mt-1 font-mono text-sm font-semibold text-slate-900">{application.applicationNumber}</dd></div>
          <div><dt className="text-xs text-slate-500">Status</dt><dd className="mt-1 text-sm font-semibold text-amber-800">{statusLabels[application.status]}</dd></div>
          <div><dt className="text-xs text-slate-500">Submitted</dt><dd className="mt-1 text-sm text-slate-800">{application.submittedAt ? new Date(application.submittedAt).toLocaleString() : 'Submitted'}</dd></div>
          <div><dt className="text-xs text-slate-500">Profile completion</dt><dd className="mt-1 text-sm text-slate-800">{application.completionPercent}%</dd></div>
        </dl>
        <p className="mt-4 text-xs text-slate-500">Sensitive details and files are restricted to your account and authorized reviewers. You may browse while under review, but verified actions remain restricted.</p>
        <button onClick={() => setActiveTab('dashboard')} className="mt-6 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">View dashboard</button>
      </section>
    );
  }

  if (step === 6 && application) {
    return (
      <section className="mx-auto max-w-3xl rounded-xl border border-emerald-200 bg-white p-6 sm:p-8">
        <div className="flex items-center gap-3 text-emerald-800"><CheckCircle2 className="h-7 w-7" /><h2 className="text-xl font-bold">Verification submitted</h2></div>
        <p className="mt-2 text-sm text-slate-600">Your Agrilogix KYC application has been submitted successfully. You will be notified when verification is completed.</p>
        <div className="mt-6 grid gap-4 border-y border-slate-200 py-4 sm:grid-cols-2">
          <div><p className="text-xs text-slate-500">Application ID</p><p className="mt-1 font-mono text-sm font-bold">{application.applicationNumber}</p></div>
          <div><p className="text-xs text-slate-500">Status</p><p className="mt-1 text-sm font-bold text-amber-800">{statusLabels[application.status] || 'Pending verification'}</p></div>
        </div>
        <button onClick={() => setActiveTab('dashboard')} className="mt-6 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">View application status</button>
      </section>
    );
  }

  const fieldInput = (field: FieldDefinition) => {
    const value = profile[field.key];
    if (field.key === 'farmLocation') {
      return <FarmLocationPicker key={field.key} value={value} onChange={(location) => setField(field.key, location)} />;
    }
    const common = {
      id: `kyc-${field.key}`,
      required: !field.optional,
      value: value === undefined || value === null ? '' : String(value),
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setField(field.key, event.target.value),
      className: inputClass(),
    };
    return (
      <label key={field.key} htmlFor={common.id} className="block text-xs font-semibold text-slate-700">
        {field.label}{field.optional ? <span className="ml-1 font-normal text-slate-400">Optional</span> : null}
        {field.type === 'textarea' ? <textarea {...common} rows={2} /> : field.type === 'select' ? <select {...common}>{field.options?.map((option) => <option key={option}>{option}</option>)}</select> : <input {...common} type={field.type || 'text'} min={field.type === 'number' ? 0 : undefined} />}
      </label>
    );
  };

  return (
    <section className="mx-auto max-w-5xl space-y-5">
      <header className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-800"><ShieldCheck className="h-4 w-4" /> Secure onboarding</div>
        <h2 className="mt-2 text-xl font-bold text-slate-900">Verify your {ACCOUNT_LABELS[accountType]} account</h2>
        <p className="mt-1 text-sm text-slate-600">Complete the steps to submit a private verification application. Uploading documents does not mark your account verified.</p>
      </header>

      <ol aria-label="Onboarding progress" className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {STEP_LABELS.map((label, index) => {
          const stepNumber = index + 1;
          return <li key={label} className={`border-t-2 pt-2 text-[11px] font-semibold ${stepNumber <= step ? 'border-emerald-600 text-emerald-800' : 'border-slate-200 text-slate-400'}`}><span className="mr-1.5">{stepNumber}</span>{label}</li>;
        })}
      </ol>

      {application?.status === 'REJECTED' && application.reviewNote && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>Re-upload requested: {application.reviewNote}</span></div>
      )}
      {error && <p role="alert" className="border-l-2 border-red-600 pl-3 text-sm text-red-800">{error}</p>}

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        {step === 1 && <div className="space-y-4">
          <div><h3 className="text-base font-bold text-slate-900">Account</h3><p className="mt-1 text-sm text-slate-500">Confirm the account used for this application.</p></div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div><dt className="text-[11px] text-slate-500">Name</dt><dd className="mt-1 text-sm font-semibold">{currentUser?.fullName}</dd></div>
            <div><dt className="text-[11px] text-slate-500">User type</dt><dd className="mt-1 text-sm font-semibold">{ACCOUNT_LABELS[accountType]}</dd></div>
            <div><dt className="text-[11px] text-slate-500">Email</dt><dd className="mt-1 text-sm font-semibold">{currentUser?.email}</dd></div>
            <div><dt className="text-[11px] text-slate-500">Mobile</dt><dd className="mt-1 text-sm font-semibold">{currentUser?.mobileNumber || 'Not provided'}</dd></div>
          </dl>
          <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">Mobile OTP delivery is not configured for this deployment. Mobile verification remains pending until an SMS provider is connected.</p>
        </div>}

        {step === 2 && <div className="space-y-4">
          <div><h3 className="text-base font-bold text-slate-900">Personal / business details</h3><p className="mt-1 text-sm text-slate-500">Only fields required for your selected account type are shown.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">{DETAILS[accountType].map(fieldInput)}</div>
        </div>}

        {step === 3 && <div className="space-y-4">
          <div><h3 className="text-base font-bold text-slate-900">KYC and bank details</h3><p className="mt-1 text-sm text-slate-500">Sensitive values are encrypted before storage and are not shown on public profiles.</p></div>
          {accountType === 'FARMER' || accountType === 'DRIVER' ? <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Do not enter a full Aadhaar number. Only the last four digits are requested; upload the required identity document in the next step.</p> : null}
          <div className="grid gap-4 sm:grid-cols-2">{KYC_FIELDS[accountType].map(fieldInput)}</div>
        </div>}

        {step === 4 && <div className="space-y-4">
          <div><h3 className="text-base font-bold text-slate-900">Documents</h3><p className="mt-1 text-sm text-slate-500">PDF, JPG, and PNG up to 10 MB. Files are encrypted at rest and only available to you and authorized reviewers.</p></div>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {documents.map((document) => {
              const saved = latestDocument(document.type);
              const canReplace = !saved || ['REJECTED', 'EXPIRED'].includes(saved.status);
              return <div key={document.type} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{document.label}{document.required ? <span className="ml-1 text-red-600">*</span> : null}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{saved ? `${saved.originalFilename} · ${saved.status.replace(/_/g, ' ')}` : 'Not uploaded'}{saved?.reviewReason ? ` · ${saved.reviewReason}` : ''}</p>
                  {saved?.expiresAt && <p className="mt-1 text-[11px] text-slate-500">Expires {new Date(saved.expiresAt).toLocaleDateString()}</p>}
                  {saved && <a href={`/api/v1/kyc/documents/${saved.id}/file`} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:underline">View document <ExternalLink className="h-3 w-3" /></a>}
                  {(uploadProgress[document.type] > 0 && uploadProgress[document.type] < 100) && <div className="mt-2 h-1.5 overflow-hidden rounded bg-slate-100"><div className="h-full bg-emerald-600" style={{ width: `${uploadProgress[document.type]}%` }} /></div>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {document.expiry && <input aria-label={`${document.label} expiry date`} type="date" className="rounded-md border border-slate-300 px-2 py-2 text-xs" onChange={(event) => setProfile((current) => ({ ...current, [`${document.type}Expiry`]: event.target.value }))} />}
                  {canReplace && <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Upload className="h-4 w-4" />Upload<input className="sr-only" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(event) => void uploadDocument(document.type, event.target.files?.[0], String(profile[`${document.type}Expiry`] || ''))} /></label>}
                </div>
              </div>;
            })}
          </div>
          <p className="text-xs text-slate-500">Required documents: {requiredDocuments.map((document) => document.label).join(' · ')}</p>
        </div>}

        {step === 5 && <div className="space-y-4">
          <div><h3 className="text-base font-bold text-slate-900">Review before submitting</h3><p className="mt-1 text-sm text-slate-500">Confirm the information and documents are correct. Submission starts an internal admin review.</p></div>
          <div className="grid gap-3 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-2">
            <p><span className="text-slate-500">Applicant:</span> {currentUser?.fullName}</p>
            <p><span className="text-slate-500">User type:</span> {ACCOUNT_LABELS[accountType]}</p>
            <p><span className="text-slate-500">Email:</span> {currentUser?.email}</p>
            <p><span className="text-slate-500">Mobile:</span> {currentUser?.mobileNumber}</p>
            {Boolean(profile.aadhaarLastFour) && <p><span className="text-slate-500">Aadhaar:</span> XXXX XXXX {initials(profile.aadhaarLastFour)}</p>}
            {Boolean(profile.panNumber) && <p><span className="text-slate-500">PAN:</span> XXXXX{String(profile.panNumber).slice(-5)}</p>}
            {Boolean(profile.bankAccountNumber) && <p><span className="text-slate-500">Bank account:</span> {maskAccount(profile.bankAccountNumber)}</p>}
          </div>
          <div className="space-y-2">
            {documents.map((document) => {
              const saved = latestDocument(document.type);
              return <p key={document.type} className="flex items-center gap-2 text-xs text-slate-700"><FileText className="h-4 w-4 text-slate-400" />{document.label}: {saved ? saved.status.replace(/_/g, ' ') : 'Not uploaded'}{document.required && !saved ? ' · required' : ''}</p>;
            })}
          </div>
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Uploading documents does not grant verified status. A reviewer must approve your application. Government identity, GSTIN, banking, and licence checks are not connected unless configured separately.</p>
        </div>}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <button type="button" disabled={step === 1 || isSaving} onClick={() => { setError(''); setStep((current) => Math.max(1, current - 1)); }} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50"><ArrowLeft className="h-4 w-4" />Back</button>
          {step < 5 ? <button type="button" disabled={isSaving} onClick={() => void continueStep()} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">{isSaving ? 'Saving…' : step === 2 || step === 3 ? 'Save and continue' : 'Continue'}<ArrowRight className="h-4 w-4" /></button> : <button type="button" disabled={isSaving} onClick={() => void submitApplication()} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">{isSaving ? 'Submitting…' : 'Submit KYC'}<CheckCircle2 className="h-4 w-4" /></button>}
        </div>
      </div>
    </section>
  );
};
