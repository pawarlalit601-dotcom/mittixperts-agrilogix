import React, { useEffect, useRef, useState, useCallback } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import {
  Navigation,
  MapPin,
  AlertTriangle,
  Sparkles,
  Layers,
  Thermometer,
  Gauge,
  Crosshair,
  Satellite,
  Compass,
  Radio,
  CloudSun,
  Locate,
  RefreshCw,
  Maximize2,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Market } from '../types';
import { fetchLiveWeather, LiveWeatherData } from '../services/weatherService';
import { formatShipmentStatus } from '../utils/statusLabels';

let googleMapsOptionsConfigured = false;

interface GoogleRouteAlternative {
  index: number;
  summary: string;
  distance: string;
  duration: string;
  durationSeconds: number;
}

interface GoogleLiveMapProps {
  onSelectMarket?: (market: Market) => void;
  height?: string;
}

export const GoogleLiveMap: React.FC<GoogleLiveMapProps> = ({
  onSelectMarket,
  height = 'h-[500px]'
}) => {
  const {
    selectedShipment,
    markets,
    userRole,
    isGpsSimulating,
    toggleGpsSimulation,
    confirmReroute,
    shipmentProgressPct
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const truckMarkerRef = useRef<google.maps.Marker | null>(null);
  const userDeviceMarkerRef = useRef<google.maps.Marker | null>(null);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  const directionsRenderersRef = useRef<google.maps.DirectionsRenderer[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [mapTheme, setMapTheme] = useState<'dark' | 'light'>('dark');
  const [liveWeather, setLiveWeather] = useState<LiveWeatherData | null>(null);
  const [directionsResult, setDirectionsResult] = useState<google.maps.DirectionsResult | null>(null);
  const [routeAlternatives, setRouteAlternatives] = useState<GoogleRouteAlternative[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number; speedKmh: number | null } | null>(null);

  // Real User Device Geolocation Tracking state
  const [isTrackingUserDevice, setIsTrackingUserDevice] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [userDistanceToTruckKm, setUserDistanceToTruckKm] = useState<number | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const geoWatchIdRef = useRef<number | null>(null);
  const lastLocationSentAtRef = useRef(0);

  const isRerouted = selectedShipment.status === 'REROUTED' || selectedShipment.status === 'DELIVERED';
  const isRescueActive = selectedShipment.status === 'RESCUE_ACTIVE' || selectedShipment.status === 'AT_RISK';

  // Real coordinate paths
  // Route 1: Nashik -> Kasara Ghat -> Thane -> Mumbai APMC
  const originalRouteCoords = [
    { lat: 19.9975, lng: 73.7898 }, // Nashik Farm
    { lat: 19.8250, lng: 73.6700 }, // Igatpuri
    { lat: 19.4500, lng: 73.4000 }, // Kasara Ghat Bottleneck
    { lat: 19.3200, lng: 73.1800 }, // Shahapur / Asangaon
    { lat: 19.2183, lng: 72.9781 }, // Thane Depot
    { lat: 19.0760, lng: 72.8777 }, // Mumbai APMC Hub
  ];

  // Route 2: Kasara Ghat -> SH-44 / Nagar Highway -> Pune Agro Logistics Terminal
  const aiRescueRouteCoords = [
    { lat: 19.4500, lng: 73.4000 }, // Kasara Junction
    { lat: 19.2800, lng: 73.7200 }, // Otur / Alephata Link
    { lat: 19.0200, lng: 73.9500 }, // Rajgurunagar Bypass
    { lat: 18.7200, lng: 73.8800 }, // Chakan Agro Belt
    { lat: 18.5204, lng: 73.8567 }, // Pune Agro Terminal
  ];

  // Calculate truck current coordinate based on status and progress
  const getTruckCoordinates = useCallback((): { lat: number; lng: number; heading: number } => {
    if (driverLocation) {
      return { lat: driverLocation.lat, lng: driverLocation.lng, heading: 0 };
    }
    if (isRerouted) {
      // Diverted toward Pune on SH-44
      const p = Math.min(Math.max((shipmentProgressPct - 40) / 60, 0.25), 0.85);
      const lat = 19.4500 + (18.5204 - 19.4500) * p;
      const lng = 73.4000 + (73.8567 - 73.4000) * p;
      return { lat, lng, heading: 155 };
    } else {
      // Near Kasara Ghat traffic queue
      const p = Math.min(Math.max(shipmentProgressPct / 100, 0.45), 0.55);
      const lat = 19.8250 + (19.4500 - 19.8250) * ((p - 0.2) / 0.4);
      const lng = 73.6700 + (73.4000 - 73.6700) * ((p - 0.2) / 0.4);
      return { lat, lng, heading: 215 };
    }
  }, [driverLocation, isRerouted, shipmentProgressPct]);

  // Dark Map Style JSON configuration
  const darkMapStyles: google.maps.MapTypeStyle[] = [
    { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#cbd5e1' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#64748b' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#064e3b' }, { opacity: 0.4 }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#334155' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1e293b' }],
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#94a3b8' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#475569' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1e293b' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#0f172a' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#475569' }],
    },
  ];

  // Fetch live weather for truck position
  useEffect(() => {
    const truckCoord = getTruckCoordinates();
    fetchLiveWeather(truckCoord.lat, truckCoord.lng, 'Transit Corridor')
      .then(setLiveWeather)
      .catch((err) => console.error('Failed to fetch weather for truck position', err));
  }, [getTruckCoordinates]);

  // Initialize Google Maps
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    let isMounted = true;

    if (!apiKey) {
      setLoadError('Google Maps is not configured. Add a restricted VITE_GOOGLE_MAPS_API_KEY to the frontend environment.');
      return () => {
        isMounted = false;
      };
    }

    if (!googleMapsOptionsConfigured) {
      setOptions({
        key: apiKey,
        v: 'weekly',
        libraries: ['geometry', 'marker', 'maps'],
      });
      googleMapsOptionsConfigured = true;
    }

    Promise.all([
      importLibrary('maps'),
      importLibrary('marker'),
    ])
      .then(() => {
        if (!isMounted || !mapContainerRef.current) return;
        const google = window.google;
        if (!google || !google.maps) return;

        const truckCoord = getTruckCoordinates();
        const mapOptions: google.maps.MapOptions = {
          center: { lat: 19.35, lng: 73.55 },
          zoom: 9,
          mapTypeId: mapType,
          styles: mapTheme === 'dark' ? darkMapStyles : undefined,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: true,
          fullscreenControl: false,
        };

        const map = new google.maps.Map(mapContainerRef.current, mapOptions);
        mapInstanceRef.current = map;

        // Create InfoWindow
        infoWindowRef.current = new google.maps.InfoWindow();

        // Traffic Layer
        const trafficLayer = new google.maps.TrafficLayer();
        if (showTraffic) {
          trafficLayer.setMap(map);
        }
        trafficLayerRef.current = trafficLayer;

        // 1. Origin Farm Marker (Nashik)
        const originMarker = new google.maps.Marker({
          position: selectedShipment.batch.farmLocation,
          map,
          title: `Farm origin: ${selectedShipment.batch.farmName}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#10b981',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 9,
          },
        });

        originMarker.addListener('click', () => {
          infoWindowRef.current?.setContent(`
            <div style="font-family: Inter, 'Noto Sans Devanagari', system-ui, sans-serif; padding: 6px; color: #0f172a; max-width: 220px;">
              <h4 style="font-weight: 800; margin: 0 0 4px 0; font-size: 13px; color: #047857;">🌱 Sahyadri Valley Farm</h4>
              <p style="margin: 0; font-size: 11px; color: #475569;">Batch #${selectedShipment.batch.id} &bull; ${selectedShipment.batch.cropType} (${selectedShipment.batch.quantityKg} kg)</p>
              <div style="margin-top: 6px; font-size: 10px; font-weight: 700; color: #065f46; background: #d1fae5; padding: 3px 6px; border-radius: 4px;">Verified Origin Dispatch</div>
            </div>
          `);
          infoWindowRef.current?.open(map, originMarker);
        });

        // 2. Markets Markers
        markets.forEach((m) => {
          const isTargetMarket = m.id === selectedShipment.destinationMarketId;
          const isAiRecommendation = selectedShipment.marketRecommendations?.[0]?.marketId === m.id;

          const markerColor = isAiRecommendation
            ? '#10b981'
            : m.id === 'market-a'
            ? '#ef4444'
            : '#f59e0b';

          const marketMarker = new google.maps.Marker({
            position: { lat: m.location.lat, lng: m.location.lng },
            map,
            title: m.name,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: markerColor,
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: isTargetMarket ? 3 : 1.5,
              scale: isTargetMarket ? 10 : 7,
            },
          });

          marketMarker.addListener('click', () => {
            infoWindowRef.current?.setContent(`
              <div style="font-family: Inter, 'Noto Sans Devanagari', system-ui, sans-serif; padding: 6px; color: #0f172a; max-width: 240px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <h4 style="font-weight: 800; margin: 0; font-size: 13px; color: ${markerColor};">${m.name}</h4>
                </div>
                <p style="margin: 4px 0; font-size: 11px; color: #475569;">${m.distanceKm} km away &bull; ETA: ${m.etaHours}</p>
                <div style="font-size: 11px; margin: 4px 0; font-weight: 700; color: #047857;">Price: ₹${m.indicativePricePerKg}/kg &bull; Demand: ${m.requiredQuantityKg} kg</div>
                ${isAiRecommendation ? '<div style="font-size: 10px; font-weight: 800; background: #ecfdf5; color: #047857; padding: 3px 6px; border-radius: 4px; border: 1px solid #a7f3d0;">⭐ AI FRESHROUTE™ RECOMMENDATION</div>' : ''}
              </div>
            `);
            infoWindowRef.current?.open(map, marketMarker);
            if (onSelectMarket) onSelectMarket(m);
          });
        });

        // 3. Moving Truck Marker
        const truckMarker = new google.maps.Marker({
          position: { lat: truckCoord.lat, lng: truckCoord.lng },
          map,
          title: `Truck ${selectedShipment.vehicleNumber}`,
          icon: {
            path: 'M 0,-14 L 8,-5 L 5,12 L -5,12 L -8,-5 Z',
            fillColor: isRerouted ? '#10b981' : isRescueActive ? '#ef4444' : '#38bdf8',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 1.6,
            rotation: truckCoord.heading,
          },
        });
        truckMarkerRef.current = truckMarker;

        truckMarker.addListener('click', () => {
          infoWindowRef.current?.setContent(`
            <div style="font-family: Inter, 'Noto Sans Devanagari', system-ui, sans-serif; padding: 8px; color: #0f172a; max-width: 260px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-weight: 900; font-size: 13px; color: #0369a1;">🚚 ${selectedShipment.vehicleNumber}</span>
                <span style="font-size: 10px; font-weight: 800; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px;">${driverLocation ? 'DRIVER GPS' : 'SIMULATED TELEMETRY'}</span>
              </div>
              <div style="font-size: 11px; color: #334155; margin-top: 4px;">Driver: <strong>${selectedShipment.driverName}</strong></div>
              <div style="font-size: 11px; color: #334155;">Speed: <strong>${driverLocation?.speedKmh ?? selectedShipment.currentSpeedKmh} km/h</strong> &bull; Cargo: <strong>${selectedShipment.sensorHistory[selectedShipment.sensorHistory.length - 1]?.temperatureC || 24}°C</strong></div>
              <div style="font-size: 11px; color: #334155;">Freshness: <strong>${selectedShipment.freshnessScore}/100</strong></div>
              <div style="margin-top: 6px; font-size: 10px; font-weight: 700; color: #0369a1;">Status: ${formatShipmentStatus(selectedShipment.status)}</div>
            </div>
          `);
          infoWindowRef.current?.open(map, truckMarker);
        });

        setMapLoaded(true);
      })
      .catch((err) => {
        console.error('Error loading Google Maps:', err);
        setLoadError(err.message || 'Map could not be loaded. Check your connection and try again.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!mapLoaded || !map) return;

    const destination = markets.find((market) => market.id === selectedShipment.destinationMarketId);
    if (!destination) {
      setRouteError('No destination coordinates are configured for this shipment.');
      setDirectionsResult(null);
      setRouteAlternatives([]);
      return;
    }

    let isActive = true;
    setRouteError(null);
    setDirectionsResult(null);
    setRouteAlternatives([]);

    const origin = userRole === 'DRIVER'
      ? selectedShipment.currentLocation
      : selectedShipment.batch.farmLocation;

    new google.maps.DirectionsService()
      .route({
        origin,
        destination: { lat: destination.location.lat, lng: destination.location.lng },
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: userRole === 'DRIVER' || userRole === 'FARMER',
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: google.maps.TrafficModel.BEST_GUESS,
        },
      })
      .then((result) => {
        if (!isActive) return;
        setDirectionsResult(result);
        setSelectedRouteIndex(0);
        setRouteAlternatives(result.routes.map((route, index) => {
          const leg = route.legs[0];
          return {
            index,
            summary: route.summary || `Google route ${index + 1}`,
            distance: leg?.distance?.text ?? 'Distance not available',
            duration: leg?.duration_in_traffic?.text ?? leg?.duration?.text ?? 'ETA not available',
            durationSeconds: leg?.duration_in_traffic?.value ?? leg?.duration?.value ?? 0,
          };
        }));
      })
      .catch((error: Error) => {
        if (!isActive) return;
        setRouteError(error.message || 'Google Directions could not calculate this route.');
      });

    return () => {
      isActive = false;
    };
  }, [mapLoaded, markets, selectedShipment.destinationMarketId, selectedShipment.batch.farmLocation, selectedShipment.currentLocation, userRole]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!mapLoaded || !map || !directionsResult) return;

    directionsRenderersRef.current.forEach((renderer) => renderer.setMap(null));
    const renderOrder = directionsResult.routes
      .map((_, index) => index)
      .filter((index) => index !== selectedRouteIndex)
      .concat(selectedRouteIndex);
    directionsRenderersRef.current = renderOrder.map((routeIndex) => {
      const isSelected = routeIndex === selectedRouteIndex;
      return new google.maps.DirectionsRenderer({
        map,
        directions: directionsResult,
        routeIndex,
        suppressMarkers: true,
        preserveViewport: true,
        polylineOptions: {
          strokeColor: isSelected ? '#10b981' : '#94a3b8',
          strokeOpacity: isSelected ? 0.95 : 0.58,
          strokeWeight: isSelected ? 7 : 5,
          zIndex: isSelected ? 2 : 1,
        },
      });
    });

    return () => {
      directionsRenderersRef.current.forEach((renderer) => renderer.setMap(null));
      directionsRenderersRef.current = [];
    };
  }, [directionsResult, mapLoaded, selectedRouteIndex]);

  useEffect(() => {
    if (!mapLoaded || !['FARMER', 'DRIVER', 'ADMIN'].includes(userRole)) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}/ws/shipments/${selectedShipment.id}/locations`);
    socket.onmessage = (event) => {
      try {
        const location = JSON.parse(event.data) as { latitude: number; longitude: number; speedKmh: number | null };
        if (Number.isFinite(location.latitude) && Number.isFinite(location.longitude)) {
          setDriverLocation({ lat: location.latitude, lng: location.longitude, speedKmh: location.speedKmh });
        }
      } catch {
        setGeoError('Received an invalid driver-location update.');
      }
    };
    return () => socket.close();
  }, [mapLoaded, selectedShipment.id, userRole]);

  // Update Truck marker position dynamically when shipment progress changes
  useEffect(() => {
    if (!truckMarkerRef.current || !mapInstanceRef.current) return;
    const coord = getTruckCoordinates();
    const pos = new google.maps.LatLng(coord.lat, coord.lng);
    truckMarkerRef.current.setPosition(pos);

    // Update icon rotation & color
    truckMarkerRef.current.setIcon({
      path: 'M 0,-14 L 8,-5 L 5,12 L -5,12 L -8,-5 Z',
      fillColor: isRerouted ? '#10b981' : isRescueActive ? '#ef4444' : '#38bdf8',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 1.6,
      rotation: coord.heading,
    });
  }, [getTruckCoordinates, isRerouted, isRescueActive, shipmentProgressPct]);

  // Toggle Traffic Layer
  const toggleTraffic = () => {
    if (!trafficLayerRef.current || !mapInstanceRef.current) return;
    if (showTraffic) {
      trafficLayerRef.current.setMap(null);
      setShowTraffic(false);
    } else {
      trafficLayerRef.current.setMap(mapInstanceRef.current);
      setShowTraffic(true);
    }
  };

  // Center on Truck
  const centerOnTruck = () => {
    if (!mapInstanceRef.current) return;
    const coord = getTruckCoordinates();
    mapInstanceRef.current.panTo({ lat: coord.lat, lng: coord.lng });
    mapInstanceRef.current.setZoom(12);
  };

  // Fit Entire Transit Corridor
  const fitCorridorBounds = () => {
    if (!mapInstanceRef.current) return;
    const bounds = new google.maps.LatLngBounds();
    originalRouteCoords.forEach((pt) => bounds.extend(pt));
    aiRescueRouteCoords.forEach((pt) => bounds.extend(pt));
    if (userLocation) {
      bounds.extend({ lat: userLocation.lat, lng: userLocation.lng });
    }
    mapInstanceRef.current.fitBounds(bounds);
  };

  // Toggle Map Theme (Dark / Light)
  const toggleMapTheme = () => {
    if (!mapInstanceRef.current) return;
    const newTheme = mapTheme === 'dark' ? 'light' : 'dark';
    setMapTheme(newTheme);
    mapInstanceRef.current.setOptions({
      styles: newTheme === 'dark' ? darkMapStyles : undefined,
    });
  };

  // Calculate distance between two points in km (Haversine formula)
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  // REAL USER DEVICE GEOLOCATION TRACKING
  const toggleUserDeviceTracking = () => {
    if (isTrackingUserDevice) {
      // Turn off
      if (geoWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
        geoWatchIdRef.current = null;
      }
      if (userDeviceMarkerRef.current) {
        userDeviceMarkerRef.current.setMap(null);
        userDeviceMarkerRef.current = null;
      }
      setIsTrackingUserDevice(false);
      setUserLocation(null);
      setUserDistanceToTruckKm(null);
    } else {
      // Turn on
      if (!navigator.geolocation) {
        setGeoError('Geolocation is not supported by your browser.');
        return;
      }

      setGeoError(null);
      setIsTrackingUserDevice(true);

      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setUserLocation({ lat: latitude, lng: longitude, accuracy });

            if (userRole === 'DRIVER' && Date.now() - lastLocationSentAtRef.current >= 15_000) {
              lastLocationSentAtRef.current = Date.now();
              void fetch(`/api/v1/shipments/${selectedShipment.id}/locations`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  latitude,
                  longitude,
                  accuracyMeters: accuracy,
                  speedKmh: pos.coords.speed === null ? null : pos.coords.speed * 3.6,
                }),
              }).then(async (response) => {
                if (!response.ok) {
                  const result = await response.json().catch(() => null) as { detail?: string } | null;
                  setGeoError(result?.detail || 'Location sharing requires an assigned trip.');
                } else {
                  setGeoError(null);
                }
              }).catch(() => setGeoError('Driver GPS could not be sent to the server.'));
            }

          const truckCoord = getTruckCoordinates();
          const dist = calculateDistanceKm(latitude, longitude, truckCoord.lat, truckCoord.lng);
          setUserDistanceToTruckKm(dist);

          if (mapInstanceRef.current) {
            const userLatLng = new google.maps.LatLng(latitude, longitude);

            if (!userDeviceMarkerRef.current) {
              const marker = new google.maps.Marker({
                position: userLatLng,
                map: mapInstanceRef.current,
                title: 'Your Live Location (GPS)',
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: '#6366f1',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2.5,
                  scale: 8,
                },
              });

              marker.addListener('click', () => {
                infoWindowRef.current?.setContent(`
                  <div style="font-family: Inter, 'Noto Sans Devanagari', system-ui, sans-serif; padding: 6px; color: #0f172a; max-width: 220px;">
                    <div style="font-weight: 800; font-size: 13px; color: #4338ca;">📍 Your Live Device GPS</div>
                    <div style="font-size: 11px; color: #475569; margin-top: 3px;">Distance to shipment: <strong>${dist} km</strong></div>
                    <div style="font-size: 10px; color: #64748b; margin-top: 3px;">Accuracy: ±${Math.round(accuracy)}m</div>
                  </div>
                `);
                infoWindowRef.current?.open(mapInstanceRef.current!, marker);
              });

              userDeviceMarkerRef.current = marker;
            } else {
              userDeviceMarkerRef.current.setPosition(userLatLng);
            }

            // Pan to show both user and truck
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(userLatLng);
            bounds.extend(new google.maps.LatLng(truckCoord.lat, truckCoord.lng));
            mapInstanceRef.current.fitBounds(bounds);
          }
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setGeoError(err.message || 'Unable to retrieve your location.');
          setIsTrackingUserDevice(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );

      geoWatchIdRef.current = watchId;
    }
  };

  // Cleanup geolocation watch on unmount
  useEffect(() => {
    return () => {
      if (geoWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
      }
    };
  }, []);

  const truckCoord = getTruckCoordinates();
  const fastestRouteIndex = routeAlternatives.reduce(
    (fastestIndex, route) => route.durationSeconds < (routeAlternatives[fastestIndex]?.durationSeconds ?? Infinity) ? route.index : fastestIndex,
    routeAlternatives[0]?.index ?? 0,
  );
  const selectedRoute = routeAlternatives.find((route) => route.index === selectedRouteIndex);
  const selectedRouteResult = directionsResult?.routes[selectedRouteIndex];
  const destination = markets.find((market) => market.id === selectedShipment.destinationMarketId);
  const getGoogleMapsUrl = (routeIndex: number) => {
    if (!destination) return 'https://www.google.com/maps';
    const route = directionsResult?.routes[routeIndex];
    const path = route?.overview_path ?? [];
    const waypoint = path.length > 2 ? path[Math.floor(path.length / 2)] : null;
    const origin = userRole === 'DRIVER' ? selectedShipment.currentLocation : selectedShipment.batch.farmLocation;
    const params = new URLSearchParams({
      api: '1',
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.location.lat},${destination.location.lng}`,
      travelmode: 'driving',
    });
    if (waypoint) params.set('waypoints', `${waypoint.lat()},${waypoint.lng()}`);
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  };

  return (
    <div id="google-live-map-wrapper" className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-slate-800 bg-slate-950 text-white">
      <div className="relative">
      {/* Top Floating Action Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: GPS Status & Simulation Mode */}
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700/80 shadow-lg text-xs">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isGpsSimulating ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isGpsSimulating ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <span className="font-bold tracking-tight text-white">
            {driverLocation ? 'DRIVER GPS CONNECTED' : isGpsSimulating ? 'SIMULATED TRUCK MOVEMENT' : 'TRUCK MOVEMENT PAUSED'}
          </span>
          <button
            onClick={toggleGpsSimulation}
            className="ml-1 px-2 py-0.5 rounded-lg bg-emerald-950/80 text-emerald-300 hover:text-emerald-200 border border-emerald-800 text-[11px] font-semibold cursor-pointer transition"
          >
            {isGpsSimulating ? 'Pause movement' : 'Resume movement'}
          </button>
        </div>

        {/* Center/Right: Live Weather Telemetry Pill */}
        {liveWeather && (
          <div className="hidden sm:flex items-center gap-2.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-700/80 text-xs shadow-lg">
            <div className="flex items-center gap-1.5 text-amber-300">
              <CloudSun className="w-4 h-4" />
              <span className="font-bold font-mono-data">{liveWeather.temperatureC}°C</span>
              <span className="text-slate-400 text-[11px]">({liveWeather.conditionLabel})</span>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div className="text-slate-300">
              {liveWeather.humidityPct}% RH
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
              liveWeather.thermalRisk === 'CRITICAL' ? 'bg-red-500/20 text-red-300' :
              liveWeather.thermalRisk === 'ELEVATED' ? 'bg-amber-500/20 text-amber-300' :
              'bg-emerald-500/20 text-emerald-300'
            }`}>
              {liveWeather.spoilageAccelerationFactor}x HEAT LOAD
            </span>
          </div>
        )}

        {/* Map View & Control Buttons */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-700/80 shadow-lg text-xs">
          {/* User Device GPS Tracking Toggle */}
          <button
            onClick={toggleUserDeviceTracking}
            className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
              isTrackingUserDevice
                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Track Your Device's Live GPS on Google Maps"
          >
            <Locate className={`w-3.5 h-3.5 ${isTrackingUserDevice ? 'animate-pulse text-white' : 'text-indigo-400'}`} />
            <span className="hidden md:inline">{isTrackingUserDevice ? 'Tracking My GPS' : 'Track My GPS'}</span>
          </button>

          {/* Traffic Toggle */}
          <button
            onClick={toggleTraffic}
            className={`px-2.5 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
              showTraffic ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Live Google Traffic Layer"
          >
            🚦 Traffic
          </button>

          {/* Center Truck */}
          <button
            onClick={centerOnTruck}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Center on Truck"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          {/* Fit Corridor */}
          <button
            onClick={fitCorridorBounds}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Fit Corridor Bounds"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleMapTheme}
            className="px-2 py-1 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition text-[11px] font-bold cursor-pointer"
            title="Toggle Dark/Light Map"
          >
            {mapTheme === 'dark' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </div>

      {/* User Device GPS Tracking Status Banner */}
      {isTrackingUserDevice && userLocation && (
        <div className="absolute top-16 left-3 z-10 bg-indigo-950/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-indigo-500/50 shadow-xl text-xs flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              <span>Your Device GPS Active</span>
              <span className="text-indigo-300 font-mono-data">({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})</span>
            </div>
            {userDistanceToTruckKm !== null && (
              <div className="text-[11px] text-indigo-200">
                You are <strong className="text-white font-mono-data">{userDistanceToTruckKm} km</strong> away from truck {selectedShipment.vehicleNumber}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Geolocation Permission Error Toast */}
      {geoError && (
        <div className="absolute top-16 left-3 z-10 bg-red-950/90 px-3 py-1.5 rounded-xl border border-red-500/50 text-xs text-red-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Google Map Div Container */}
      <div
        ref={mapContainerRef}
        id="google-maps-canvas"
        className={`w-full ${height} bg-slate-950`}
      />

      {/* Loading Skeleton if Map is still initializing */}
      {!mapLoaded && !loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm z-20 text-center p-6">
          <div className="w-12 h-12 rounded-2xl border-4 border-emerald-500/30 border-t-emerald-500 animate-spin mb-3" />
          <h3 className="text-base font-bold text-white">Loading Google Maps...</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Map tiles and traffic are provided by Google Maps. Truck movement in this preview is simulated.
          </p>
        </div>
      )}

      {/* Error Fallback Notice */}
      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 p-6 text-center z-20">
          <AlertTriangle className="w-10 h-10 text-amber-400 mb-2" />
          <h3 className="text-base font-bold text-white">Google Maps Initializing</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-1.5 bg-emerald-600 rounded-xl text-xs font-bold text-white cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Bottom Floating Telemetry Card */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700/80 shadow-2xl z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                isRerouted 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : isRescueActive 
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
              }`}>
                {isRerouted ? 'REROUTED TO RESCUE HUB' : isRescueActive ? '🚨 CROP RESCUE ACTIVE' : 'STANDARD CORRIDOR'}
              </span>
              <span className="text-xs text-slate-400 font-mono-data">Batch #{selectedShipment.batch.id}</span>
            </div>

            <h4 className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
              <span>{isRerouted ? 'Pune Agro Logistics Terminal' : selectedShipment.currentDestinationName}</span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              {isRerouted
                ? 'Preview route change shown via SH-44 Expressway.'
                : `Simulated position: ${truckCoord.lat.toFixed(4)}° N, ${truckCoord.lng.toFixed(4)}° E`}
            </p>
          </div>

          {isRescueActive && !isRerouted && (
            <button
              id="gmap-one-click-reroute-btn"
              onClick={() => confirmReroute('market-b')}
              className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-900/50 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              Reroute B
            </button>
          )}
        </div>
      </div>
      </div>

      {(userRole === 'DRIVER' || userRole === 'FARMER') && routeAlternatives.length > 0 && (
        <section aria-label="Fresh route alternatives" className="border-t border-slate-800 bg-slate-950 p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white">Fresh routes to {destination?.name || selectedShipment.currentDestinationName}</h3>
              <p className="mt-1 text-[11px] text-slate-400">Google traffic ETA compared with the remaining safe-selling window.</p>
            </div>
            {selectedRoute && (
              <a
                href={getGoogleMapsUrl(selectedRouteIndex)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-300 transition hover:border-emerald-500 hover:bg-slate-900"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open selected route in Google Maps
              </a>
            )}
          </div>

          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {routeAlternatives.map((route) => {
              const travelHours = route.durationSeconds / 3600;
              const windowBuffer = selectedShipment.safeSellingWindowHours - travelHours;
              const isSelected = route.index === selectedRouteIndex;
              const isFastest = route.index === fastestRouteIndex;
              return (
                <button
                  key={route.index}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedRouteIndex(route.index)}
                  className={`rounded-xl border p-3 text-left transition ${
                    isSelected ? 'border-emerald-400 bg-emerald-950/50' : 'border-slate-700 bg-slate-900/70 hover:border-slate-500'
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white">Route {route.index + 1}{isFastest ? ' · Fastest arrival' : ''}</span>
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                  </span>
                  <span className="mt-1 block truncate text-[11px] text-slate-300">{route.summary}</span>
                  <span className="mt-2 flex gap-4 text-[11px] text-slate-300">
                    <span>{route.distance}</span>
                    <span className="font-semibold text-white">ETA {route.duration}</span>
                  </span>
                  <span className={`mt-2 block text-[11px] font-semibold ${windowBuffer >= 0 ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {windowBuffer >= 0
                      ? `${windowBuffer.toFixed(1)}h freshness buffer`
                      : `${Math.abs(windowBuffer).toFixed(1)}h beyond safe window`}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedRouteResult && (
            <p className="mt-3 text-[10px] text-slate-500">
              Selected: {selectedRoute?.summary || 'Google route'} · Freshness buffer is an estimate based on the shipment’s current safe-selling window.
            </p>
          )}
        </section>
      )}

      {/* Bottom Map Legend Bar */}
      <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-emerald-500 rounded-full" />
            <span>Google driving route</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Configured markets</span>
          </div>
          {isTrackingUserDevice && (
            <div className="flex items-center gap-1.5 text-indigo-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
              <span>You (Live GPS)</span>
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-400 font-mono-data">
          {selectedRoute
            ? `Google route: ${selectedRoute.distance} · Traffic ETA ${selectedRoute.duration}`
            : routeError
              ? `Route information not available: ${routeError}`
              : 'Calculating Google route...'}
          {' · '}{driverLocation ? 'Driver GPS' : 'Simulated truck'}: {truckCoord.lat.toFixed(4)}° N, {truckCoord.lng.toFixed(4)}° E
        </div>
      </div>
    </div>
  );
};
