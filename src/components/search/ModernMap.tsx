'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getFallbackCoordinates } from '@/lib/geocoding';

// Fix voor Next.js: Leaflet icon paths
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

interface Caregiver {
  id: string;
  name: string;
  city?: string;
  lat?: number | null;
  lng?: number | null;
  service?: string;
  hourlyRate?: number | null;
  avgRating?: number | null;
  reviews?: any[];
  distance?: number;
  profilePhoto?: string | null;
}

interface ModernMapProps {
  caregivers?: Caregiver[];
  center?: [number, number];
  zoom?: number;
  onCaregiverSelect?: (caregiver: Caregiver) => void;
  country?: string;
  city?: string; // Geselecteerde stad voor center
}

// Custom Zoom Controls die WEL werken - buiten de map container
function CustomZoomControls({ map }: { map: L.Map | null }) {
  const [zoom, setZoom] = useState(10);

  useEffect(() => {
    if (!map) return;
    setZoom(map.getZoom());
    const updateZoom = () => setZoom(map.getZoom());
    map.on('zoomend', updateZoom);
    return () => {
      map.off('zoomend', updateZoom);
    };
  }, [map]);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    if (map) {
      map.zoomIn();
    }
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    if (map) {
      map.zoomOut();
    }
  };

  if (!map) return null;

  return (
    <div className="absolute top-4 right-4 z-[10000] flex flex-col gap-2 shadow-2xl pointer-events-auto">
      <button
        type="button"
        onClick={handleZoomIn}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
          e.nativeEvent.stopImmediatePropagation();
        }}
        className="w-14 h-14 bg-white border-2 border-gray-300 rounded-xl flex items-center justify-center text-3xl font-bold text-gray-700 hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-600 transition-all duration-200 active:scale-90 shadow-lg cursor-pointer"
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        type="button"
        onClick={handleZoomOut}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
          e.nativeEvent.stopImmediatePropagation();
        }}
        className="w-14 h-14 bg-white border-2 border-gray-300 rounded-xl flex items-center justify-center text-3xl font-bold text-gray-700 hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-600 transition-all duration-200 active:scale-90 shadow-lg cursor-pointer"
        aria-label="Zoom out"
      >
        −
      </button>
    </div>
  );
}

// Component om map instance te krijgen
function MapInstanceGetter({ onMapReady }: { onMapReady: (map: L.Map) => void }) {
  const map = useMap();
  
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  return null;
}

// Component om Leaflet map events te gebruiken zonder navigatie
function MapEventHandler({ onCaregiverSelect }: { onCaregiverSelect?: (caregiver: Caregiver) => void }) {
  useMapEvents({
    click: (e) => {
      e.originalEvent.stopPropagation();
      e.originalEvent.stopImmediatePropagation();
      if (e.originalEvent.cancelable) {
        e.originalEvent.preventDefault();
      }
    },
  });

  return null;
}

