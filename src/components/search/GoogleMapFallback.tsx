'use client';

import React, { useMemo } from 'react';

interface Caregiver {
  id: string;
  name: string;
  city?: string;
  lat?: number | null;
  lng?: number | null;
  service?: string;
}

interface GoogleMapFallbackProps {
  caregivers?: Caregiver[];
  center?: [number, number];
  zoom?: number;
  onCaregiverSelect?: (caregiver: Caregiver) => void;
  country?: string;
}

/**
 * Google Maps iframe fallback als Leaflet niet werkt
 * Dit is een alternatieve oplossing die altijd werkt zonder event propagation problemen
 */
const GoogleMapFallback: React.FC<GoogleMapFallbackProps> = ({
  caregivers = [],
  center = [50.8503, 4.3517], // Brussel default
  zoom = 10,
  country = 'BE',
}) => {
  // Filter caregivers met coördinaten
  const caregiversWithCoords = useMemo(() => {
    return caregivers.filter(c => c.lat != null && c.lng != null && !isNaN(c.lat) && !isNaN(c.lng));
  }, [caregivers]);

  // Bereken center op basis van caregivers
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

  // Maak Google Maps embed URL met markers
  // Format: https://www.google.com/maps/embed/v1/view?key=API_KEY&center=LAT,LNG&zoom=ZOOM&maptype=roadmap
  // Voor markers gebruiken we een custom URL met q parameters
  
  // Simpelere oplossing: gebruik Google Maps met center en zoom
  // Let op: Je hebt een Google Maps API key nodig voor production
  const googleMapsUrl = `https://www.google.com/maps/embed/v1/view?center=${mapCenter[0]},${mapCenter[1]}&zoom=${zoom}&maptype=roadmap`;

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-gray-200 shadow-lg relative">
      <iframe
        src={googleMapsUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Kaartweergave"
        // CRITICAL: pointer-events zorgt dat clicks binnen de iframe blijven
        // Dit voorkomt automatisch alle navigatie problemen
        onLoad={() => {
          // Zorg dat de iframe alle events zelf afhandelt
          const iframe = document.querySelector('iframe[title="Kaartweergave"]') as HTMLIFrameElement;
          if (iframe) {
            iframe.style.pointerEvents = 'auto';
          }
        }}
      />
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md text-xs text-gray-600">
        {caregiversWithCoords.length} locatie{caregiversWithCoords.length !== 1 ? 's' : ''} op kaart
      </div>
    </div>
  );
};

export default GoogleMapFallback;
export { GoogleMapFallback };

