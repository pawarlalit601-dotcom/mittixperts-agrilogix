import React, { useEffect, useMemo, useState } from 'react';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Navigation,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Thermometer,
  Clock,
  PlusCircle,
  Phone,
  Store,
  Truck,
  MapPin
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiClient, type AvailableVehicle } from '../../services/apiClient';

const formatBoardDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Today';
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
};

const formatBoardTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const getAvailabilityTone = (status: AvailableVehicle['status']) => {
  switch (status) {
    case 'FULL':
      return 'bg-red-500/15 text-red-200 border-red-500/30';
    case 'FILLING_FAST':
      return 'bg-amber-500/15 text-amber-200 border-amber-500/30';
    default:
      return 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30';
  }
};

export const FarmerDashboardView: React.FC = () => {
  const {
    currentUser,
    selectedShipment,
    setActiveTab,
    openCreateShipmentModal,
    shipmentProgressPct,
    isTruckArrivingSoon
  } = useApp();
  const locale = currentUser?.preferredLanguage || 'en';
  const localeMap = {
    en: {
      welcome: 'Welcome',
      farmerAccount: 'Farmer Account',
      summary: 'Monitor real-time dispatch, transit conditions, and AI freshness across your active farm shipments.',
      createShipment: 'Create New Shipment',
      activeShipments: 'Active Shipments',
      inTransit: 'Produce in transit',
      atRisk: 'Freshness Monitor',
      needsAttention: 'Needs attention',
      deliveries: 'Today\'s Deliveries',
      accepted: 'Accepted at terminal',
      wastage: 'Value Preserved',
      saved: 'Preserved through freshness-based rerouting',
      liveBoard: 'Available vehicle schedule',
      liveDepartures: 'Live departures',
      loading: 'Loading vehicle schedule...',
      noVehicles: 'Vehicle availability: no listings yet for this pickup area. Try another area or check again later.',
      loadError: 'Vehicle availability could not be refreshed. Please try again later.',
      selectedVehicle: 'Selected vehicle',
      bookThisVehicle: 'Book this vehicle',
      viewQuotes: 'View quotes',
      freshnessDetails: 'Freshness Details',
      trackTruck: 'TRACK TRUCK',
      freshRoute: 'Freshness AI Monitor',
      batch: 'Batch',
      arrivingSoon: 'Driver is approaching the destination',
      onTheWay: 'On the way',
      delivered: 'Delivered',
      routeStatus: 'Progress: Farm → Market',
      status: 'Status',
      use: 'Use',
      destination: 'Destination',
      quantity: 'Quantity',
      eta: 'ETA',
      freshness: 'Freshness',
      safeWindow: 'Safe',
      certified: 'Certified Weight',
      via: 'Via',
      route: 'Route',
      risk: 'Freshness Status',
      review: 'Review',
      farmerHub: 'Sahyadri Agro Hub',
      localVehicleBoard: 'Local vehicle board',
      selectedVehicleLabel: 'Selected vehicle',
      batchLabel: 'Batch',
      harvestInfo: 'Organic Hybrid Vine-Ripened • Harvested today at 06:30 AM',
      deliveredStatus: 'Delivered ✅',
      onWayStatus: 'On the way 🟢',
      produceDelivered: 'Produce delivered and confirmed by buyer dock',
      enRoute: 'Driver is en route to the destination',
      driverApproaching: 'Driver is approaching the destination',
      certifiedWeight: 'Certified Weight',
      viaCorridor: 'Via SH-44 Corridor',
      remaining: 'km remaining',
      safeWindowLabel: 'Safe',
      freshRoutes: 'Fresh Routes & Live Map',
      smartMarketFinder: 'Smart Market Finder',
      cropRescueMode: 'Freshness Protection',
      quickFreshness: 'Estimated freshness uses crop assumptions and shipment telemetry. Preview telemetry is simulated; estimates are not guaranteed.',
      quickRoutes: 'Compare Google traffic routes, arrival times, and freshness windows on the map.',
      quickMarkets: 'Compare nearby wholesale APMC hubs for suitable markets and favorable rates.',
      quickRescue: 'Review alternative markets when freshness needs attention. A reroute requires confirmation by an authorized user.',
      dateLabel: 'Date',
      vehicleLabel: 'Vehicle',
      departureLabel: 'Departure',
      arrivalLabel: 'Arrival',
      spaceLabel: 'Space',
      openStatus: 'Open',
      fillingFastStatus: 'Filling fast',
      fullStatus: 'Full',
    },
    hi: {
      welcome: 'स्वागत है',
      farmerAccount: 'कृषक खाता',
      summary: 'अपने सक्रिय खेत शिपमेंट के लिए रियल-टाइम डिस्पैच, ट्रांजिट की स्थिति और एआई फ्रेशनेस की निगरानी करें।',
      createShipment: 'नया शिपमेंट बनाएं',
      activeShipments: 'सक्रिय शिपमेंट',
      inTransit: 'ट्रांसिट में उत्पाद',
      atRisk: 'फ्रेशनेस स्थिति',
      needsAttention: 'ध्यान देने की जरूरत',
      deliveries: 'आज की डिलीवरी',
      accepted: 'टर्मिनल पर स्वीकार किया गया',
      wastage: 'संरक्षित मूल्य',
      saved: 'फ्रेशनेस-आधारित री-रूटिंग से संरक्षित',
      liveBoard: 'उपलब्ध वाहन शेड्यूल',
      liveDepartures: 'लाइव प्रस्थान',
      loading: 'वाहन शेड्यूल लोड हो रहा है...',
      noVehicles: 'वाहन उपलब्धता: इस पिकअप क्षेत्र के लिए अभी कोई सूची नहीं है। दूसरा क्षेत्र चुनें या बाद में जांचें।',
      loadError: 'वाहन उपलब्धता रीफ्रेश नहीं हो सकी। कृपया बाद में पुनः प्रयास करें।',
      selectedVehicle: 'चुना गया वाहन',
      bookThisVehicle: 'यह वाहन बुक करें',
      viewQuotes: 'कोटेशन देखें',
      freshnessDetails: 'फ्रेशनेस विवरण',
      trackTruck: 'ट्रक ट्रैक करें',
      freshRoute: 'फ्रेशनेस एआई मॉनिटर',
      batch: 'बैच',
      arrivingSoon: 'ड्राइवर गंतव्य के पास पहुंच रहा है',
      onTheWay: 'रास्ते में',
      delivered: 'पहुंचा',
      status: 'स्थिति',
      destination: 'गंतव्य',
      quantity: 'मात्रा',
      eta: 'ईटीए',
      freshness: 'फ्रेशनेस',
      safeWindow: 'सुरक्षित',
      risk: 'फ्रेशनेस स्थिति',
      review: 'जांचें',
      farmerHub: 'साह्याद्री एग्रो हब',
      localVehicleBoard: 'लोकल वाहन बोर्ड',
      selectedVehicleLabel: 'चुना गया वाहन',
      batchLabel: 'बैच',
      harvestInfo: 'ऑर्गेनिक हाइब्रिड वाइन-रिपेन • आज सुबह 06:30 AM में कटाई की गई',
      deliveredStatus: 'पहुंचा ✅',
      onWayStatus: 'रास्ते में 🟢',
      produceDelivered: 'उत्पाद खरीदार डॉक द्वारा पहुँचाया गया और पुष्टि की गई',
      enRoute: 'ड्राइवर गंतव्य की ओर जा रहा है',
      driverApproaching: 'ड्राइवर गंतव्य के पास पहुंच रहा है',
      certifiedWeight: 'प्रमाणित वजन',
      viaCorridor: 'SH-44 कॉरिडोर के रास्ते',
      remaining: 'किमी बाकी',
      safeWindowLabel: 'सुरक्षित',
      freshRoutes: 'ताज़ा रास्ते और लाइव मैप',
      smartMarketFinder: 'स्मार्ट मार्केट फाइंडर',
      cropRescueMode: 'फ्रेशनेस संरक्षण',
      quickFreshness: 'अनुमानित फ्रेशनेस फसल अनुमानों और शिपमेंट टेलीमेट्री पर आधारित है। प्रीव्यू टेलीमेट्री सिमुलेटेड है; अनुमान गारंटी नहीं होते।',
      quickRoutes: 'मैप पर Google ट्रैफिक रूट्स, आगमन समय और फ्रेशनेस विंडो की तुलना करें।',
      quickMarkets: 'उपयुक्त बाजार और बेहतर दरें खोजने के लिए निकटतम क्षेत्रीय थोक APMC हब की तुलना करें।',
      quickRescue: 'फ्रेशनेस पर ध्यान देने की जरूरत हो तो वैकल्पिक बाजार देखें। मार्ग बदलने के लिए अधिकृत उपयोगकर्ता की पुष्टि आवश्यक है।',
      dateLabel: 'तारीख',
      vehicleLabel: 'वाहन',
      departureLabel: 'प्रस्थान',
      arrivalLabel: 'आगमन',
      spaceLabel: 'जगह',
      openStatus: 'खुला',
      fillingFastStatus: 'जल्दी भर रहा है',
      fullStatus: 'भरा',
    },
    mr: {
      welcome: 'स्वागत आहे',
      farmerAccount: 'शेतकरी खाते',
      summary: 'आपल्या सक्रिय शेत शिपमेंटसाठी रिअल-टाइम डिस्पॅच, ट्रान्सिट स्थिती आणि एआय फ्रेशनेसवर नजर ठेवा.',
      createShipment: 'नवीन शिपमेंट तयार करा',
      activeShipments: 'सक्रिय शिपमेंट',
      inTransit: 'ट्रान्सिटमध्ये उत्पादन',
      atRisk: 'फ्रेशनेस स्थिती',
      needsAttention: 'दखल आवश्यक',
      deliveries: 'आजची डिलिव्हरी',
      accepted: 'टर्मिनलवर स्वीकारले',
      wastage: 'जतन केलेले मूल्य',
      saved: 'फ्रेशनेस-आधारित री-रूटिंगद्वारे जतन',
      liveBoard: 'उपलब्ध वाहन वेळापत्रक',
      liveDepartures: 'लाइव्ह प्रस्थान',
      loading: 'वाहन वेळापत्रक लोड होत आहे...',
      noVehicles: 'वाहन उपलब्धता: या पिकअप क्षेत्रासाठी अद्याप सूची नाही. दुसरे क्षेत्र निवडा किंवा नंतर तपासा.',
      loadError: 'वाहन उपलब्धता रीफ्रेश करता आली नाही. कृपया नंतर पुन्हा प्रयत्न करा.',
      selectedVehicle: 'निवडलेले वाहन',
      bookThisVehicle: 'हे वाहन बुक करा',
      viewQuotes: 'कोटेशन पहा',
      freshnessDetails: 'फ्रेशनेस तपशील',
      trackTruck: 'ट्रक ट्रॅक करा',
      freshRoute: 'फ्रेशनेस एआय मॉनिटर',
      batch: 'बॅच',
      arrivingSoon: 'ड्रायव्हर गंतव्याजवळ पोहोचत आहे',
      onTheWay: 'रस्त्यावर',
      delivered: 'पहुंचले',
      status: 'स्थिती',
      destination: 'गंतव्य',
      quantity: 'प्रमाण',
      eta: 'ईटीए',
      freshness: 'फ्रेशनेस',
      safeWindow: 'सुरक्षित',
      risk: 'फ्रेशनेस स्थिती',
      review: 'तपासा',
      farmerHub: 'सह्याद्री एग्रो हब',
      localVehicleBoard: 'लोकल वाहन बोर्ड',
      selectedVehicleLabel: 'निवडलेले वाहन',
      batchLabel: 'बॅच',
      harvestInfo: 'ऑर्गेनिक हायब्रिड वाइन-रिपेन • आज सकाळी 06:30 AM ला कापले गेले',
      deliveredStatus: 'पहुंचले ✅',
      onWayStatus: 'रस्त्यावर 🟢',
      produceDelivered: 'उत्पादन विक्रेता डॉकद्वारा ऐक्यतित केले गेले आणि पुष्टी झाली',
      enRoute: 'ड्रायव्हर गंतव्याच्या दिशेने निघाला आहे',
      driverApproaching: 'ड्रायव्हर गंतव्याजवळ पोहोचत आहे',
      certifiedWeight: 'प्रमाणित वजन',
      viaCorridor: 'SH-44 कॉरिडोरद्वारे',
      remaining: 'किमी उरले',
      safeWindowLabel: 'सुरक्षित',
      freshRoutes: 'ताजे मार्ग आणि लाइव्ह नकाशा',
      smartMarketFinder: 'स्मार्ट मार्केट फाइंडर',
      cropRescueMode: 'फ्रेशनेस संरक्षण',
      quickFreshness: 'अनुमानित फ्रेशनेस पिकांच्या गृहीतकांवर आणि शिपमेंट टेलीमेट्रीवर आधारित आहे. प्रीव्यू टेलीमेट्री सिम्युलेटेड आहे; अंदाजांची हमी नाही.',
      quickRoutes: 'नकाशावर Google ट्रॅफिक रूट, आगमन वेळ आणि फ्रेशनेस विंडो तुलना करा.',
      quickMarkets: 'योग्य बाजार आणि चांगले दर शोधण्यासाठी जवळच्या प्रादेशिक APMC केंद्रांची तुलना करा.',
      quickRescue: 'फ्रेशनेसकडे लक्ष देण्याची गरज असल्यास पर्यायी बाजार पाहा. मार्ग बदलण्यासाठी अधिकृत वापरकर्त्याची पुष्टी आवश्यक आहे.',
      dateLabel: 'तारीख',
      vehicleLabel: 'वाहन',
      departureLabel: 'प्रस्थान',
      arrivalLabel: 'आगमन',
      spaceLabel: 'जागा',
      openStatus: 'उघडले',
      fillingFastStatus: 'जल्दी भरत आहे',
      fullStatus: 'पूर्ण',
    },
  } as const;
  const t = (key: keyof typeof localeMap.en) => {
    const translations = localeMap[locale as keyof typeof localeMap] as Partial<Record<keyof typeof localeMap.en, string>>;
    return translations[key] || localeMap.en[key];
  };
  const accountName = currentUser?.fullName || t('farmerAccount');
  const [vehicleAvailability, setVehicleAvailability] = useState<AvailableVehicle[]>([]);
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  const isRescueActive = selectedShipment.status === 'RESCUE_ACTIVE' || selectedShipment.status === 'AT_RISK';

  useEffect(() => {
    let cancelled = false;

    const loadAvailability = async () => {
      const pickupArea = currentUser?.preferredPickupArea || currentUser?.serviceArea || 'Sangli';
      try {
        const results = await apiClient.searchVehicleAvailability({
          pickupArea,
        });

        if (!cancelled) {
          setVehicleAvailability(results.slice(0, 4));
          setAvailabilityError(false);
        }
      } catch {
        if (!cancelled) {
          setVehicleAvailability([]);
          setAvailabilityError(true);
        }
      } finally {
        if (!cancelled) {
          setIsAvailabilityLoading(false);
        }
      }
    };

    void loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.preferredPickupArea, currentUser?.serviceArea]);

  const availabilityRows = useMemo(
    () => vehicleAvailability.map((vehicle) => ({
      ...vehicle,
      displayDate: formatBoardDate(vehicle.departureTime),
      departure: formatBoardTime(vehicle.departureTime),
      arrival: vehicle.estimatedArrivalTime ? formatBoardTime(vehicle.estimatedArrivalTime) : '--:--',
      space: `${vehicle.availableCapacity.toLocaleString()} t`,
      status: vehicle.status || 'AVAILABLE',
    })),
    [vehicleAvailability],
  );

  const selectedVehicle = availabilityRows.find((vehicle) => vehicle.id === selectedVehicleId) || availabilityRows[0];

  return (
    <div className="space-y-6">
      {/* Top Welcome / Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {t('welcome')}, {accountName}
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
              {t('farmerHub')}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('summary')}
          </p>
        </div>

        <button
          onClick={openCreateShipmentModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('createShipment')}</span>
        </button>
      </div>

      {/* 4 Top Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">{t('activeShipments')}</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-data">3</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{t('inTransit')}</div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-xs ${
          isRescueActive ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200/90'
        }`}>
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">{t('atRisk')}</span>
            <AlertTriangle className={`w-4 h-4 ${isRescueActive ? 'text-red-500 animate-pulse' : 'text-amber-500'}`} />
          </div>
          <div className={`text-2xl font-black font-mono-data ${isRescueActive ? 'text-red-600' : 'text-slate-900'}`}>
            1 ⚠️
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-0.5">{t('needsAttention')}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">{t('deliveries')}</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-data">2</div>
          <div className="text-[11px] text-blue-600 font-medium mt-0.5">{t('accepted')}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">{t('wastage')}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono-data">₹8,500</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">{t('saved')}</div>
        </div>
      </div>

      <section className="overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950 text-white shadow-[0_18px_38px_rgba(15,23,42,0.28)]">
        <div className="flex flex-col gap-2 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-300">{t('localVehicleBoard')}</p>
            <h3 className="mt-1 text-lg font-black text-white">{t('liveBoard')}</h3>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">
            <Truck className="h-3.5 w-3.5" />
            {t('liveDepartures')}
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[1.4fr_1.2fr_0.9fr_0.9fr_1.2fr_0.9fr] bg-slate-900/80 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
              <span>{t('dateLabel')}</span>
              <span>{t('vehicleLabel')}</span>
              <span>{t('departureLabel')}</span>
              <span>{t('arrivalLabel')}</span>
              <span>{t('spaceLabel')}</span>
              <span>{t('status')}</span>
            </div>

            {isAvailabilityLoading ? (
              <div className="px-3 py-5 text-sm text-slate-300">{t('loading')}</div>
            ) : availabilityError ? (
              <div className="px-3 py-5 text-sm text-amber-200">{t('loadError')}</div>
            ) : availabilityRows.length === 0 ? (
              <div className="px-3 py-5 text-sm text-slate-300">{t('noVehicles')}</div>
            ) : (
              availabilityRows.map((vehicle) => {
                const isSelected = selectedVehicleId === vehicle.id;
                return (
                  <button
                    type="button"
                    key={vehicle.id}
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                    className={`grid w-full grid-cols-[1.4fr_1.2fr_0.9fr_0.9fr_1.2fr_0.9fr] items-center border-t border-slate-800 px-3 py-3 text-left text-sm text-slate-100 transition hover:bg-slate-900/70 ${isSelected ? 'bg-emerald-500/8 ring-1 ring-inset ring-emerald-500/50' : 'bg-slate-950/40'}`}
                  >
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400">{vehicle.displayDate}</div>
                      <div className="mt-0.5 text-xs text-slate-300">{vehicle.route}</div>
                    </div>
                    <div>
                      <div className="font-bold text-white">{vehicle.vehicleType}</div>
                      <div className="mt-0.5 text-[11px] text-slate-400">{vehicle.vehicleNumber}</div>
                    </div>
                    <div className="font-semibold text-emerald-300">{vehicle.departure}</div>
                    <div className="font-semibold text-sky-300">{vehicle.arrival}</div>
                    <div>
                      <div className="font-bold text-white">{vehicle.space}</div>
                      <div className="text-[11px] text-slate-400">/{vehicle.totalCapacity.toLocaleString()} t</div>
                    </div>
                    <div>
                      <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${getAvailabilityTone(vehicle.status)}`}>
                        {vehicle.status === 'FILLING_FAST' ? t('fillingFastStatus') : vehicle.status === 'FULL' ? t('fullStatus') : t('openStatus')}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {selectedVehicle && (
          <div className="border-t border-slate-800 bg-slate-900/70 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">{t('selectedVehicleLabel')}</p>
                <h4 className="mt-1 text-base font-bold text-white">{selectedVehicle.vehicleType} · {selectedVehicle.vehicleNumber}</h4>
                <p className="mt-1 text-xs text-slate-300">{selectedVehicle.route} · {selectedVehicle.space} available</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openCreateShipmentModal()}
                  className="rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-400"
                >
                  {t('bookThisVehicle')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('transport-quotes')}
                  className="rounded-xl border border-slate-600 bg-slate-800 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-slate-700"
                >
                  {t('viewQuotes')}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Main Active Shipment Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                {t('batchLabel')} #TG102
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Tomato {t('batchLabel')} #TG102
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('harvestInfo')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              selectedShipment.status === 'DELIVERED' 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                : isRescueActive 
                ? 'bg-red-100 text-red-800 border-red-300 animate-pulse'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {selectedShipment.status === 'DELIVERED' ? t('deliveredStatus') : t('onWayStatus')}
            </span>
          </div>
        </div>

        {/* Shipment Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-5 py-2">
          <div>
            <div className="text-xs text-slate-400 font-medium">{t('quantity')}</div>
            <div className="text-base font-bold text-slate-900 mt-0.5 font-mono-data">
              1,000 kg
            </div>
            <div className="text-[11px] text-slate-500">{t('certifiedWeight')}: 998 kg</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">{t('destination')}</div>
            <div className="text-base font-bold text-slate-900 mt-0.5 truncate">
              {selectedShipment.currentDestinationName || 'Pune Market'}
            </div>
            <div className="text-[11px] text-slate-500">{t('viaCorridor')}</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">{t('eta')}</div>
            <div className="text-base font-bold text-slate-900 mt-0.5 font-mono-data">
              {Math.floor(selectedShipment.estimatedTravelTimeMinutes / 60)}h {selectedShipment.estimatedTravelTimeMinutes % 60}m
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">
              {selectedShipment.remainingDistanceKm} {t('remaining')}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">{t('freshness')}</div>
            <div className="text-base font-bold text-emerald-700 mt-0.5 font-mono-data">
              {selectedShipment.freshnessScore}%
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">
              {t('safeWindowLabel')}: ~{selectedShipment.safeSellingWindowHours}h window
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="my-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>{t('routeStatus')}</span>
            <span className="font-mono-data font-bold text-slate-900">{shipmentProgressPct}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${shipmentProgressPct}%` }}
            />
          </div>
        </div>

        {/* Bottom Status & Primary Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>
              {t('status')}:{' '}
              <strong className="text-slate-900">
                {selectedShipment.status === 'DELIVERED'
                  ? t('produceDelivered')
                  : isTruckArrivingSoon
                  ? t('driverApproaching')
                  : t('enRoute')}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('freshness')}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              {t('freshnessDetails')}
            </button>

            <button
              id="track-truck-btn"
              onClick={() => setActiveTab('tracking')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>{t('trackTruck')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('freshness')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 transition cursor-pointer shadow-xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
            {t('freshRoute')}
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {t('quickFreshness')}
          </p>
        </div>

        <div
          onClick={() => setActiveTab('tracking')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 transition cursor-pointer shadow-xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2">
            <Navigation className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
            {t('freshRoutes')}
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {t('quickRoutes')}
          </p>
        </div>

        <div
          onClick={() => setActiveTab('markets')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 transition cursor-pointer shadow-xs group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2">
            <Store className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
            {t('smartMarketFinder')}
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {t('quickMarkets')}
          </p>
        </div>

        <div
          onClick={() => setActiveTab('rescue')}
          className={`p-4 rounded-2xl border transition cursor-pointer shadow-xs group ${
            isRescueActive
              ? 'bg-red-50/60 border-red-200 hover:border-red-300'
              : 'bg-white border-slate-200/90 hover:border-emerald-300'
          }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
            isRescueActive ? 'bg-red-100 text-red-700' : 'bg-amber-50 text-amber-700'
          }`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-red-700 transition">
            {t('cropRescueMode')}
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {t('quickRescue')}
          </p>
        </div>
      </div>
    </div>
  );
};