const ModernMap: React.FC<ModernMapProps> = ({
  caregivers = [],
  center,
  zoom = 10,
  onCaregiverSelect,
  country = 'BE',
  city,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Default center op basis van country
  const defaultCenter: [number, number] = country === 'NL' 
    ? [52.3676, 4.9041] // Amsterdam
    : [50.8503, 4.3517]; // Brussel

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const caregiversWithCoords = useMemo(() => {
    return caregivers.filter(c => c.lat != null && c.lng != null && !isNaN(c.lat) && !isNaN(c.lng));
  }, [caregivers]);

  // Track previous country to detect changes
  const prevCountryRef = useRef<string | undefined>(undefined);
  const isInitialMountRef = useRef(true);
  
  // Update map center wanneer stad, country of caregivers veranderen
  useEffect(() => {
    if (!mapInstance) {
      console.log('🗺️ Map instance not ready yet');
      return;
    }
    
    const countryChanged = prevCountryRef.current !== undefined && prevCountryRef.current !== country;
    const isInitialMount = isInitialMountRef.current;
    
    console.log('🗺️ Map center update triggered:', {
      country,
      prevCountry: prevCountryRef.current,
      countryChanged,
      isInitialMount,
      defaultCenter,
      caregiversCount: caregiversWithCoords.length,
      city
    });
    
    // Bij eerste mount, gebruik altijd default center voor huidige country
    if (isInitialMount) {
      console.log('🗺️ Initial map load for country:', country, 'Setting center to:', defaultCenter);
      mapInstance.setView(defaultCenter, zoom);
      isInitialMountRef.current = false;
      prevCountryRef.current = country;
      return;
    }
    
    // Als country is veranderd, force update naar default center voor dat land
    if (countryChanged) {
      console.log('🗺️ Country changed:', prevCountryRef.current, '→', country, 'Updating map to:', defaultCenter);
      mapInstance.setView(defaultCenter, zoom, { animate: true, duration: 0.5 });
      prevCountryRef.current = country;
      return;
    }
    
    // Update prevCountryRef als country verandert (zonder force update)
    if (prevCountryRef.current !== country) {
      prevCountryRef.current = country;
    }
    
    // Als er caregivers zijn, gebruik gemiddelde (prioriteit)
    if (caregiversWithCoords.length > 0) {
      const lats = caregiversWithCoords.map(c => c.lat!);
      const lngs = caregiversWithCoords.map(c => c.lng!);
      const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
      const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
      console.log('🗺️ Using caregiver average center:', [avgLat, avgLng]);
      mapInstance.setView([avgLat, avgLng], zoom);
      return;
    }
    
    // Anders, als er een stad is, gebruik die
    if (city) {
      const coords = getFallbackCoordinates(city, country);
      if (coords && coords.success) {
        console.log('🗺️ Using city center:', [coords.lat, coords.lng]);
        mapInstance.setView([coords.lat, coords.lng], zoom);
        return;
      }
    }
    
    // Als er geen stad is, gebruik default center voor dat land
    console.log('🗺️ Using default center for country:', country, defaultCenter);
    mapInstance.setView(defaultCenter, zoom);
  }, [city, country, mapInstance, zoom, caregiversWithCoords, defaultCenter]);

  // Blokkeer alleen navigatie events, NIET drag events (mousedown/mouseup zijn nodig voor drag)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Track of er gedragged wordt
    let isDragging = false;
    let dragStartTime = 0;

    const handleMouseDown = (e: MouseEvent) => {
      dragStartTime = Date.now();
      isDragging = false;
      // Laat mousedown door voor drag functionaliteit
    };

    const handleMouseMove = () => {
      // Als er beweging is na mousedown, is het een drag
      if (dragStartTime > 0) {
        isDragging = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Als het een drag was, blokkeer click niet (laat Leaflet het afhandelen)
      if (isDragging) {
        isDragging = false;
        dragStartTime = 0;
        return; // Laat drag events door
      }
      
      // Als het GEEN drag was maar een click, blokkeer navigatie
      const clickDuration = Date.now() - dragStartTime;
      if (clickDuration < 200) { // Korte click = navigatie risk
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
      dragStartTime = 0;
    };

    // Blokkeer alleen click events die navigatie kunnen triggeren
    const blockClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Laat clicks op Leaflet controls door
      if (target.closest('.leaflet-control') || target.closest('.custom-zoom-controls')) {
        return;
      }
      
      // Als het een click is (niet drag), blokkeer navigatie
      if (!isDragging) {
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };

    // Blokkeer contextmenu (rechts klik)
    const blockContextMenu = (e: Event) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    // Voeg listeners toe
    container.addEventListener('mousedown', handleMouseDown, { capture: true });
    container.addEventListener('mousemove', handleMouseMove, { capture: true });
    container.addEventListener('mouseup', handleMouseUp, { capture: true });
    container.addEventListener('click', blockClick, { capture: true, passive: false });
    container.addEventListener('contextmenu', blockContextMenu, { capture: true, passive: false });

    // Document level blocking alleen voor clicks (niet voor drag)
    const blockDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (container.contains(target) && !target.closest('.custom-zoom-controls') && !isDragging) {
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };

    document.addEventListener('click', blockDocumentClick, { capture: true, passive: false });

    return () => {
      container.removeEventListener('mousedown', handleMouseDown, { capture: true } as any);
      container.removeEventListener('mousemove', handleMouseMove, { capture: true } as any);
      container.removeEventListener('mouseup', handleMouseUp, { capture: true } as any);
      container.removeEventListener('click', blockClick, { capture: true } as any);
      container.removeEventListener('contextmenu', blockContextMenu, { capture: true } as any);
      document.removeEventListener('click', blockDocumentClick, { capture: true } as any);
    };
  }, []);

  const mapCenter = useMemo(() => {
    // PRIORITEIT 1: Als er caregivers zijn met coördinaten, gebruik gemiddelde (toon waar profielen zijn)
    if (caregiversWithCoords.length > 0) {
      const lats = caregiversWithCoords.map(c => c.lat!);
      const lngs = caregiversWithCoords.map(c => c.lng!);
      
      const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
      const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
      
      return [avgLat, avgLng] as [number, number];
    }
    
    // PRIORITEIT 2: Als er een stad is geselecteerd maar geen profielen, gebruik stad coordinaten
    if (city) {
      const coords = getFallbackCoordinates(city, country);
      if (coords && coords.success) {
        return [coords.lat, coords.lng] as [number, number];
      }
    }
    
    // PRIORITEIT 3: Gebruik provided center of default (Brussel voor BE, Amsterdam voor NL)
    return center || defaultCenter;
  }, [caregiversWithCoords, center, city, country, defaultCenter]);

  if (!isMounted) {
    return (
      <div className="w-full h-[400px] rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-sm text-gray-500 border-2 border-gray-200 shadow-lg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Kaart laden...</span>
        </div>
      </div>
    );
  }

  if (typeof window === 'undefined' || !window.L) {
    return (
      <div className="w-full h-[400px] rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-sm text-gray-500 border-2 border-gray-200 shadow-lg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Kaart initialiseren...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-[400px] rounded-2xl overflow-hidden border-2 border-gray-200 shadow-xl relative bg-white"
      onClick={(e) => {
        // Alleen blokkeer als het geen drag was
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }}
    >
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        touchZoom={true}
        boxZoom={true}
        keyboard={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />
        
        <MapInstanceGetter onMapReady={setMapInstance} />
        <MapEventHandler onCaregiverSelect={onCaregiverSelect} />

        {caregiversWithCoords.map((caregiver) => (
          <Marker
            key={caregiver.id}
            position={[caregiver.lat!, caregiver.lng!]}
            eventHandlers={{
              click: (e) => {
                e.originalEvent.stopPropagation();
                e.originalEvent.stopImmediatePropagation();
                if (onCaregiverSelect) {
                  onCaregiverSelect(caregiver);
                }
              },
            }}
          >
            <Popup className="custom-popup">
              <div className="p-4 min-w-[260px]">
                {/* Header met naam en rating */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-900 pr-2">{caregiver.name}</h3>
                  {caregiver.avgRating && (
                    <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
                      <svg className="w-4 h-4 text-emerald-600 fill-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-semibold text-emerald-700">{caregiver.avgRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Locatie en afstand */}
                {caregiver.city && (
                  <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {caregiver.city}
                    {caregiver.distance && (
                      <span className="text-xs text-gray-500 ml-1">• {caregiver.distance.toFixed(1)} km</span>
                    )}
                  </p>
                )}

                {/* Service */}
                {caregiver.service && (
                  <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded inline-block mb-3">
                    {caregiver.service}
                  </p>
                )}

                {/* Prijs */}
                {caregiver.hourlyRate && (
                  <p className="text-sm font-semibold text-gray-900 mb-3">
                    €{caregiver.hourlyRate.toFixed(2)}/uur
                  </p>
                )}

                {/* Reviews count */}
                {caregiver.reviews && caregiver.reviews.length > 0 && (
                  <p className="text-xs text-gray-500 mb-3">
                    {caregiver.reviews.length} {caregiver.reviews.length === 1 ? 'beoordeling' : 'beoordelingen'}
                  </p>
                )}

                {/* Acties */}
                <div className="flex flex-col gap-2 mt-4">
                  <a
                    href={`/booking/new?caregiver=${caregiver.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Boek nu
                  </a>
                  <a
                    href={`/caregivers/${caregiver.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-emerald-400 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Bekijk profiel
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Custom Zoom Controls - BUITEN de map container */}
      <CustomZoomControls map={mapInstance} />
    </div>
  );
};

export default ModernMap;
export { ModernMap };
