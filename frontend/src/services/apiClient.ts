import { UserRole } from '../types';

export type PreferredLanguage = 'en' | 'hi' | 'mr';
export type KycAccountType = 'FARMER' | 'TRANSPORTER' | 'DRIVER' | 'WHOLESALER' | 'RETAILER' | 'FPO' | 'BUYER_BUSINESS';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  role: Extract<UserRole, 'FARMER' | 'DRIVER' | 'BUYER' | 'BUSINESS' | 'ADMIN'>;
  preferredLanguage: PreferredLanguage;
  accountType: KycAccountType | null;
  mobileNumber: string | null;
  mobileVerified: boolean;
  serviceArea: string | null;
  preferredPickupArea: string | null;
  kycStatus: string;
}

export interface ProfileUpdateInput {
  fullName?: string;
  email?: string;
  mobileNumber?: string;
  preferredLanguage?: PreferredLanguage;
  password?: string;
}

export type ProduceScanResult =
  | { status: 'UNSUPPORTED_IMAGE'; isFarmProduce: false }
  | { status: 'IMAGE_QUALITY_INSUFFICIENT' }
  | {
      status: 'ANALYZED';
      isFarmProduce: true;
      produceName: string;
      category: string;
      confidence: number;
      quality: {
        ripeness: string;
        color: string | null;
        colorUniformity: number;
        bruising: string;
        cuts: string;
        cracks: string;
        discoloration: string;
        mold: string;
        rot: string;
        shriveling: string;
        otherVisibleDefects: string[];
      };
      qualityGrade: 'Grade A' | 'Grade B' | 'Grade C' | 'REJECT';
      gradeScore: number;
      freshnessScore: number;
      freshnessReason: string;
      shelfLife: {
        minDays: number;
        maxDays: number;
        confidence: number;
        basis: string;
        aiAssisted: boolean;
      };
      logistics: {
        spoilageRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        recommendationCode: 'SAFE_FOR_ROUTE' | 'EXPEDITE' | 'REROUTE' | 'DO_NOT_SHIP' | 'TRANSIT_ESTIMATE_REQUIRED';
        recommendation: string;
        transitHours: number | null;
      };
    };

export interface KycDocument {
  id: string;
  vehicleId: string | null;
  documentType: string;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  status: 'UPLOADED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
  expiresAt: string | null;
  reviewReason: string | null;
  uploadedAt: string;
}

export interface KycApplication {
  id: string;
  userId: string;
  applicationNumber: string;
  accountType: KycAccountType;
  status: string;
  profile: Record<string, unknown>;
  completionPercent: number;
  submittedAt: string | null;
  reviewNote: string | null;
  documents: KycDocument[];
}

export interface KycApplicationSummary {
  id: string;
  userId: string;
  applicationNumber: string;
  accountType: KycAccountType;
  status: string;
  submittedAt: string | null;
  applicantName: string;
  applicantEmail: string;
  applicantMobile: string | null;
}

export interface KycVehicle {
  id: string;
  details: Record<string, unknown>;
  status: string;
  createdAt: string;
}

export interface KycVehicleAdmin extends KycVehicle {
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
}

export interface VerifiedTransporter {
  id: string;
  companyName: string;
}

export interface CropMarketCategoryRate {
  categoryId: string;
  sourceCategoryId: string;
  crop: string;
  category: string;
  recommendationUse: string;
  activeOfferCount: number;
  availableQuantityKg: number;
  lowPricePerKg: number | null;
  averagePricePerKg: number | null;
  highPricePerKg: number | null;
  rankScore: number | null;
}

export interface BusinessRegistration {
  companyName: string;
  businessType: string;
  businessAddress: string;
  gstNumber?: string;
  contactPhone?: string;
}

export interface ShipmentCreatePayload {
  crop: string;
  variety: string;
  quantityKg: number;
  vehicleType?: string;
  cargoVolumeM3?: number;
  harvestAt: string;
  expectedShelfLifeHours: number;
  qualityGrade: string;
  storageCondition: string;
  origin: string;
  destination: string;
}

