import React, { useEffect, useRef, useState } from 'react';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import { LoaderCircle, LocateFixed, MapPin, Search } from 'lucide-react';

export interface FarmLocationValue {
  lat: number;
  lng: number;
  address: string;
}

interface FarmLocationPickerProps {
  value: unknown;
  onChange: (location: FarmLocationValue) => void;
}

let mapOptionsConfigured = false;

function parseLocation(value: unknown): FarmLocationValue | null {
  if (typeof value !== 'object' || value === null) return null;
  const location = value as Partial<FarmLocationValue>;
  if (typeof location.lat !== 'number' || typeof location.lng !== 'number') return null;
  return {
    lat: location.lat,
    lng: location.lng,
    address: typeof location.address === 'string' ? location.address : '',
  };
}

export const FarmLocationPicker: React.FC<FarmLocationPickerProps> = ({ value, onChange }) => {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const selectedRef = useRef<FarmLocationValue | null>(parseLocation(value));
  const [selectedLocation, setSelectedLocation] = useState<FarmLocationValue | null>(parseLocation(value));
  const [searchText, setSearchText] = useState(parseLocation(value)?.address || '');
  const [mapReady, setMapReady] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const location = parseLocation(value);
    selectedRef.current = location;
    setSelectedLocation(location);
    if (location?.address) setSearchText(location.address);
  }, [value]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    let active = true;
    if (!apiKey) {
      setError('Map service is not configured. Add a restricted Google Maps API key to select a farm location.');
      return () => { active = false; };
    }

    if (!window.google?.maps && !mapOptionsConfigured) {
      setOptions({ key: apiKey, v: 'weekly', libraries: ['maps', 'marker'] });
      mapOptionsConfigured = true;
    }

    importLibrary('maps')
      .then(() => {
        if (!active || !mapElementRef.current || !window.google?.maps) return;
        const existingLocation = selectedRef.current;
        const map = new google.maps.Map(mapElementRef.current, {
          center: existingLocation || { lat: 19.7515, lng: 75.7139 },
          zoom: existingLocation ? 16 : 7,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          mapTypeId: 'satellite',
        });
        mapRef.current = map;
        geocoderRef.current = new google.maps.Geocoder();
        if (existingLocation) {
          markerRef.current = new google.maps.Marker({ position: existingLocation, map, draggable: true });
          markerRef.current.addListener('dragend', (event: google.maps.MapMouseEvent) => {
            if (event.latLng) void selectCoordinates(event.latLng.lat(), event.latLng.lng());
          });
        }
        map.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) void selectCoordinates(event.latLng.lat(), event.latLng.lng());
        });
        setMapReady(true);
      })
      .catch(() => {
        if (active) setError('Google Maps could not load. Check the Maps API key and enabled services.');
      });

    return () => { active = false; };
  }, []);

  const selectCoordinates = async (lat: number, lng: number, addressHint = '') => {
    setError('');
    setIsResolving(true);
    const currentAddress = addressHint || selectedRef.current?.address || '';
    const initialLocation = { lat, lng, address: currentAddress };
    selectedRef.current = initialLocation;
    setSelectedLocation(initialLocation);
    onChange(initialLocation);

    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(Math.max(mapRef.current.getZoom() || 15, 15));
    }
    if (!markerRef.current && mapRef.current) {
      markerRef.current = new google.maps.Marker({ position: { lat, lng }, map: mapRef.current, draggable: true });
      markerRef.current.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) void selectCoordinates(event.latLng.lat(), event.latLng.lng());
      });
    } else {
      markerRef.current?.setPosition({ lat, lng });
    }

    try {
      const response = await geocoderRef.current?.geocode({ location: { lat, lng } });
      const address = response?.results[0]?.formatted_address || addressHint || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      const resolvedLocation = { lat, lng, address };
      selectedRef.current = resolvedLocation;
      setSelectedLocation(resolvedLocation);
      setSearchText(address);
      onChange(resolvedLocation);
    } catch {
      const fallbackAddress = addressHint || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      const resolvedLocation = { lat, lng, address: fallbackAddress };
      selectedRef.current = resolvedLocation;
      setSelectedLocation(resolvedLocation);
      setSearchText(fallbackAddress);
      onChange(resolvedLocation);
      setError('The pin is saved, but its address could not be looked up.');
    } finally {
      setIsResolving(false);
    }
  };

  const searchAddress = async () => {
    if (!searchText.trim() || !geocoderRef.current) return;
    setError('');
    setIsResolving(true);
    try {
      const response = await geocoderRef.current.geocode({ address: searchText.trim(), componentRestrictions: { country: 'IN' } });
      const match = response.results[0];
      if (!match) {
        setError('No matching place found. Try a nearby village or landmark.');
        return;
      }
      await selectCoordinates(match.geometry.location.lat(), match.geometry.location.lng(), match.formatted_address);
    } catch {
      setError('Could not find that place. Try another address or move the map pin.');
    } finally {
      setIsResolving(false);
    }
  };

  const useDeviceLocation = () => {
    setError('');
    if (!navigator.geolocation) {
      setError('Device location is not available right now. Search for your farm or choose it on the map instead.');
      return;
    }
    setIsResolving(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { void selectCoordinates(coords.latitude, coords.longitude); },
      () => {
        setIsResolving(false);
        setError('Could not access device location. Allow location access or tap the map to place the pin.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  return (
    <div className="col-span-full space-y-2.5">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="relative block min-w-0 flex-1 text-xs font-semibold text-slate-700">
          Search farm, village or landmark
          <span className="relative mt-1.5 block">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={searchText} onChange={(event) => setSearchText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void searchAddress(); } }} className="h-11 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm font-normal text-slate-900 outline-none focus:border-emerald-600" placeholder="Farm name, village or nearby landmark" />
          </span>
        </label>
        <button type="button" onClick={() => void searchAddress()} disabled={!mapReady || isResolving} className="mt-5 inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><Search className="h-4 w-4" />Search</button>
      </div>
      <p className="text-xs text-slate-600">Tap the map directly on your farm to place the pin. Drag the pin to fine-tune its position.</p>
      <div className="relative h-64 overflow-hidden rounded-lg border border-sky-200 bg-sky-50 sm:h-72">
        <div ref={mapElementRef} className="h-full w-full" />
        {!mapReady && <div className="absolute inset-0 flex items-center justify-center bg-sky-50/90 px-6 text-center text-sm text-slate-600"><span><LoaderCircle className="mx-auto mb-2 h-5 w-5 animate-spin text-emerald-700" />Loading map…</span></div>}
      </div>
      <div className="grid gap-3 rounded-md border border-sky-100 bg-sky-50/60 p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
        <div className="min-w-0"><p className="text-[10px] font-bold uppercase text-slate-500">Selected farm location</p><p className="mt-1 truncate text-xs font-semibold text-slate-800">{selectedLocation?.address || (selectedLocation ? 'Address lookup not available' : 'No pin selected yet')}</p></div>
        <div><p className="text-[10px] font-bold uppercase text-slate-500">Latitude</p><p className="mt-1 font-mono text-sm font-semibold text-slate-900">{selectedLocation ? selectedLocation.lat.toFixed(6) : 'Not selected'}</p></div>
        <div><p className="text-[10px] font-bold uppercase text-slate-500">Longitude</p><p className="mt-1 font-mono text-sm font-semibold text-slate-900">{selectedLocation ? selectedLocation.lng.toFixed(6) : 'Not selected'}</p></div>
      </div>
      <div className="flex justify-end">
        <button type="button" onClick={useDeviceLocation} disabled={!mapReady || isResolving} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-emerald-700 px-3 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50"><LocateFixed className="h-4 w-4" />Use my location</button>
      </div>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>
  );
};