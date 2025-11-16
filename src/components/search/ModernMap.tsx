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
    // Gebruik capture phase (true) om events TE INTERCEPTEREN voordat ze naar parent gaan
    const blockNavigation = (e: Event) => {
      // CRITICAL: Stop propagation VOORDAT event naar parent gaat
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      // Prevent default alleen voor events die dat ondersteunen
      if (e.cancelable) {
        e.preventDefault();
      }
      
      // Extra beveiliging: return false voor oude browsers
      return false;
    };

    // Lijst van events die navigatie kunnen triggeren
    const navigationEvents = [
      'click',
      'dblclick',
      'mousedown',
      'mouseup',
      'touchstart',
      'touchend',
      'touchmove',
      'contextmenu',
      'wheel',
      'scroll',
      'keydown',
      'keyup',
      'pointerdown',
      'pointerup',
    ];

    // Voeg listeners toe op CAPTURE phase (true = capture phase)
    // Dit betekent dat we events ONTVANGEN VOORDAT ze naar child elements gaan
    navigationEvents.forEach(eventType => {
      wrapper.addEventListener(eventType, blockNavigation, { capture: true, passive: false });
    });

    // Extra beveiliging: blokkeer ook events op alle child elements (bubbling phase)
    const blockChildEvents = (e: Event) => {
      const target = e.target as HTMLElement;
      
      // Laat Leaflet zoom controls werken, maar blokkeer navigatie
      if (target.closest('.leaflet-control-zoom')) {
        // Zoom controls mogen werken, maar geen navigatie naar parent
        e.stopPropagation();
        e.stopImmediatePropagation();
      } else {
        // Alle andere events volledig blokkeren
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (e.cancelable) {
          e.preventDefault();
        }
      }
      
      return false;
    };

    // Blokkeer events op alle child elements (bubbling phase)
    navigationEvents.forEach(eventType => {
      wrapper.addEventListener(eventType, blockChildEvents, { capture: false, passive: false });
    });

    // EXTRA: Blokkeer ook events op document niveau als ze van de map komen
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

    // Blokkeer events op document niveau (alleen voor events die van de map komen)
    navigationEvents.forEach(eventType => {
      document.addEventListener(eventType, blockDocumentEvents, { capture: true, passive: false });
    });

    return () => {
      // Cleanup: verwijder alle listeners
      navigationEvents.forEach(eventType => {
        wrapper.removeEventListener(eventType, blockNavigation, { capture: true } as any);
        wrapper.removeEventListener(eventType, blockChildEvents, { capture: false } as any);
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
        isolation: 'isolate', // CSS isolation om stacking context te creëren
        zIndex: 1,
        pointerEvents: 'auto', // Zorg dat pointer events werken binnen de map
      }}
      // Extra React event handlers als backup
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
      onTouchStart={(e) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }}
      onTouchEnd={(e) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }}
    >
      {children}
    </div>
  );
}

// Component om Leaflet map events te gebruiken zonder navigatie
function MapEventHandler({ onCaregiverSelect }: { onCaregiverSelect?: (caregiver: Caregiver) => void }) {
  useMapEvents({
    click: (e) => {
      // Blokkeer event propagation naar parent
      e.originalEvent.stopPropagation();
      e.originalEvent.stopImmediatePropagation();
    },
    zoomstart: () => {
      // Blokkeer zoom events van navigatie
      const event = window.event;
      if (event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
      }
    },
  });

  return null;
}

// Component om zoom controls specifiek te beschermen EN WERKENDE ZOOM TOESTAAN
function ZoomControlsProtector() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    
    // Functie om zoom controls te beschermen maar WEL WERKENDE ZOOM TOESTAAN
    const protectZoomControls = () => {
      const zoomControls = container.querySelectorAll('.leaflet-control-zoom a');
      zoomControls.forEach(control => {
        // CRITICAL: Blokkeer navigatie maar laat Leaflet's eigen zoom handler werken
        const handleZoomClick = (e: MouseEvent) => {
          // Laat Leaflet's eigen zoom logica werken door NIET preventDefault te roepen
          // Maar blokkeer WEL event propagation naar parent elementen
          e.stopPropagation();
          e.stopImmediatePropagation();
          
          // NIET preventDefault() - laat Leaflet de zoom uitvoeren
          // Leaflet heeft zijn eigen click handler die we niet moeten blokkeren
        };
        
        // Voeg listener toe op CAPTURE phase zodat we VOORDAT Leaflet handelt kunnen ingrijpen
        // Maar we blokkeren alleen propagation, niet de default actie
        control.addEventListener('click', handleZoomClick, { capture: true, passive: false });
        control.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          e.stopImmediatePropagation();
        }, { capture: true, passive: false });
        control.addEventListener('mouseup', (e) => {
          e.stopPropagation();
          e.stopImmediatePropagation();
        }, { capture: true, passive: false });
        
        // Blokkeer ook touch events voor mobile
        control.addEventListener('touchstart', (e) => {
          e.stopPropagation();
          e.stopImmediatePropagation();
        }, { capture: true, passive: false });
        control.addEventListener('touchend', (e) => {
          e.stopPropagation();
          e.stopImmediatePropagation();
        }, { capture: true, passive: false });
      });
    };

    // Bescherm zoom controls direct na mount
    setTimeout(() => {
      protectZoomControls();
    }, 100);

    // Blokkeer ook nieuwe zoom controls die later worden toegevoegd
    const observer = new MutationObserver(() => {
      setTimeout(() => {
        protectZoomControls();
      }, 50);
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    // Ook periodiek checken (voor het geval dat)
    const interval = setInterval(() => {
      protectZoomControls();
    }, 500);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [map]);

  return null;
}

const ModernMap: React.FC<ModernMapProps> = ({
  caregivers = [],
  center = [50.8503, 4.3517], // Brussel default
  zoom = 10,
  onCaregiverSelect,
  country = 'BE',
}) => {
  // Filter caregivers met coördinaten
  const caregiversWithCoords = useMemo(() => {
    return caregivers.filter(c => c.lat != null && c.lng != null && !isNaN(c.lat) && !isNaN(c.lng));
  }, [caregivers]);

  // Bereken center op basis van caregivers als er geen center is gegeven
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

  if (caregiversWithCoords.length === 0) {
    return (
      <div className="w-full h-[400px] rounded-2xl bg-gray-100 flex items-center justify-center text-sm text-gray-500 border border-gray-200">
        Geen locaties beschikbaar voor kaartweergave
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-gray-200 shadow-lg relative">
      <MapIsolationWrapper>
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
          zoomControl={true}
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
          <ZoomControlsProtector />

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
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-sm">{caregiver.name}</h3>
                  {caregiver.city && (
                    <p className="text-xs text-gray-600">{caregiver.city}</p>
                  )}
                  {caregiver.service && (
                    <p className="text-xs text-emerald-600 mt-1">{caregiver.service}</p>
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
