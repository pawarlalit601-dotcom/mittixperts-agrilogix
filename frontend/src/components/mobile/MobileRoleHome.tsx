import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Compass,
  Home,
  Leaf,
  MapPin,
  MessageCircle,
  Navigation,
  Package,
  Settings,
  Store,
  Thermometer,
  Truck,
  UserRound,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CropType, UserRole } from '../../types';
import { formatShipmentStatus } from '../../utils/statusLabels';

const cropOptions: CropType[] = ['Grapes', 'Tomato', 'Potato', 'Strawberries', 'Bell Pepper', 'Onion'];

const formatEta = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`;
};

const StatePill: React.FC<{ children: React.ReactNode; tone?: 'green' | 'amber' | 'red' | 'blue' }> = ({ children, tone = 'green' }) => {
  const colors = {
    green: 'bg-emerald-50 text-emerald-800',
    amber: 'bg-amber-50 text-amber-800',
    red: 'bg-red-50 text-red-800',
    blue: 'bg-sky-50 text-sky-800',
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${colors[tone]}`}>{children}</span>;
};

const MobileFarmerHome: React.FC = () => {
  const {
    currentUser,
    selectedShipment,
    markets,
    setActiveTab,
    createNewShipment,
    shipmentProgressPct,
  } = useApp();
  const [cropType, setCropType] = useState<CropType>('Grapes');
  const [quantityKg, setQuantityKg] = useState('500');
  const [pickupLocation, setPickupLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [storageCondition, setStorageCondition] = useState('Refrigerated');
  const [bookingError, setBookingError] = useState('');
  const [booking, setBooking] = useState(false);

  const matchingMarkets = markets.filter((market) => market.acceptedCrops.includes(cropType)).slice(0, 2);
  const riskTone = selectedShipment.spoilageRisk === 'CRITICAL' || selectedShipment.spoilageRisk === 'HIGH'
    ? 'red'
    : selectedShipment.spoilageRisk === 'MEDIUM' ? 'amber' : 'green';

  const submitBooking = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBookingError('');
    setBooking(true);
    try {
      await createNewShipment({
        cropType,
        quantityKg: Number(quantityKg),
        farmName: pickupLocation.trim(),
        destination: destination.trim(),
        harvestTimestamp: new Date().toISOString(),
        storageCondition: `${storageCondition} transport requested`,
      });
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'Could not request transport. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-4 pb-2">
      <div className="px-1 pt-1">
        <p className="text-sm font-medium text-slate-500">Namaskar, {currentUser?.fullName?.trim() || 'Farmer'}</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">Move your harvest</h2>
      </div>

      <section className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><Leaf className="h-5 w-5" /></span>
          <div>
            <h3 className="text-base font-bold text-slate-900">What do you want to transport?</h3>
            <p className="text-xs text-slate-500">Tell us where your produce needs to go.</p>
          </div>
        </div>
        <form onSubmit={submitBooking} className="space-y-3">
          <div className="grid grid-cols-[1fr_112px] gap-3">
            <label className="text-xs font-semibold text-slate-600">Produce
              <select value={cropType} onChange={(event) => setCropType(event.target.value as CropType)} className="mt-1.5 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-600">
                {cropOptions.map((crop) => <option key={crop}>{crop}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600">Quantity (kg)
              <input required type="number" min="1" value={quantityKg} onChange={(event) => setQuantityKg(event.target.value)} className="mt-1.5 h-11 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-emerald-600" />
            </label>
          </div>
          <label className="block text-xs font-semibold text-slate-600">Pickup location
            <span className="relative mt-1.5 block"><MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input required value={pickupLocation} onChange={(event) => setPickupLocation(event.target.value)} placeholder="Village, farm or PIN code" className="h-11 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-emerald-600" /></span>
          </label>
          <label className="block text-xs font-semibold text-slate-600">Destination / buyer location
            <span className="relative mt-1.5 block"><MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input required value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Market, buyer or PIN code" className="h-11 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-emerald-600" /></span>
          </label>
          <label className="block text-xs font-semibold text-slate-600">Truck preference
            <select value={storageCondition} onChange={(event) => setStorageCondition(event.target.value)} className="mt-1.5 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-600">
              <option>Refrigerated</option><option>Standard</option>
            </select>
          </label>
          {bookingError && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{bookingError}</p>}
          <button disabled={booking} className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-60">
            <Truck className="h-4 w-4" />{booking ? 'Finding transport...' : 'Find transport'}
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 text-white shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">Vehicle board</p>
            <h3 className="mt-1 text-base font-bold text-white">Available slots</h3>
          </div>
          <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">Live</span>
        </div>
        <div className="mt-3 space-y-2">
          {[
            { vehicle: 'Reefer Truck', date: 'Tue, 19 Aug', departure: '05:40', arrival: '08:20', space: '520 kg', tone: 'green' },
            { vehicle: 'Container', date: 'Wed, 20 Aug', departure: '07:15', arrival: '11:00', space: '640 kg', tone: 'blue' },
            { vehicle: 'Open Body', date: 'Thu, 21 Aug', departure: '09:05', arrival: '12:40', space: '780 kg', tone: 'amber' },
          ].map((slot) => (
            <div key={slot.vehicle} className="rounded-md border border-slate-700 bg-slate-900/80 p-2.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-white">{slot.vehicle}</p>
                  <p className="text-[11px] text-slate-400">{slot.date}</p>
                </div>
                <span className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${slot.tone === 'green' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : slot.tone === 'blue' ? 'border-sky-500/30 bg-sky-500/10 text-sky-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-200'}`}>
                  {slot.space}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <span>Departure: <strong className="text-emerald-300">{slot.departure}</strong></span>
                <span>Arrival: <strong className="text-sky-300">{slot.arrival}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Live shipment</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">{selectedShipment.batch.cropType} · {selectedShipment.batch.quantityKg.toLocaleString()} kg</h3>
          </div>
          <StatePill tone={riskTone}>{formatShipmentStatus(selectedShipment.status)}</StatePill>
        </div>
        <div className="mt-4 rounded-md bg-sky-50 px-3 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><MapPin className="h-4 w-4 text-sky-700" />{selectedShipment.currentLocation.label || selectedShipment.originName}</div>
          <div className="ml-2 mt-2 h-5 border-l border-dashed border-sky-300" />
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><MapPin className="h-4 w-4 text-emerald-700" />{selectedShipment.currentDestinationName}</div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div><p className="text-xs text-slate-500">Estimated arrival</p><p className="mt-1 text-sm font-bold text-slate-900">{formatEta(selectedShipment.estimatedTravelTimeMinutes)}</p></div>
          <div><p className="text-xs text-slate-500">Produce freshness</p><p className="mt-1 text-sm font-bold text-emerald-800">{selectedShipment.freshnessScore}%</p></div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-sky-100"><div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${shipmentProgressPct}%` }} /></div>
        <button onClick={() => setActiveTab('tracking')} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md border border-emerald-700 text-sm font-bold text-emerald-800 hover:bg-emerald-50"><Navigation className="h-4 w-4" />Track live</button>
      </section>

      <section className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div><p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Crop-compatible destinations</p><h3 className="mt-1 text-base font-bold text-slate-900">Markets for {cropType}</h3></div>
          <Store className="h-5 w-5 text-emerald-700" />
        </div>
        {matchingMarkets.length ? <div className="mt-3 divide-y divide-sky-100">
          {matchingMarkets.map((market) => <div key={market.id} className="flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-0">
            <div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{market.name}</p><p className="mt-1 text-xs text-slate-500">{market.qualityRequirement} · {market.distanceKm} km</p></div>
            <div className="shrink-0 text-right"><p className="text-sm font-semibold text-slate-800">{formatEta(market.etaMinutes)}</p><p className="mt-1 text-xs text-slate-500">Freshness Monitor: {market.freshnessRisk}</p></div>
          </div>)}
        </div> : <p className="mt-3 rounded-md bg-slate-50 px-3 py-3 text-sm text-slate-600">No crop-compatible market is listed for {cropType} yet.</p>}
        <button onClick={() => setActiveTab('markets')} className="mt-4 flex items-center gap-1 text-sm font-bold text-emerald-800">View markets <ArrowRight className="h-4 w-4" /></button>
      </section>

      <section className="rounded-lg border border-amber-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Freshness & route</p><h3 className="mt-1 text-base font-bold text-slate-900">{riskTone === 'red' ? 'Freshness attention required' : 'Keep produce moving'}</h3></div>
          <AlertTriangle className={`h-5 w-5 ${riskTone === 'red' ? 'text-red-600' : 'text-amber-600'}`} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
          <span className="rounded-md bg-emerald-50 px-2 py-2 text-emerald-800">Fresh</span><span className={`rounded-md px-2 py-2 ${riskTone === 'amber' ? 'bg-amber-100 text-amber-900' : 'bg-slate-50 text-slate-500'}`}>Moderate</span><span className={`rounded-md px-2 py-2 ${riskTone === 'red' ? 'bg-red-100 text-red-900' : 'bg-slate-50 text-slate-500'}`}>Priority attention</span>
        </div>
        <p className="mt-3 text-sm text-slate-600">{riskTone === 'red' ? 'A faster destination may help protect this harvest.' : 'We are checking the route against the estimated freshness window.'}</p>
        <button onClick={() => setActiveTab('rescue')} className="mt-3 text-sm font-bold text-emerald-800">View alternate route <ArrowRight className="ml-1 inline h-4 w-4" /></button>
      </section>
    </div>
  );
};

const MobileDriverHome: React.FC = () => {
  const { currentUser, selectedShipment, setActiveTab, setIsDriverNavigating, isGpsSimulating, driverAcceptedAiRoute, acceptDriverAiRoute } = useApp();
  const latestReading = selectedShipment.sensorHistory[selectedShipment.sensorHistory.length - 1];
  const isAtRisk = selectedShipment.spoilageRisk === 'HIGH' || selectedShipment.spoilageRisk === 'CRITICAL';

  return <div className="mx-auto max-w-xl space-y-4 pb-2">
    <div className="px-1 pt-1"><p className="text-sm font-medium text-slate-500">Good day, {currentUser?.fullName?.split(' ')[0] || 'Driver'}</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Your trip</h2></div>
    <section className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned shipment</p><h3 className="mt-1 text-lg font-bold text-slate-900">{selectedShipment.batch.cropType} · {selectedShipment.batch.quantityKg.toLocaleString()} kg</h3></div><StatePill tone={isAtRisk ? 'red' : 'green'}>{isAtRisk ? 'Needs attention' : 'Ready'}</StatePill></div>
      <div className="mt-4 space-y-3 rounded-md bg-sky-50 p-3"><p className="flex items-start gap-2 text-sm font-medium text-slate-800"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" /><span><span className="block text-xs text-slate-500">Pickup</span>{selectedShipment.originName}</span></p><div className="ml-2 h-4 border-l border-dashed border-sky-300" /><p className="flex items-start gap-2 text-sm font-medium text-slate-800"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" /><span><span className="block text-xs text-slate-500">Delivery</span>{selectedShipment.currentDestinationName}</span></p></div>
      <div className="mt-4 grid grid-cols-2 gap-3"><div><p className="text-xs text-slate-500">Arrival estimate</p><p className="mt-1 font-bold text-slate-900">{formatEta(selectedShipment.estimatedTravelTimeMinutes)}</p></div><div><p className="text-xs text-slate-500">Truck</p><p className="mt-1 font-bold text-slate-900">{selectedShipment.vehicleNumber || 'To be assigned'}</p></div></div>
      <button onClick={() => { setIsDriverNavigating(true); setActiveTab('navigation'); }} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 text-sm font-bold text-white hover:bg-emerald-800"><Navigation className="h-4 w-4" />Start trip</button>
      <button onClick={() => setActiveTab('navigation')} className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-md border border-sky-200 text-sm font-bold text-sky-900 hover:bg-sky-50"><Compass className="h-4 w-4" />Open navigation</button>
    </section>
    <section className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Trip conditions</p><h3 className="mt-1 text-base font-bold text-slate-900">Live cargo check</h3></div><span className={`h-2.5 w-2.5 rounded-full ${isGpsSimulating ? 'bg-emerald-500' : 'bg-slate-300'}`} /></div>
      <p className="mt-3 flex items-center gap-2 text-sm text-slate-700"><MapPin className="h-4 w-4 text-sky-700" />{selectedShipment.currentLocation.label} · {selectedShipment.remainingDistanceKm} km remaining</p>
      {latestReading ? <div className="mt-3 flex gap-5 text-sm text-slate-700"><span className="inline-flex items-center gap-1"><Thermometer className="h-4 w-4 text-emerald-700" />{latestReading.temperatureC}°C</span><span>Humidity {latestReading.humidityPct}%</span></div> : <p className="mt-3 text-xs text-slate-500">Cargo sensors are not connected for this trip.</p>}
    </section>
    {(isAtRisk || selectedShipment.status === 'AT_RISK' || selectedShipment.status === 'RESCUE_ACTIVE') && <section className="rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="text-sm font-bold text-amber-950">A fresher route is available</p><p className="mt-1 text-sm text-amber-900">Review the suggested route before changing your trip.</p><button onClick={acceptDriverAiRoute} className="mt-3 h-11 w-full rounded-md bg-emerald-700 text-sm font-bold text-white hover:bg-emerald-800">{driverAcceptedAiRoute ? 'Alternate route accepted' : 'Accept alternate route'}</button></section>}
  </div>;
};

const MobileBuyerHome: React.FC = () => {
  const { currentUser, shipments, selectedShipment, setActiveTab, completeDelivery } = useApp();
  const incoming = shipments.find((shipment) => !['DELIVERED', 'COMPLETED'].includes(shipment.status)) || selectedShipment;

  return <div className="mx-auto max-w-xl space-y-4 pb-2">
    <div className="px-1 pt-1"><p className="text-sm font-medium text-slate-500">Welcome, {currentUser?.fullName?.split(' ')[0] || 'Buyer'}</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Incoming produce</h2></div>
    <section className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">On the way</p><h3 className="mt-1 text-lg font-bold text-slate-900">{incoming.batch.cropType} · {incoming.batch.quantityKg.toLocaleString()} kg</h3></div><StatePill tone={incoming.spoilageRisk === 'HIGH' || incoming.spoilageRisk === 'CRITICAL' ? 'amber' : 'green'}>{formatShipmentStatus(incoming.status)}</StatePill></div>
      <p className="mt-3 text-sm text-slate-600">From {incoming.originName}</p>
      <div className="mt-4 rounded-md bg-sky-50 p-3"><p className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Truck className="h-4 w-4 text-sky-700" />{incoming.currentLocation.label}</p><p className="mt-2 text-xs text-slate-500">Delivery to {incoming.currentDestinationName}</p></div>
      <div className="mt-4 grid grid-cols-2 gap-3"><div><p className="text-xs text-slate-500">Estimated arrival</p><p className="mt-1 font-bold text-slate-900">{formatEta(incoming.estimatedTravelTimeMinutes)}</p></div><div><p className="text-xs text-slate-500">Freshness</p><p className="mt-1 font-bold text-emerald-800">{incoming.freshnessScore}% · Freshness Monitor: {incoming.spoilageRisk}</p></div></div>
      <button onClick={() => setActiveTab('tracking')} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md border border-sky-300 text-sm font-bold text-sky-900 hover:bg-sky-50"><Navigation className="h-4 w-4" />Track truck</button>
      <button onClick={() => completeDelivery(incoming.id)} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 text-sm font-bold text-white hover:bg-emerald-800"><CheckCircle2 className="h-4 w-4" />Confirm delivery</button>
    </section>
    <button onClick={() => setActiveTab('find-produce')} className="flex w-full items-center justify-between rounded-lg border border-sky-100 bg-white p-4 text-left shadow-sm"><span><span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Need more produce?</span><span className="mt-1 block text-sm font-bold text-slate-900">Browse verified farm offers</span></span><Store className="h-5 w-5 text-emerald-700" /></button>
  </div>;
};

const MobileAdminHome: React.FC = () => {
  const { shipments, setActiveTab } = useApp();
  const activeCount = shipments.filter((shipment) => !['DELIVERED', 'COMPLETED'].includes(shipment.status)).length;
  const vehicleCount = shipments.filter((shipment) => shipment.vehicleNumber && shipment.vehicleNumber !== 'Unassigned').length;
  const riskCount = shipments.filter((shipment) => ['AT_RISK', 'RESCUE_ACTIVE', 'REROUTE_REQUESTED'].includes(shipment.status)).length;

  return <div className="mx-auto max-w-xl space-y-4 pb-2">
    <div className="px-1 pt-1"><p className="text-sm font-medium text-slate-500">Network overview</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Operations today</h2></div>
    <section className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Shipments in progress</p><div className="mt-2 flex items-end justify-between"><p className="text-4xl font-bold text-slate-900">{activeCount}</p><StatePill tone={riskCount ? 'amber' : 'green'}>{riskCount} need attention</StatePill></div><div className="mt-4 grid grid-cols-2 gap-3 border-t border-sky-100 pt-3"><div><p className="text-xs text-slate-500">Vehicles in use</p><p className="mt-1 text-lg font-bold text-slate-900">{vehicleCount}</p></div><div><p className="text-xs text-slate-500">Tracked produce</p><p className="mt-1 text-lg font-bold text-slate-900">{shipments.reduce((total, shipment) => total + shipment.batch.quantityKg, 0).toLocaleString()} kg</p></div></div></section>
    <section className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Live network</p><h3 className="mt-1 text-base font-bold text-slate-900">Fleet & route status</h3></div><Truck className="h-5 w-5 text-sky-700" /></div><div className="mt-3 space-y-2">{shipments.slice(0, 3).map((shipment) => <button key={shipment.id} onClick={() => setActiveTab('fleet')} className="flex w-full items-center justify-between gap-3 rounded-md bg-sky-50 px-3 py-3 text-left"><span className="min-w-0"><span className="block truncate text-sm font-bold text-slate-900">{shipment.batch.cropType} · {shipment.batch.quantityKg.toLocaleString()} kg</span><span className="mt-1 block truncate text-xs text-slate-500">{shipment.currentLocation.label} → {shipment.currentDestinationName}</span></span><span className="shrink-0 text-xs font-semibold text-emerald-800">{formatEta(shipment.estimatedTravelTimeMinutes)}</span></button>)}</div><button onClick={() => setActiveTab('fleet')} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-md border border-sky-300 text-sm font-bold text-sky-900 hover:bg-sky-50"><MapPin className="h-4 w-4" />Open live fleet</button></section>
    <section className="grid grid-cols-2 gap-3"><button onClick={() => setActiveTab('risk-monitor')} className="rounded-lg border border-amber-200 bg-white p-4 text-left shadow-sm"><AlertTriangle className="h-5 w-5 text-amber-700" /><span className="mt-2 block text-sm font-bold text-slate-900">Freshness alerts</span><span className="mt-1 block text-xs text-slate-500">{riskCount} shipments to review</span></button><button onClick={() => setActiveTab('disputes')} className="rounded-lg border border-sky-100 bg-white p-4 text-left shadow-sm"><ClipboardList className="h-5 w-5 text-sky-700" /><span className="mt-2 block text-sm font-bold text-slate-900">Disputes</span><span className="mt-1 block text-xs text-slate-500">Review open cases</span></button></section>
  </div>;
};

export const MobileRoleHome: React.FC = () => {
  const { userRole } = useApp();
  if (userRole === 'FARMER') return <MobileFarmerHome />;
  if (userRole === 'DRIVER') return <MobileDriverHome />;
  if (userRole === 'BUYER') return <MobileBuyerHome />;
  if (userRole === 'ADMIN' || userRole === 'EXECUTIVE' || userRole === 'AUDITOR') return <MobileAdminHome />;
  return null;
};

const navItemsByRole: Partial<Record<UserRole, { tab: string; label: string; icon: typeof Home }[]>> = {
  FARMER: [
    { tab: 'dashboard', label: 'Home', icon: Home },
    { tab: 'shipments', label: 'Shipments', icon: Package },
    { tab: 'markets', label: 'Markets', icon: Store },
    { tab: 'tracking', label: 'Tracking', icon: Navigation },
    { tab: 'profile', label: 'Profile', icon: UserRound },
  ],
  DRIVER: [
    { tab: 'dashboard', label: 'Home', icon: Home },
    { tab: 'trips', label: 'Trips', icon: ClipboardList },
    { tab: 'navigation', label: 'Navigate', icon: Compass },
    { tab: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { tab: 'profile', label: 'Profile', icon: UserRound },
  ],
  BUYER: [
    { tab: 'dashboard', label: 'Home', icon: Home },
    { tab: 'incoming', label: 'Orders', icon: ClipboardList },
    { tab: 'tracking', label: 'Tracking', icon: Navigation },
    { tab: 'find-produce', label: 'Markets', icon: Store },
    { tab: 'profile', label: 'Profile', icon: UserRound },
  ],
  ADMIN: [
    { tab: 'dashboard', label: 'Home', icon: Home },
    { tab: 'all-shipments', label: 'Shipments', icon: Package },
    { tab: 'fleet', label: 'Fleet', icon: Truck },
    { tab: 'risk-monitor', label: 'Alerts', icon: AlertTriangle },
    { tab: 'settings', label: 'Settings', icon: Settings },
  ],
  EXECUTIVE: [
    { tab: 'dashboard', label: 'Home', icon: Home },
    { tab: 'all-shipments', label: 'Shipments', icon: Package },
    { tab: 'fleet', label: 'Fleet', icon: Truck },
    { tab: 'risk-monitor', label: 'Alerts', icon: AlertTriangle },
    { tab: 'settings', label: 'Settings', icon: Settings },
  ],
  AUDITOR: [
    { tab: 'dashboard', label: 'Home', icon: Home },
    { tab: 'all-shipments', label: 'Shipments', icon: Package },
    { tab: 'disputes', label: 'Disputes', icon: ClipboardList },
    { tab: 'analytics', label: 'Reports', icon: Store },
    { tab: 'profile', label: 'Profile', icon: UserRound },
  ],
};

export const MobileBottomNav: React.FC = () => {
  const { userRole, activeTab, setActiveTab } = useApp();
  const navItems = navItemsByRole[userRole];
  if (!navItems) return null;

  return <nav aria-label="Main navigation" className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-slate-50/95 px-2 pt-2 backdrop-blur lg:hidden">
    <div className={`mx-auto grid max-w-xl gap-1 ${userRole === 'FARMER' ? 'grid-cols-6' : 'grid-cols-5'}`}>
      {navItems.map(({ tab, label, icon: Icon }) => {
        const active = activeTab === tab || (tab === 'trips' && activeTab === 'my-trips') || (tab === 'all-shipments' && activeTab === 'shipments');
        return <button key={tab} onClick={() => setActiveTab(tab)} aria-current={active ? 'page' : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-[10px] font-semibold transition ${active ? 'text-emerald-800' : 'text-slate-500 hover:text-slate-800'}`}>
          <Icon className={`h-5 w-5 ${active ? 'stroke-[2.5]' : ''}`} />{label}
        </button>;
      })}
    </div>
  </nav>;
};