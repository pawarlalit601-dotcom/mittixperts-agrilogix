import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  Package,
  Plus,
  Receipt,
  Send,
  ShieldCheck,
  Snowflake,
  Truck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiClient, apiRequest, CropMarketCategoryRate, type AvailableVehicle } from '../../services/apiClient';
import { VEHICLE_CLASSES } from '../../data/vehicleClasses';

type BusinessSection = 'marketplace' | 'orders' | 'transport' | 'company' | 'invoices';

interface BusinessListing {
  id: string;
  sellerId: string;
  crop: string;
  marketCategoryId: string;
  quantityKg: number;
  availableQuantityKg: number;
  minimumOrderKg: number;
  grade: string;
  pricePerKg: number;
  pickupLocation: string;
  status: string;
}

interface TransportRequest {
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
}

interface BusinessOrder {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  quantityKg: number;
  currentOfferPerKg: number;
  status: string;
}

interface BusinessTransaction {
  id: string;
  listingId: string;
  buyerName: string;
  sellerName: string;
  crop: string;
  grade: string;
  pickupLocation: string;
  quantityKg: number;
  pricePerKg: number;
  totalValueInr: number;
  status: string;
  paymentStatus: 'NOT_RECORDED';
  createdAt: string;
  updatedAt: string;
}

interface BusinessProfile {
  legalName: string;
  businessType: string;
  gstNumber: string | null;
  address: string;
  contactPhone: string | null;
}

interface BusinessLocation {
  id: string;
  label: string;
  address: string;
}

const sections: { id: BusinessSection; label: string }[] = [
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'orders', label: 'Orders & Offers' },
  { id: 'transport', label: 'Transport' },
  { id: 'company', label: 'Company' },
  { id: 'invoices', label: 'Invoices' },
];

