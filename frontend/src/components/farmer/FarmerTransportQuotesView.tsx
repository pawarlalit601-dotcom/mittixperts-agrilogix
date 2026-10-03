import React, { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, Clock3, LoaderCircle, MapPin, RefreshCw, Snowflake, Truck } from 'lucide-react';
import { apiClient, TransportQuote, TransportRequest } from '../../services/apiClient';
import { VEHICLE_CLASSES } from '../../data/vehicleClasses';

interface RequestWithQuotes {
  request: TransportRequest;
  quotes: TransportQuote[];
}

const moneyInr = (value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const vehicleLabel = (vehicleType: string) => VEHICLE_CLASSES.find((item) => item.id === vehicleType)?.label || vehicleType;

export const FarmerTransportQuotesView: React.FC = () => {
  const [requests, setRequests] = useState<RequestWithQuotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyQuoteId, setBusyQuoteId] = useState('');
  const [error, setError] = useState('');

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const transportRequests = await apiClient.transportRequests();
      const requestsWithQuotes = await Promise.all(transportRequests.map(async (request) => ({
        request,
        quotes: await apiClient.transportQuotes(request.id),
      })));
      setRequests(requestsWithQuotes);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Carrier rates could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadRequests(); }, [loadRequests]);

  const acceptQuote = async (requestId: string, quoteId: string) => {
    setBusyQuoteId(quoteId);
    setError('');
    try {
      await apiClient.acceptTransportQuote(requestId, quoteId);
      await loadRequests();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Carrier quote could not be accepted.');
    } finally {
      setBusyQuoteId('');
    }
  };

  return <div className="mx-auto max-w-4xl space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
      <div><p className="text-xs font-bold uppercase text-emerald-800">Verified transporters</p><h2 className="mt-1 text-xl font-bold text-slate-900">Vehicle rates</h2><p className="mt-1 text-sm text-slate-600">Compare submitted carrier prices for standard and refrigerated vehicles.</p></div>
      <button type="button" onClick={() => void loadRequests()} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh rates</button>
    </header>
    {error && <p role="alert" className="border-l-2 border-red-600 pl-3 text-sm text-red-800">{error}</p>}
    {loading ? <div className="flex items-center gap-2 py-10 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />Loading carrier offers...</div> : requests.length ? <div className="space-y-4">
      {requests.map(({ request, quotes }) => {
        const accepted = quotes.find((quote) => quote.status === 'ACCEPTED');
        return <section key={request.id} className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
            <div><p className="text-xs font-semibold uppercase text-slate-500">{request.shipmentId ? `Shipment ${request.shipmentId.slice(0, 8)}` : 'Transport request'}</p><h3 className="mt-1 text-base font-bold text-slate-900">{request.quantityKg.toLocaleString('en-IN')} kg · {vehicleLabel(request.preferredVehicleType || 'Vehicle class requested')}</h3><p className="mt-1 text-xs text-slate-600">{request.pickup} → {request.destination} · {request.cargoVolumeM3 ? `${request.cargoVolumeM3} m³` : 'volume not supplied'}</p></div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${accepted ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>{accepted ? 'Carrier selected' : request.status === 'OPEN' ? 'Awaiting quotes' : request.status}</span>
          </div>
          {quotes.length ? <div className="mt-3 divide-y divide-slate-100">
            {quotes.map((quote) => <article key={quote.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0"><p className="font-semibold text-slate-900">{quote.carrierCompany}</p><p className="mt-1 text-xs text-slate-600">{vehicleLabel(quote.vehicleType)} · {quote.vehicleCount} vehicle{quote.vehicleCount === 1 ? '' : 's'} · {quote.estimatedHours} hr ETA</p><p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">{quote.refrigerated ? <><Snowflake className="h-3.5 w-3.5 text-sky-700" />Refrigerated</> : <><Truck className="h-3.5 w-3.5 text-slate-500" />Standard vehicle</>}</p></div>
              <div className="flex items-center justify-between gap-3 sm:justify-end"><div className="text-right"><p className="text-lg font-bold text-emerald-800">{moneyInr(quote.priceInr)}</p><p className="text-[10px] text-slate-500">Carrier-submitted total rate</p></div>{quote.status === 'ACCEPTED' ? <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-2 text-xs font-bold text-emerald-800"><BadgeCheck className="h-4 w-4" />Selected</span> : accepted ? <span className="text-xs text-slate-400">Not selected</span> : <button type="button" disabled={busyQuoteId !== '' || request.status !== 'OPEN'} onClick={() => void acceptQuote(request.id, quote.id)} className="min-h-10 rounded-md bg-emerald-700 px-3 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50">{busyQuoteId === quote.id ? 'Selecting...' : 'Choose rate'}</button>}</div>
            </article>)}
          </div> : <div className="mt-3 rounded-md bg-sky-50 px-3 py-4 text-sm text-slate-700"><p className="font-semibold">No transporter rates yet</p><p className="mt-1 text-xs text-slate-600">Your request is open to verified transport companies. Refresh to check for new standard or refrigerated offers.</p></div>}
          <p className="mt-2 flex items-center gap-1 text-[10px] text-slate-500"><MapPin className="h-3 w-3" />Only actual carrier-submitted rates appear here.</p>
        </section>;
      })}
    </div> : <section className="rounded-lg border border-sky-100 bg-white px-5 py-10 text-center"><Truck className="mx-auto h-8 w-8 text-emerald-700" /><h3 className="mt-3 text-base font-bold text-slate-900">No transport requests yet</h3><p className="mt-1 text-sm text-slate-600">Create a shipment and submit your vehicle requirements to receive verified carrier rates.</p></section>}
  </div>;
};