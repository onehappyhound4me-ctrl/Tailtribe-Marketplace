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

// Component om ALLE map events te blokkeren die navigatie kunnen triggeren
function MapEventBlocker() {
  const map = useMap();

  useEffect(() => {
    const mapContainer = map.getContainer();
    
    // Blokkeer ALLE events op capture phase (eerste fase)
    const blockEvent = (e: Event) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    // Lijst van alle events die navigatie kunnen triggeren
    const eventsToBlock = [
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
    ];

    // Voeg event listeners toe op capture phase (true = capture)
    eventsToBlock.forEach(eventType => {
      mapContainer.addEventListener(eventType, blockEvent, true);
    });

    // Blokkeer ook events op de zoom controls specifiek
    const blockZoomControls = () => {
      const zoomControls = document.querySelectorAll('.leaflet-control-zoom a');
      zoomControls.forEach(control => {
        eventsToBlock.forEach(eventType => {
          control.addEventListener(eventType, blockEvent, true);
        });
      });
    };

    // Blokkeer zoom controls direct
    blockZoomControls();

    // Blokkeer ook nieuwe zoom controls die later worden toegevoegd
    const observer = new MutationObserver(() => {
      blockZoomControls();
    });

    observer.observe(mapContainer, {
      childList: true,
      subtree: true,
    });

    return () => {
      // Cleanup: verwijder alle listeners
      eventsToBlock.forEach(eventType => {
        mapContainer.removeEventListener(eventType, blockEvent, true);
      });
      observer.disconnect();
    };
  }, [map]);

  return null;
}

// Component om map events te gebruiken zonder navigatie
function MapClickHandler({ onCaregiverSelect }: { onCaregiverSelect?: (caregiver: Caregiver) => void }) {
  useMapEvents({
    click: (e) => {
      // Blokkeer event propagation
      e.originalEvent.stopPropagation();
      e.originalEvent.stopImmediatePropagation();
      if (e.originalEvent.cancelable) {
        e.originalEvent.preventDefault();
      }
    },
    zoomstart: () => {
      // Blokkeer zoom events
      const event = window.event;
      if (event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        if (event.cancelable) {
          event.preventDefault();
        }
      }
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
  const mapRef = useRef<L.Map | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  // Extra event blocking op wrapper niveau
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const blockAllEvents = (e: Event) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    const events = ['click', 'dblclick', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'contextmenu'];
    events.forEach(eventType => {
      wrapper.addEventListener(eventType, blockAllEvents, true);
    });

    return () => {
      events.forEach(eventType => {
        wrapper.removeEventListener(eventType, blockAllEvents, true);
      });
    };
  }, []);

  if (caregiversWithCoords.length === 0) {
    return (
      <div className="w-full h-[400px] rounded-2xl bg-gray-100 flex items-center justify-center text-sm text-gray-500 border border-gray-200">
        Geen locaties beschikbaar voor kaartweergave
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="w-full h-[400px] rounded-2xl overflow-hidden border border-gray-200 shadow-lg relative"
      style={{ isolation: 'isolate' }}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      onMouseUp={(e) => {
        e.stopPropagation();
      }}
    >
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
        whenCreated={(map) => {
          mapRef.current = map;
          
          // Extra beveiliging: blokkeer alle events op de map container
          const container = map.getContainer();
          const blockEvent = (e: Event) => {
            e.stopPropagation();
            e.stopImmediatePropagation();
            if (e.cancelable) {
              e.preventDefault();
            }
          };

          ['click', 'dblclick', 'mousedown', 'mouseup', 'contextmenu'].forEach(eventType => {
            container.addEventListener(eventType, blockEvent, true);
          });

          // Blokkeer zoom control clicks specifiek
          setTimeout(() => {
            const zoomControls = container.querySelectorAll('.leaflet-control-zoom a');
            zoomControls.forEach(control => {
              ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend'].forEach(eventType => {
                control.addEventListener(eventType, blockEvent, true);
              });
            });
          }, 100);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEventBlocker />
        <MapClickHandler onCaregiverSelect={onCaregiverSelect} />

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
    </div>
  );
};

export default ModernMap;
export { ModernMap };