export const BusinessDashboardView: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const section = sections.find((item) => item.id === activeTab)?.id ?? 'marketplace';
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [orders, setOrders] = useState<BusinessOrder[]>([]);
  const [transactions, setTransactions] = useState<BusinessTransaction[]>([]);
  const [transportRequests, setTransportRequests] = useState<TransportRequest[]>([]);
  const [vehicleAvailability, setVehicleAvailability] = useState<AvailableVehicle[]>([]);
  const [showListingForm, setShowListingForm] = useState(false);
  const [showTransportForm, setShowTransportForm] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [isVehicleLoading, setIsVehicleLoading] = useState(false);
  const [isSavingVehicle, setIsSavingVehicle] = useState(false);
  const [capacityDrafts, setCapacityDrafts] = useState<Record<string, string>>({});
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [businessType, setBusinessType] = useState('Wholesaler');
  const [businessAddress, setBusinessAddress] = useState('');
  const [deliveryLocations, setDeliveryLocations] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState('');
  const [profileNotice, setProfileNotice] = useState('');
  const [apiNotice, setApiNotice] = useState('');
  const [offerPrices, setOfferPrices] = useState<Record<string, string>>({});
  const [masterCrops, setMasterCrops] = useState<string[]>([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [cropCategories, setCropCategories] = useState<CropMarketCategoryRate[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [quoteDrafts, setQuoteDrafts] = useState<Record<string, { vehicleType: string; refrigerated: boolean; priceInr: string; estimatedHours: string; vehicleCount: string }>>({});
  const [submittingQuoteId, setSubmittingQuoteId] = useState('');

  useEffect(() => {
    let isMounted = true;
    const ordersRequest = apiRequest<BusinessOrder[]>('/business/orders').catch(() => []);
    const transactionsRequest = apiRequest<BusinessTransaction[]>('/business/transactions').catch(() => []);
    const transportRequest = apiRequest<TransportRequest[]>('/business/transport-requests').catch(() => []);
    Promise.all([
      apiRequest<BusinessListing[]>('/business/listings'),
      ordersRequest,
      transportRequest,
      apiRequest<BusinessProfile>('/business/profile').catch(() => null),
      apiRequest<BusinessLocation[]>('/business/locations').catch(() => []),
      transactionsRequest,
    ])
      .then(([availableListings, businessOrders, requests, profile, locations, businessTransactions]) => {
        if (!isMounted) return;
        setListings(availableListings);
        setOrders(businessOrders);
        setTransactions(businessTransactions);
        setTransportRequests(requests);
        if (profile) {
          setCompanyName(profile.legalName);
          setBusinessType(profile.businessType);
          setGstNumber(profile.gstNumber ?? '');
          setBusinessAddress(profile.address);
        }
        setDeliveryLocations(locations.map((location) => location.address));
      })
      .catch((error: Error) => {
        if (isMounted) setApiNotice(error.message);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (businessType !== 'Transport Company') return;
    let isMounted = true;
    setIsVehicleLoading(true);
    apiClient.myVehicleAvailability()
      .then((vehicles) => { if (isMounted) setVehicleAvailability(vehicles); })
      .catch((error: Error) => { if (isMounted) setApiNotice(error.message); })
      .finally(() => { if (isMounted) setIsVehicleLoading(false); });
    return () => { isMounted = false; };
  }, [businessType]);

  useEffect(() => {
    apiClient.cropMasterCrops().then(setMasterCrops).catch(() => setMasterCrops([]));
  }, []);

  useEffect(() => {
    let active = true;
    setSelectedCategoryId('');
    if (!selectedCrop) {
      setCropCategories([]);
      return () => { active = false; };
    }
    apiClient.cropMarketCategories(selectedCrop)
      .then((categories) => { if (active) setCropCategories(categories); })
      .catch(() => { if (active) setCropCategories([]); });
    return () => { active = false; };
  }, [selectedCrop]);

  const addListing = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    if (!selectedCategoryId) {
      setApiNotice('Select an eligible market category for this crop before publishing.');
      return;
    }
    try {
      const listing = await apiRequest<BusinessListing>('/business/listings', {
        method: 'POST',
        body: JSON.stringify({
          crop: String(form.get('crop')),
          marketCategoryId: selectedCategoryId,
          quantityKg: Number(form.get('quantity')),
          pricePerKg: Number(form.get('price')),
          pickupLocation: String(form.get('pickup')),
          grade: String(form.get('grade')),
          minimumOrderKg: 1,
        }),
      });
      setListings((current) => [listing, ...current]);
      setApiNotice('Bulk listing published.');
      formElement.reset();
      setShowListingForm(false);
    } catch (error) {
      setApiNotice(error instanceof Error ? error.message : 'Listing could not be published.');
    }
  };

  const placeOrder = async (listing: BusinessListing) => {
    try {
      const order = await apiRequest<BusinessOrder>('/business/orders', {
        method: 'POST',
        body: JSON.stringify({ listingId: listing.id, quantityKg: listing.minimumOrderKg }),
      });
      setOrders((current) => [order, ...current]);
      setActiveTab('orders');
      setApiNotice('Bulk order submitted at the seller asking price.');
    } catch (error) {
      setApiNotice(error instanceof Error ? error.message : 'Order could not be submitted.');
    }
  };

  const submitOffer = async (order: BusinessOrder) => {
    const pricePerKg = Number(offerPrices[order.id]);
    if (!Number.isFinite(pricePerKg) || pricePerKg <= 0) return;
    try {
      await apiRequest(`/business/orders/${order.id}/offers`, {
        method: 'POST',
        body: JSON.stringify({ pricePerKg }),
      });
      setOrders((current) => current.map((item) => item.id === order.id ? { ...item, currentOfferPerKg: pricePerKg, status: 'NEGOTIATING' } : item));
      setApiNotice('Negotiated price recorded.');
    } catch (error) {
      setApiNotice(error instanceof Error ? error.message : 'Offer could not be recorded.');
    }
  };

  const acceptOrder = async (order: BusinessOrder) => {
    try {
      const accepted = await apiRequest<BusinessOrder>(`/business/orders/${order.id}/accept`, { method: 'POST' });
      setOrders((current) => current.map((item) => item.id === order.id ? accepted : item));
      setApiNotice('Order accepted. This is not a payment or invoice.');
    } catch (error) {
      setApiNotice(error instanceof Error ? error.message : 'Order could not be accepted.');
    }
  };

  const downloadProFormaInvoice = async (transaction: BusinessTransaction) => {
    const { jsPDF } = await import('jspdf');
    const document = new jsPDF();
    const invoiceNumber = `PF-${transaction.id.slice(0, 8).toUpperCase()}`;
    const formattedDate = new Date(transaction.updatedAt).toLocaleDateString('en-IN');
    const formattedValue = transaction.totalValueInr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    document.setFontSize(20);
    document.text('AGRILOGIX', 20, 24);
    document.setFontSize(13);
    document.text('PRO FORMA INVOICE', 20, 36);
    document.setFontSize(10);
    document.text(`Reference: ${invoiceNumber}`, 20, 48);
    document.text(`Order: ${transaction.id}`, 20, 55);
    document.text(`Date: ${formattedDate}`, 20, 62);
    document.text(`Seller: ${transaction.sellerName}`, 20, 76);
    document.text(`Buyer: ${transaction.buyerName}`, 20, 83);
    document.text(`Pickup: ${transaction.pickupLocation}`, 20, 90);
    document.text(`Produce: ${transaction.crop} · ${transaction.grade}`, 20, 104);
    document.text(`Quantity: ${transaction.quantityKg.toLocaleString('en-IN')} kg`, 20, 112);
    document.text(`Agreed price: INR ${transaction.pricePerKg.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / kg`, 20, 120);
    document.setFontSize(12);
    document.text(`Pro forma order value: INR ${formattedValue}`, 20, 135);
    document.setFontSize(9);
    document.text('Payment status: Not recorded in AGRILOGIX', 20, 151);
    document.text('This is a pro forma order document, not a tax invoice or proof of payment.', 20, 160);
    document.text('Payment processing and tax invoice issuance require a configured provider.', 20, 167);
    document.save(`agrilogix-proforma-${invoiceNumber.toLowerCase()}.pdf`);
  };

  const requestTransport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const request = await apiRequest<TransportRequest>('/business/transport-requests', {
        method: 'POST',
        body: JSON.stringify({
          pickup: String(form.get('pickup')),
          destination: String(form.get('destination')),
          quantityKg: Number(form.get('quantity')),
          truckCount: Number(form.get('trucks')),
          deliveryAt: new Date(`${String(form.get('deliveryDate'))}T12:00:00Z`).toISOString(),
        }),
      });
      setTransportRequests((current) => [request, ...current]);
      setApiNotice('Transport request posted for carrier quotations.');
      formElement.reset();
      setShowTransportForm(false);
    } catch (error) {
      setApiNotice(error instanceof Error ? error.message : 'Transport request could not be submitted.');
    }
  };

  const quoteDraftFor = (request: TransportRequest) => quoteDrafts[request.id] || {
    vehicleType: request.preferredVehicleType || '',
    refrigerated: request.refrigerated,
    priceInr: '',
    estimatedHours: '',
    vehicleCount: String(request.truckCount),
  };

  const submitCarrierQuote = async (event: React.FormEvent<HTMLFormElement>, request: TransportRequest) => {
    event.preventDefault();
    const draft = quoteDraftFor(request);
    setSubmittingQuoteId(request.id);
    setApiNotice('');
    try {
      await apiClient.quoteTransportRequest(request.id, {
        vehicleType: draft.vehicleType,
        refrigerated: draft.refrigerated,
        priceInr: Number(draft.priceInr),
        estimatedHours: Number(draft.estimatedHours),
        vehicleCount: Number(draft.vehicleCount),
      });
      setApiNotice('Carrier rate submitted to the farmer.');
      setQuoteDrafts((current) => ({ ...current, [request.id]: { ...draft, priceInr: '', estimatedHours: '' } }));
    } catch (error) {
      setApiNotice(error instanceof Error ? error.message : 'Carrier rate could not be submitted.');
    } finally {
      setSubmittingQuoteId('');
    }
  };

  const publishVehicleAvailability = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const departureTime = new Date(String(form.get('departureTime')));
    const arrivalValue = String(form.get('estimatedArrivalTime') || '');
    setIsSavingVehicle(true);
    setApiNotice('');
    try {
      const vehicle = await apiClient.createVehicleAvailability({
        vehicleNumber: String(form.get('vehicleNumber')),
        vehicleType: String(form.get('vehicleType')),
        currentLocation: String(form.get('currentLocation')),
        pickupArea: String(form.get('pickupArea')),
        destination: String(form.get('destination')),
        route: `${String(form.get('pickupArea'))} → ${String(form.get('destination'))}`,
        availableCapacity: Number(form.get('availableCapacity')),
        totalCapacity: Number(form.get('totalCapacity')),
        rateInr: Number(form.get('rateInr')),
        refrigerated: form.get('refrigerated') === 'on',
        departureTime: departureTime.toISOString(),
        estimatedArrivalTime: arrivalValue ? new Date(arrivalValue).toISOString() : null,
      });
      setVehicleAvailability((current) => [vehicle, ...current]);
      setCapacityDrafts((current) => ({ ...current, [vehicle.id]: String(vehicle.availableCapacity) }));
      setApiNotice('Vehicle availability published for farmers in this pickup area.');
      formElement.reset();
      setShowVehicleForm(false);
    } catch (error) {
      setApiNotice(error instanceof Error ? error.message : 'Vehicle availability could not be published.');
    } finally {
      setIsSavingVehicle(false);
    }
  };

  const updateVehicleCapacity = async (vehicle: AvailableVehicle) => {
    const availableCapacity = Number(capacityDrafts[vehicle.id] ?? vehicle.availableCapacity);
    if (!Number.isFinite(availableCapacity) || availableCapacity < 0 || availableCapacity > vehicle.totalCapacity) {
      setApiNotice('Remaining capacity must be between zero and the total vehicle capacity.');
      return;
    }
    try {
      const updated = await apiClient.updateVehicleAvailability(vehicle.id, { availableCapacity });
      setVehicleAvailability((current) => current.map((item) => item.id === updated.id ? updated : item));
      setApiNotice('Vehicle availability updated by the transporter.');
    } catch (error) {
      setApiNotice(error instanceof Error ? error.message : 'Vehicle availability could not be updated.');
    }
  };

  const updateVehicleStatus = async (vehicle: AvailableVehicle, status: 'DEPARTED' | 'CANCELLED') => {
    try {
      const updated = await apiClient.updateVehicleAvailability(vehicle.id, { status });
      setVehicleAvailability((current) => current.map((item) => item.id === updated.id ? updated : item));
      setApiNotice(status === 'DEPARTED' ? 'Vehicle marked as departed.' : 'Vehicle listing cancelled.');
    } catch (error) {
      setApiNotice(error instanceof Error ? error.message : 'Vehicle status could not be updated.');
    }
  };

  const saveCompany = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void apiRequest('/business/profile', {
      method: 'PUT',
      body: JSON.stringify({
        legalName: companyName,
        businessType,
        gstNumber: gstNumber || null,
        address: businessAddress,
        contactPhone: String(form.get('phone') || ''),
      }),
    }).then(() => setProfileNotice('Company details saved. Verification requires an administrator review.'))
      .catch((error: Error) => setProfileNotice(error.message));
  };

  const addDeliveryLocation = () => {
    const value = newLocation.trim();
    if (!value) return;
    void apiRequest('/business/locations', {
      method: 'POST',
      body: JSON.stringify({ label: 'Delivery location', address: value }),
    }).then(() => {
      setDeliveryLocations((current) => [...current, value]);
      setNewLocation('');
    }).catch((error: Error) => setApiNotice(error.message));
  };

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-emerald-800">
            <Building2 className="h-4 w-4" /> Business network
          </div>
          <h2 className="text-xl font-bold text-slate-900">Bulk trade and freight desk</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">Manage bulk produce offers, transport quotations, and company delivery points.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 font-semibold text-amber-800">Business verification required</span>
        </div>
      </section>
      {apiNotice && <p role="status" className="border-l-2 border-emerald-700 pl-3 text-xs font-medium text-slate-700">{apiNotice}</p>}

      <nav className="flex gap-1 overflow-x-auto border-b border-slate-200" aria-label="Business sections">
        {sections.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-semibold ${section === item.id ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {section === 'marketplace' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Bulk marketplace</h3>
              <p className="text-xs text-slate-500">Buyer requirements and your produce offers</p>
            </div>
            <button onClick={() => setShowListingForm((visible) => !visible)} className="inline-flex items-center gap-2 rounded-md bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800">
              <Plus className="h-4 w-4" /> List bulk produce
            </button>
          </div>

          {showListingForm && (
            <form onSubmit={addListing} className="grid gap-3 border-y border-slate-200 py-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-xs font-semibold text-slate-700">Crop<select name="crop" required value={selectedCrop} onChange={(event) => setSelectedCrop(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"><option value="">Select crop</option>{masterCrops.map((crop) => <option key={crop}>{crop}</option>)}</select></label>
              <label className="text-xs font-semibold text-slate-700">Eligible market category<select required value={selectedCategoryId} onChange={(event) => setSelectedCategoryId(event.target.value)} disabled={!selectedCrop} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"><option value="">{selectedCrop ? 'Select category' : 'Select crop first'}</option>{cropCategories.map((category) => <option key={category.categoryId} value={category.categoryId}>{category.category} · {category.averagePricePerKg === null ? 'No verified offers yet' : `₹${category.lowPricePerKg}–₹${category.highPricePerKg}/kg asking`}</option>)}</select></label>
              <label className="text-xs font-semibold text-slate-700">Quantity (kg)<input name="quantity" type="number" required min="1" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
              <label className="text-xs font-semibold text-slate-700">Asking price (₹/kg)<input name="price" type="number" required min="0" step="0.01" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
              <label className="text-xs font-semibold text-slate-700">Grade<input name="grade" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Grade A" /></label>
              <label className="text-xs font-semibold text-slate-700">Pickup location<input name="pickup" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="City, facility" /></label>
              <div className="flex items-end"><button className="rounded-md bg-emerald-700 px-4 py-2 text-xs font-bold text-white">Publish offer</button></div>
            </form>
          )}

          <div className="divide-y divide-slate-200 border-y border-slate-200">
            <h4 className="py-3 text-xs font-bold uppercase text-slate-500">Verified business listings</h4>
            {listings.map((listing) => (
              <div key={listing.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-semibold text-slate-900">{listing.availableQuantityKg.toLocaleString()} kg {listing.crop} · {listing.grade}</p>
                  <p className="mt-1 text-xs text-slate-500">Category {listing.marketCategoryId.split('::').pop()} · Pickup: {listing.pickupLocation} · Minimum order {listing.minimumOrderKg.toLocaleString()} kg</p>
                  <p className="mt-1 text-xs font-semibold text-emerald-800">Asking ₹{listing.pricePerKg}/kg</p>
                </div>
                <button onClick={() => void placeOrder(listing)} className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-700 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50">
                  Request bulk order <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {listings.map((listing) => (
              <div key={listing.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-semibold text-slate-900">{listing.quantityKg.toLocaleString()} kg {listing.crop} · {listing.grade}</p>
                  <p className="mt-1 text-xs text-slate-500">Category {listing.marketCategoryId.split('::').pop()} · Pickup: {listing.pickupLocation} · Asking ₹{listing.pricePerKg}/kg</p>
                </div>
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Your listing</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'orders' && (
        <section>
          <div className="mb-3 flex items-center gap-2"><Package className="h-4 w-4 text-emerald-700" /><h3 className="text-base font-bold text-slate-900">Purchase and sales orders</h3></div>
          {orders.length ? <div className="divide-y divide-slate-200 border-y border-slate-200">
            {orders.map((order) => <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div><p className="font-semibold text-slate-900">Order {order.id.slice(0, 8)} · {order.quantityKg.toLocaleString()} kg</p><p className="mt-1 text-xs text-slate-500">Listing {order.listingId.slice(0, 8)} · Current price ₹{order.currentOfferPerKg}/kg · {order.status}</p></div>
              {order.status === 'NEGOTIATING' && <div className="flex items-center gap-2">
                <input aria-label="Negotiated price per kilogram" type="number" min="0.01" step="0.01" value={offerPrices[order.id] ?? String(order.currentOfferPerKg)} onChange={(event) => setOfferPrices((current) => ({ ...current, [order.id]: event.target.value }))} className="w-28 rounded-md border border-slate-300 px-2 py-2 text-xs" />
                <button onClick={() => void submitOffer(order)} className="rounded-md border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">Send offer</button>
                <button onClick={() => void acceptOrder(order)} className="rounded-md bg-emerald-700 px-3 py-2 text-xs font-bold text-white">Accept</button>
              </div>}
            </div>)}
          </div> : <p className="border-y border-slate-200 py-8 text-center text-sm text-slate-500">No business orders yet.</p>}
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="border-l-2 border-emerald-700 pl-3"><p className="text-xs text-slate-500">Long-term supply</p><p className="mt-1 text-sm font-semibold text-slate-800">Create agreements after partner verification</p></div>
            <div className="border-l-2 border-blue-600 pl-3"><p className="text-xs text-slate-500">Recurring orders</p><p className="mt-1 text-sm font-semibold text-slate-800">Schedule weekly or monthly demand</p></div>
            <div className="border-l-2 border-amber-500 pl-3"><p className="text-xs text-slate-500">Credit terms</p><p className="mt-1 text-sm font-semibold text-slate-800">Track agreed balances outside this preview</p></div>
          </div>
        </section>
      )}

      {section === 'transport' && (
        <section className="space-y-4">
          {businessType === 'Transport Company' && (
            <section className="space-y-3 border-b border-slate-200 pb-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Your vehicle availability</h3>
                  <p className="mt-1 text-xs text-slate-500">Only your transporter account can publish or change these listings.</p>
                </div>
                <button type="button" onClick={() => setShowVehicleForm((visible) => !visible)} className="inline-flex items-center gap-2 rounded-md bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800">
                  <Plus className="h-4 w-4" /> Publish vehicle
                </button>
              </div>

              {showVehicleForm && <form onSubmit={(event) => void publishVehicleAvailability(event)} className="grid gap-3 border-y border-slate-200 py-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className="text-xs font-semibold text-slate-700">Vehicle number<input name="vehicleNumber" required minLength={4} maxLength={32} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
                <label className="text-xs font-semibold text-slate-700">Vehicle type<input name="vehicleType" required minLength={2} maxLength={48} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Reefer truck" /></label>
                <label className="text-xs font-semibold text-slate-700">Current location<input name="currentLocation" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
                <label className="text-xs font-semibold text-slate-700">Pickup area<input name="pickupArea" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
                <label className="text-xs font-semibold text-slate-700">Destination<input name="destination" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
                <label className="text-xs font-semibold text-slate-700">Available capacity (tonnes)<input name="availableCapacity" type="number" min="0.01" step="0.01" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
                <label className="text-xs font-semibold text-slate-700">Total capacity (tonnes)<input name="totalCapacity" type="number" min="0.01" step="0.01" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
                <label className="text-xs font-semibold text-slate-700">Route rate (₹)<input name="rateInr" type="number" min="1" step="0.01" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
                <label className="text-xs font-semibold text-slate-700">Departure time<input name="departureTime" type="datetime-local" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
                <label className="text-xs font-semibold text-slate-700">Estimated arrival<input name="estimatedArrivalTime" type="datetime-local" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
                <label className="flex items-center gap-2 self-end rounded-md border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700"><input name="refrigerated" type="checkbox" className="h-4 w-4 accent-emerald-700" /> Refrigerated vehicle</label>
                <div className="flex items-end"><button type="submit" disabled={isSavingVehicle} className="rounded-md bg-emerald-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{isSavingVehicle ? 'Publishing...' : 'Publish availability'}</button></div>
              </form>}

              {isVehicleLoading ? <p className="py-4 text-sm text-slate-500">Loading your vehicle listings...</p> : vehicleAvailability.length ? (
                <div className="divide-y divide-slate-200 border-y border-slate-200">
                  {vehicleAvailability.map((vehicle) => (
                    <article key={vehicle.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{vehicle.vehicleNumber} · {vehicle.vehicleType}</p>
                        <p className="mt-1 text-xs text-slate-500">{vehicle.route} · Departs {new Date(vehicle.departureTime).toLocaleString()} · {vehicle.status}</p>
                      </div>
                      <div className="flex flex-wrap items-end gap-2">
                        <label className="text-xs font-semibold text-slate-600">Available (tonnes)<input aria-label={`Available capacity for ${vehicle.vehicleNumber}`} type="number" min="0" max={vehicle.totalCapacity} step="0.01" value={capacityDrafts[vehicle.id] ?? String(vehicle.availableCapacity)} onChange={(event) => setCapacityDrafts((current) => ({ ...current, [vehicle.id]: event.target.value }))} className="mt-1 block w-28 rounded-md border border-slate-300 px-2 py-2 text-sm" /></label>
                        <button type="button" onClick={() => void updateVehicleCapacity(vehicle)} className="rounded-md border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Update</button>
                        {vehicle.status !== 'DEPARTED' && vehicle.status !== 'CANCELLED' && <>
                          <button type="button" onClick={() => void updateVehicleStatus(vehicle, 'DEPARTED')} className="rounded-md border border-blue-300 px-3 py-2 text-xs font-bold text-blue-800 hover:bg-blue-50">Mark departed</button>
                          <button type="button" onClick={() => void updateVehicleStatus(vehicle, 'CANCELLED')} className="rounded-md border border-red-300 px-3 py-2 text-xs font-bold text-red-800 hover:bg-red-50">Cancel listing</button>
                        </>}
                      </div>
                    </article>
                  ))}
                </div>
              ) : <p className="border-y border-slate-200 py-5 text-center text-sm text-slate-500">No vehicle availability has been published by this transporter yet.</p>}
            </section>
          )}

          <div className="flex items-start justify-between gap-3">
            <div><h3 className="text-base font-bold text-slate-900">Bulk truck booking and quotations</h3><p className="mt-1 text-xs text-slate-500">Post a lane requirement for carriers to quote.</p></div>
            <button onClick={() => setShowTransportForm((visible) => !visible)} className="inline-flex items-center gap-2 rounded-md bg-emerald-700 px-3 py-2 text-xs font-bold text-white"><Truck className="h-4 w-4" /> Request quotes</button>
          </div>
          {showTransportForm && <form onSubmit={requestTransport} className="grid gap-3 border-y border-slate-200 py-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-xs font-semibold text-slate-700">Pickup<input name="pickup" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
            <label className="text-xs font-semibold text-slate-700">Delivery location<input name="destination" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
            <label className="text-xs font-semibold text-slate-700">Total cargo (kg)<input name="quantity" type="number" min="1" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
            <label className="text-xs font-semibold text-slate-700">Trucks required<input name="trucks" type="number" min="1" defaultValue="1" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
            <label className="text-xs font-semibold text-slate-700">Delivery date<input name="deliveryDate" type="date" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
            <div className="flex items-end"><button className="rounded-md bg-emerald-700 px-4 py-2 text-xs font-bold text-white">Post transport request</button></div>
          </form>}
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {transportRequests.length ? transportRequests.map((request) => {
              const draft = quoteDraftFor(request);
              const fittingClasses = VEHICLE_CLASSES.filter((vehicleClass) =>
                (!request.preferredVehicleType || vehicleClass.id === request.preferredVehicleType) &&
                vehicleClass.maxPayloadKg >= request.quantityKg &&
                (request.cargoVolumeM3 === null || request.cargoVolumeM3 === undefined || vehicleClass.maxVolumeM3 >= request.cargoVolumeM3)
              );
              return <div key={request.id} className="space-y-3 border-b border-slate-200 py-4 last:border-0">
                <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold text-slate-900">{request.quantityKg.toLocaleString()} kg · {request.truckCount} truck(s)</p><p className="mt-1 text-xs text-slate-500">{request.pickup} → {request.destination} · {request.cargoVolumeM3 ? `${request.cargoVolumeM3} m³ · ` : ''}{new Date(request.deliveryAt).toLocaleString()}</p><p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-600">{request.refrigerated && <Snowflake className="h-3.5 w-3.5 text-sky-700" />}{request.refrigerated ? 'Refrigerated required' : 'Standard or refrigerated quote requested'}{request.preferredVehicleType ? ` · ${request.preferredVehicleType}` : ''}</p></div><span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">{request.status}</span></div>
                {businessType === 'Transport Company' && request.status === 'OPEN' && <form onSubmit={(event) => void submitCarrierQuote(event, request)} className="grid gap-3 rounded-md bg-sky-50 p-3 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="text-xs font-semibold text-slate-700">Vehicle class<select required value={draft.vehicleType} onChange={(event) => setQuoteDrafts((current) => ({ ...current, [request.id]: { ...draft, vehicleType: event.target.value } }))} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"><option value="">Select vehicle</option>{fittingClasses.map((vehicleClass) => <option key={vehicleClass.id} value={vehicleClass.id}>{vehicleClass.label} · up to {vehicleClass.maxPayloadKg.toLocaleString()} kg / {vehicleClass.maxVolumeM3} m³</option>)}</select></label>
                  <label className="text-xs font-semibold text-slate-700">Total route rate (₹)<input type="number" min="1" step="0.01" required value={draft.priceInr} onChange={(event) => setQuoteDrafts((current) => ({ ...current, [request.id]: { ...draft, priceInr: event.target.value } }))} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" placeholder="Your actual quote" /></label>
                  <label className="text-xs font-semibold text-slate-700">Estimated hours<input type="number" min="0.1" step="0.1" required value={draft.estimatedHours} onChange={(event) => setQuoteDrafts((current) => ({ ...current, [request.id]: { ...draft, estimatedHours: event.target.value } }))} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" /></label>
                  <label className="text-xs font-semibold text-slate-700">Vehicles<input type="number" min="1" required value={draft.vehicleCount} onChange={(event) => setQuoteDrafts((current) => ({ ...current, [request.id]: { ...draft, vehicleCount: event.target.value } }))} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" /></label>
                  <label className="flex items-center gap-2 self-end rounded-md border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700"><input type="checkbox" checked={draft.refrigerated} disabled={request.refrigerated} onChange={(event) => setQuoteDrafts((current) => ({ ...current, [request.id]: { ...draft, refrigerated: event.target.checked } }))} className="h-4 w-4 accent-emerald-700" /><Snowflake className="h-4 w-4 text-sky-700" />Refrigerated option</label>
                  <button type="submit" disabled={submittingQuoteId === request.id || !fittingClasses.length} className="self-end rounded-md bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">{submittingQuoteId === request.id ? 'Submitting...' : 'Submit carrier rate'}</button>
                </form>}
              </div>;
            }) : <p className="py-8 text-center text-sm text-slate-500">No transport requests yet.</p>}
          </div>
        </section>
      )}

      {section === 'company' && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <form onSubmit={saveCompany} className="space-y-4">
            <div><h3 className="text-base font-bold text-slate-900">Business registration</h3><p className="mt-1 text-xs text-slate-500">Company details are required before listings and carrier bookings can be verified.</p></div>
            <label className="block text-xs font-semibold text-slate-700">Registered company name<input value={companyName} onChange={(event) => setCompanyName(event.target.value)} required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-700">Business type<select value={businessType} onChange={(event) => setBusinessType(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">{['Farmer Group / FPO', 'Wholesaler', 'Retailer', 'Food Processor', 'Warehouse', 'Transport Company', 'Exporter', 'Agricultural Business'].map((type) => <option key={type}>{type}</option>)}</select></label>
              <label className="text-xs font-semibold text-slate-700">GSTIN<input value={gstNumber} onChange={(event) => setGstNumber(event.target.value.toUpperCase())} maxLength={15} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase" placeholder="15-character GSTIN" /></label>
            </div>
            <label className="block text-xs font-semibold text-slate-700">Registered address<input value={businessAddress} onChange={(event) => setBusinessAddress(event.target.value)} required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
            <button className="rounded-md bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white">Save company details</button>
            {profileNotice && <p className="text-xs text-amber-800">{profileNotice}</p>}
          </form>
          <section className="border-l border-slate-200 pl-5">
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-600" /><h3 className="text-sm font-bold text-slate-900">Delivery locations</h3></div>
            <div className="mt-3 flex gap-2"><input value={newLocation} onChange={(event) => setNewLocation(event.target.value)} className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Add warehouse or delivery point" /><button onClick={addDeliveryLocation} type="button" aria-label="Add delivery location" className="rounded-md bg-blue-600 px-3 text-white"><Plus className="h-4 w-4" /></button></div>
            <ul className="mt-3 space-y-2">{deliveryLocations.map((location, index) => <li key={`${location}-${index}`} className="flex items-center gap-2 text-xs text-slate-700"><MapPin className="h-3.5 w-3.5 text-slate-400" />{location}</li>)}</ul>
            {!deliveryLocations.length && <p className="mt-3 text-xs text-slate-500">No additional locations added.</p>}
            <div className="mt-5 flex items-start gap-2 border-t border-slate-200 pt-4 text-xs text-slate-600"><ShieldCheck className="h-4 w-4 shrink-0 text-amber-600" /><span>Verification status: review required. This preview does not verify GSTIN or company documents.</span></div>
          </section>
        </div>
      )}

      {section === 'invoices' && (
        <section className="space-y-4">
          <div className="flex items-center gap-2"><Receipt className="h-4 w-4 text-emerald-700" /><h3 className="text-base font-bold text-slate-900">Transactions and invoices</h3></div>
          <p className="max-w-3xl text-sm text-slate-600">Order records are loaded from the business ledger. Accepted orders can download a pro forma document. Payment processing, settled transaction records, and tax invoices are not connected, so no payment is shown as complete.</p>
          {transactions.length ? <div className="divide-y divide-slate-200 border-y border-slate-200">
            {transactions.map((transaction) => {
              const isAccepted = transaction.status === 'ACCEPTED';
              return <article key={transaction.id} className="space-y-3 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="font-semibold text-slate-900">{transaction.crop} · {transaction.quantityKg.toLocaleString('en-IN')} kg</p><p className="mt-1 text-xs text-slate-500">Order {transaction.id} · {new Date(transaction.createdAt).toLocaleString('en-IN')}</p></div>
                  <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${isAccepted ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>{transaction.status.replace(/_/g, ' ')}</span>
                </div>
                <dl className="grid gap-x-6 gap-y-2 rounded-md bg-slate-50 p-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
                  <div><dt className="text-slate-500">Buyer</dt><dd className="mt-0.5 font-semibold text-slate-900">{transaction.buyerName}</dd></div>
                  <div><dt className="text-slate-500">Seller</dt><dd className="mt-0.5 font-semibold text-slate-900">{transaction.sellerName}</dd></div>
                  <div><dt className="text-slate-500">Pickup</dt><dd className="mt-0.5 font-semibold text-slate-900">{transaction.pickupLocation}</dd></div>
                  <div><dt className="text-slate-500">Grade</dt><dd className="mt-0.5 font-semibold text-slate-900">{transaction.grade}</dd></div>
                  <div><dt className="text-slate-500">Price per kg</dt><dd className="mt-0.5 font-semibold text-slate-900">INR {transaction.pricePerKg.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</dd></div>
                  <div><dt className="text-slate-500">{isAccepted ? 'Agreed order value' : 'Current offer value'}</dt><dd className="mt-0.5 font-semibold text-slate-900">INR {transaction.totalValueInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}{!isAccepted && <span className="ml-1 font-normal text-slate-500">· not final</span>}</dd></div>
                  <div><dt className="text-slate-500">Payment status</dt><dd className="mt-0.5 font-semibold text-amber-800">Not recorded</dd></div>
                  <div><dt className="text-slate-500">Last updated</dt><dd className="mt-0.5 font-semibold text-slate-900">{new Date(transaction.updatedAt).toLocaleString('en-IN')}</dd></div>
                </dl>
                {isAccepted && <button type="button" onClick={() => void downloadProFormaInvoice(transaction)} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-emerald-700 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50"><FileText className="h-4 w-4" />Download pro forma</button>}
              </article>;
            })}
          </div> : <p className="border-y border-slate-200 py-8 text-center text-sm text-slate-500">No saved business orders or transactions yet.</p>}
        </section>
      )}

      <footer className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-200 pt-3 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> Listings, orders, and transport requests persist in AgriLogix</span>
        <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Orders shown here are not binding agreements</span>
        <span className="inline-flex items-center gap-1"><Send className="h-3.5 w-3.5" /> Carrier matching and payments are not connected</span>
      </footer>
    </div>
  );
};