export interface ApiShipment {
  id: string;
  trackingNumber: string;
  farmerId: string;
  driverId: string | null;
  buyerId: string | null;
  crop: string;
  variety: string;
  quantityKg: number;
  vehicleType: string | null;
  cargoVolumeM3: number | null;
  harvestAt: string;
  expectedShelfLifeHours: number;
  qualityGrade: string;
  storageCondition: string;
  origin: string;
  destination: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransportRequest {
  id: string;
  requesterId: string;
  shipmentId: string | null;
  pickup: string;
  destination: string;
  quantityKg: number;
  preferredVehicleType: string | null;
  cargoVolumeM3: number | null;
  refrigerated: boolean;
  truckCount: number;
  deliveryAt: string;
  status: string;
  createdAt: string;
}

export interface TransportQuote {
  id: string;
  requestId: string;
  carrierId: string;
  carrierName: string;
  carrierCompany: string;
  vehicleType: string;
  refrigerated: boolean;
  priceInr: number;
  vehicleCount: number;
  estimatedHours: number;
  status: string;
  createdAt: string;
}

export interface AvailableVehicle {
  id: string;
  ownerId: string;
  driverId: string | null;
  vehicleNumber: string;
  vehicleType: string;
  currentLocation: string;
  pickupArea: string;
  destination: string;
  route: string;
  availableCapacity: number;
  totalCapacity: number;
  rateInr: number;
  refrigerated: boolean;
  departureTime: string;
  estimatedArrivalTime: string | null;
  status: 'AVAILABLE' | 'FILLING_FAST' | 'FULL' | 'DEPARTED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface VehicleBooking {
  id: string;
  vehicleId: string;
  requesterId: string;
  shipmentId: string | null;
  requestedCapacityKg: number;
  status: string;
  createdAt: string;
}

export interface VehicleNotification {
  id: string;
  vehicleId: string;
  eventType: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AvailableVehicle {
  id: string;
  ownerId: string;
  driverId: string | null;
  vehicleNumber: string;
  vehicleType: string;
  currentLocation: string;
  pickupArea: string;
  destination: string;
  route: string;
  availableCapacity: number;
  totalCapacity: number;
  rateInr: number;
  refrigerated: boolean;
  departureTime: string;
  estimatedArrivalTime: string | null;
  status: 'AVAILABLE' | 'FILLING_FAST' | 'FULL' | 'DEPARTED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface VehicleBooking {
  id: string;
  vehicleId: string;
  requesterId: string;
  shipmentId: string | null;
  requestedCapacityKg: number;
  status: string;
  createdAt: string;
}

export interface VehicleNotification {
  id: string;
  vehicleId: string;
  eventType: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

function getErrorMessage(value: unknown): string | undefined {
  if (typeof value === 'string') return value.trim() || undefined;
  if (Array.isArray(value)) {
    const messages = value.map(getErrorMessage).filter((message): message is string => Boolean(message));
    return messages.length > 0 ? messages.join('; ') : undefined;
  }
  if (typeof value !== 'object' || value === null) return undefined;

  const errorValue = value as { detail?: unknown; loc?: unknown; message?: unknown; msg?: unknown };
  const message = getErrorMessage(errorValue.detail ?? errorValue.msg ?? errorValue.message);
  if (!message) return undefined;

  if (Array.isArray(errorValue.loc)) {
    const location = errorValue.loc
      .filter((part): part is string | number => typeof part === 'string' || typeof part === 'number')
      .filter((part) => part !== 'body' && part !== 'query' && part !== 'path')
      .join('.');
    if (location) return `${location}: ${message}`;
  }
  return message;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  try {
    response = await fetch(`/api/v1${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('The Agrilogix service is currently unavailable. Please try again in a moment.');
  }

  if (!response.ok) {
    const errorBody: unknown = await response.json().catch(() => null);
    const apiMessage = getErrorMessage(errorBody);

    if (response.status >= 500) {
      throw new Error(apiMessage || 'The Agrilogix service is temporarily unavailable. Please try again later.');
    }

    throw new Error(apiMessage || `Request could not be completed (${response.status})`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const apiClient = {
  analyzeProduce: (
    image: File,
    conditions: {
      transitHours?: number;
      temperatureC?: number;
      humidityPct?: number;
      harvestedHoursAgo?: number;
    },
  ) => {
    const form = new FormData();
    form.set('image', image);
    if (conditions.transitHours !== undefined) form.set('transit_hours', String(conditions.transitHours));
    if (conditions.temperatureC !== undefined) form.set('temperature_c', String(conditions.temperatureC));
    if (conditions.humidityPct !== undefined) form.set('humidity_pct', String(conditions.humidityPct));
    if (conditions.harvestedHoursAgo !== undefined) form.set('harvested_hours_ago', String(conditions.harvestedHoursAgo));
    return apiRequest<ProduceScanResult>('/produce-scanner/analyze', { method: 'POST', body: form });
  },
  cropMasterCrops: () => apiRequest<string[]>('/market-categories/crops'),
  cropMarketCategories: (crop: string, quantityKg?: number) => {
    const query = quantityKg ? `?quantity_kg=${encodeURIComponent(quantityKg)}` : '';
    return apiRequest<CropMarketCategoryRate[]>(`/market-categories/${encodeURIComponent(crop)}/categories${query}`);
  },
  login: (email: string, password: string) =>
    apiRequest<{ user: AuthenticatedUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  loginWithGoogle: (credential: string) =>
    apiRequest<{ user: AuthenticatedUser }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    }),
  register: (input: {
    email: string;
    fullName: string;
    password: string;
    role: AuthenticatedUser['role'];
    accountType: KycAccountType;
    mobileNumber: string;
    village: string;
    district: string;
    state: string;
    preferredLanguage: PreferredLanguage;
  } & Partial<BusinessRegistration>) =>
    apiRequest<AuthenticatedUser>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...input,
        accountType: input.accountType,
        mobileNumber: input.mobileNumber,
        preferredLanguage: input.preferredLanguage,
        businessAddress: input.businessAddress,
        companyName: input.companyName,
        businessType: input.businessType,
        gstNumber: input.gstNumber,
        contactPhone: input.contactPhone,
      }),
    }),
  currentUser: () => apiRequest<AuthenticatedUser | null>('/auth/me'),
  updateProfile: (input: ProfileUpdateInput) =>
    apiRequest<AuthenticatedUser>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        fullName: input.fullName,
        email: input.email,
        mobileNumber: input.mobileNumber,
        preferredLanguage: input.preferredLanguage,
        password: input.password,
      }),
    }),
  updatePreferences: (preferredLanguage: PreferredLanguage) =>
    apiRequest<AuthenticatedUser>('/auth/preferences', {
      method: 'PATCH',
      body: JSON.stringify({ preferredLanguage }),
    }),
  myKyc: () => apiRequest<KycApplication | null>('/kyc/me'),
  saveKycProfile: (accountType: KycAccountType, profile: Record<string, unknown>) =>
    apiRequest<KycApplication>('/kyc/profile', {
      method: 'PUT',
      body: JSON.stringify({ accountType, profile }),
    }),
  uploadKycDocument: (
    documentType: string,
    file: File,
    expiresAt?: string,
    onProgress?: (percent: number) => void,
    vehicleId?: string,
  ) => new Promise<KycDocument>((resolve, reject) => {
    const form = new FormData();
    form.set('document_type', documentType);
    form.set('file', file);
    if (expiresAt) form.set('expires_at', expiresAt);
    if (vehicleId) form.set('vehicle_id', vehicleId);
    const request = new XMLHttpRequest();
    request.open('POST', '/api/v1/kyc/documents');
    request.withCredentials = true;
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    request.onerror = () => reject(new Error('Document upload could not be completed. Check your connection and try again.'));
    request.onload = () => {
      let body: unknown;
      try {
        body = JSON.parse(request.responseText || 'null') as unknown;
      } catch {
        reject(new Error(`Document upload could not be completed (${request.status})`));
        return;
      }
      if (request.status >= 200 && request.status < 300) {
        resolve(body as KycDocument);
      } else {
        reject(new Error(getErrorMessage(body) || `Document upload could not be completed (${request.status})`));
      }
    };
    request.send(form);
  }),
  submitKyc: () => apiRequest<KycApplication>('/kyc/submit', { method: 'POST' }),
  listKycApplications: (statusFilter?: string) =>
    apiRequest<KycApplicationSummary[]>(`/kyc/admin/applications${statusFilter ? `?application_status=${encodeURIComponent(statusFilter)}` : ''}`),
  adminKycApplication: (applicationId: string) =>
    apiRequest<KycApplication>(`/kyc/admin/applications/${applicationId}`),
  reviewKycApplication: (applicationId: string, action: 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED', reason?: string) =>
    apiRequest<KycApplication>(`/kyc/admin/applications/${applicationId}/review`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    }),
  reviewKycDocument: (documentId: string, action: 'VERIFIED' | 'REJECTED' | 'REQUEST_REUPLOAD', reason?: string) =>
    apiRequest<KycDocument>(`/kyc/admin/documents/${documentId}/review`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    }),
  kycAuditEvents: (applicationId: string) =>
    apiRequest<Array<{ eventType: string; detail: string; actorId: string; createdAt: string }>>(`/kyc/admin/audit/${applicationId}`),
  expiringKycDocuments: (withinDays = 30) =>
    apiRequest<KycDocument[]>(`/kyc/admin/expiring-documents?within_days=${withinDays}`),
  addVehicle: (details: Record<string, unknown>) =>
    apiRequest<KycVehicle>('/kyc/vehicles', {
      method: 'POST',
      body: JSON.stringify({ details }),
    }),
  vehicles: () => apiRequest<KycVehicle[]>('/kyc/vehicles'),
  adminVehicles: () => apiRequest<KycVehicleAdmin[]>('/kyc/admin/vehicles'),
  verifiedTransporters: () => apiRequest<VerifiedTransporter[]>('/kyc/admin/transporters'),
  assignDriverToTransporter: (driverId: string, transporterId: string) =>
    apiRequest<{ driverId: string; transporterId: string }>(`/kyc/admin/users/${driverId}/transporter`, {
      method: 'POST',
      body: JSON.stringify({ transporterId }),
    }),
  createTransportRequest: (input: {
    shipmentId: string;
    pickup: string;
    destination: string;
    quantityKg: number;
    preferredVehicleType: string;
    cargoVolumeM3: number;
    refrigerated: boolean;
    truckCount: number;
    deliveryAt: string;
  }) => apiRequest<TransportRequest>('/business/transport-requests', {
    method: 'POST',
    body: JSON.stringify(input),
  }),
  transportRequests: () => apiRequest<TransportRequest[]>('/business/transport-requests'),
  quoteTransportRequest: (requestId: string, input: {
    priceInr: number;
    vehicleCount: number;
    estimatedHours: number;
    vehicleType: string;
    refrigerated: boolean;
  }) => apiRequest<TransportQuote>(`/business/transport-requests/${requestId}/quotes`, {
    method: 'POST',
    body: JSON.stringify(input),
  }),
  transportQuotes: (requestId: string) => apiRequest<TransportQuote[]>(`/business/transport-requests/${requestId}/quotes`),
  acceptTransportQuote: (requestId: string, quoteId: string) =>
    apiRequest<TransportQuote>(`/business/transport-requests/${requestId}/quotes/${quoteId}/accept`, { method: 'POST' }),
  searchVehicleAvailability: (input: { pickupArea: string; destination?: string; requiredCapacityKg?: number; refrigerated?: boolean; vehicleType?: string; departureAfter?: string }) => {
    const query = new URLSearchParams({ pickup_area: input.pickupArea });
    if (input.destination) query.set('destination', input.destination);
    if (input.requiredCapacityKg) query.set('required_capacity_kg', String(input.requiredCapacityKg));
    if (input.refrigerated) query.set('refrigerated', 'true');
    if (input.vehicleType) query.set('vehicle_type', input.vehicleType);
    if (input.departureAfter) query.set('departure_after', input.departureAfter);
    return apiRequest<AvailableVehicle[]>(`/vehicle-availability?${query.toString()}`);
  },
  myVehicleAvailability: () => apiRequest<AvailableVehicle[]>('/vehicle-availability/mine'),
  adminVehicleAvailability: () => apiRequest<AvailableVehicle[]>('/vehicle-availability/admin'),
  createVehicleAvailability: (input: Omit<AvailableVehicle, 'id' | 'ownerId' | 'driverId' | 'status' | 'createdAt' | 'updatedAt'> & { driverId?: string | null }) =>
    apiRequest<AvailableVehicle>('/vehicle-availability', { method: 'POST', body: JSON.stringify(input) }),
  updateVehicleAvailability: (vehicleId: string, input: Partial<Pick<AvailableVehicle, 'currentLocation' | 'pickupArea' | 'destination' | 'route' | 'availableCapacity' | 'departureTime' | 'estimatedArrivalTime'>> & { status?: 'DEPARTED' | 'CANCELLED' }) =>
    apiRequest<AvailableVehicle>(`/vehicle-availability/${vehicleId}`, { method: 'PATCH', body: JSON.stringify(input) }),
  bookVehicle: (vehicleId: string, requestedCapacityKg: number, shipmentId?: string) =>
    apiRequest<VehicleBooking>(`/vehicle-availability/${vehicleId}/book`, {
      method: 'POST',
      body: JSON.stringify({ requestedCapacityKg, shipmentId }),
    }),
  vehicleNotifications: () => apiRequest<VehicleNotification[]>('/vehicle-availability/notifications'),
  markVehicleNotificationRead: (notificationId: string) =>
    apiRequest<VehicleNotification>(`/vehicle-availability/notifications/${notificationId}/read`, { method: 'POST' }),
  logout: () => apiRequest<void>('/auth/logout', { method: 'POST' }),
  createShipment: (payload: ShipmentCreatePayload) => apiRequest<ApiShipment>('/shipments', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
};