'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
}

interface ModernMapProps {
  caregivers?: Caregiver[];
  center?: [number, number];
  zoom?: number;
  onCaregiverSelect?: (caregiver: Caregiver) => void;
  country?: string;
}

// CRITICAL: Component die ALLE events op de map container blokkeert VOORDAT ze naar parent kunnen
function MapIsolationWrapper({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // ULTRA AGGRESSIVE: Blokkeer ALLE events die navigatie kunnen triggeren
    const blockNavigation = (e: Event) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (e.cancelable) {
        e.preventDefault();
      }
      return false;
    };

    const navigationEvents = [
      'click',
      'dblclick',
      'mousedown',
      'mouseup',
      'touchstart',
      'touchend',
      'touchmove',
      'contextmenu',
      'pointerdown',
      'pointerup',
    ];

    // Capture phase blocking
    navigationEvents.forEach(eventType => {
      wrapper.addEventListener(eventType, blockNavigation, { capture: true, passive: false });
    });

    // Document level blocking voor events die van de map komen
    const blockDocumentEvents = (e: Event) => {
      const target = e.target as HTMLElement;
      if (wrapper.contains(target)) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };

    navigationEvents.forEach(eventType => {
      document.addEventListener(eventType, blockDocumentEvents, { capture: true, passive: false });
    });

    return () => {
      navigationEvents.forEach(eventType => {
        wrapper.removeEventListener(eventType, blockNavigation, { capture: true } as any);
        document.removeEventListener(eventType, blockDocumentEvents, { capture: true } as any);
      });
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        isolation: 'isolate',
        zIndex: 1,
        pointerEvents: 'auto',
      }}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        e.nativeEvent.stopImmediatePropagation();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        e.nativeEvent.stopImmediatePropagation();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }}
      onMouseUp={(e) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }}
    >
      {children}
    </div>
  );
}

// Custom Zoom Controls die WEL werken
function CustomZoomControls() {
  const map = useMap();
  const [zoom, setZoom] = React.useState(map.getZoom());

  useEffect(() => {
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
    map.zoomIn();
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    map.zoomOut();
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 shadow-xl">
      <button
        type="button"
        onClick={handleZoomIn}
        className="w-12 h-12 bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-lg flex items-center justify-center text-2xl font-bold text-gray-700 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-600 transition-all duration-200 active:scale-95 shadow-md"
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        type="button"
        onClick={handleZoomOut}
        className="w-12 h-12 bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-lg flex items-center justify-center text-2xl font-bold text-gray-700 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-600 transition-all duration-200 active:scale-95 shadow-md"
        aria-label="Zoom out"
      >
        −
      </button>
    </div>
  );
}

// Component om Leaflet map events te gebruiken zonder navigatie
function MapEventHandler({ onCaregiverSelect }: { onCaregiverSelect?: (caregiver: Caregiver) => void }) {
  useMapEvents({
    click: (e) => {
      e.originalEvent.stopPropagation();
      e.originalEvent.stopImmediatePropagation();
    },
  });

  return null;
}

const ModernMap: React.FC<ModernMapProps> = ({
  caregivers = [],
  center = [50.8503, 4.3517], // Brussel default
  zoom = 10,
  onCaregiverSelect,
  country = 'BE',
}) => {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const caregiversWithCoords = useMemo(() => {
    return caregivers.filter(c => c.lat != null && c.lng != null && !isNaN(c.lat) && !isNaN(c.lng));
  }, [caregivers]);

  const mapCenter = useMemo(() => {
    if (caregiversWithCoords.length === 0) {
      return center;
    }
    
    const lats = caregiversWithCoords.map(c => c.lat!);
    const lngs = caregiversWithCoords.map(c => c.lng!);
    
    const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
    
    return [avgLat, avgLng] as [number, number];
  }, [caregiversWithCoords, center]);

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
    <div className="w-full h-[400px] rounded-2xl overflow-hidden border-2 border-gray-200 shadow-xl relative bg-white">
      <MapIsolationWrapper>
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
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapEventHandler onCaregiverSelect={onCaregiverSelect} />
          <CustomZoomControls />

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
                <div className="p-3 min-w-[200px]">
                  <h3 className="font-bold text-base text-gray-900 mb-1">{caregiver.name}</h3>
                  {caregiver.city && (
                    <p className="text-sm text-gray-600 mb-2">{caregiver.city}</p>
                  )}
                  {caregiver.service && (
                    <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded inline-block">
                      {caregiver.service}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </MapIsolationWrapper>
    </div>
  );
};

export default ModernMap;
export { ModernMap };
