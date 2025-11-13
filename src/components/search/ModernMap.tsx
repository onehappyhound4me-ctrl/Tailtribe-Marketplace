'use client'

import { useEffect, useRef, useState } from 'react'

type Caregiver = {
  id: string | number
  user: { name?: string | null }
  city?: string | null
  hourlyRate?: number | null
  lat?: number | null
  lng?: number | null
}

const cityToCoords: Record<string, [number, number]> = {
  // België
  Antwerpen: [51.2194, 4.4025],
  Gent: [51.0543, 3.7174],
  Brussel: [50.8503, 4.3517],
  'Brussel-Stad': [50.8503, 4.3517],
  Leuven: [50.8798, 4.7005],
  Brugge: [51.2093, 3.2247],
  Hasselt: [50.9311, 5.3378],
  Charleroi: [50.4114, 4.4445],
  Liège: [50.6326, 5.5797],
  Namur: [50.4669, 4.8675],
  Mons: [50.4542, 3.9523],
  Mechelen: [51.0256, 4.4777],
  Aalst: [50.936, 4.0355],
  
  // Nederland
  Amsterdam: [52.3676, 4.9041],
  Rotterdam: [51.9244, 4.4777],
  Utrecht: [52.0907, 5.1214],
  'Den Haag': [52.0705, 4.3007],
  Eindhoven: [51.4416, 5.4697],
  Groningen: [53.2194, 6.5665],
  Tilburg: [51.5555, 5.0913],
  Almere: [52.3508, 5.2647],
  Breda: [51.5719, 4.7683],
  Nijmegen: [51.8426, 5.8526],
  Haarlem: [52.3874, 4.6462],
  Arnhem: [51.9851, 5.8987],
  Zaanstad: [52.4389, 4.8228],
  Apeldoorn: [52.2112, 5.9699],
  Maastricht: [50.8514, 5.6909],
}

// Belgium bounds - tighter focus
const BELGIUM_BOUNDS = [[49.5, 2.5], [51.5, 6.4]]

// Netherlands bounds
const NETHERLANDS_BOUNDS = [[50.7, 3.3], [53.6, 7.2]]

function ensureLeafletLoaded(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve()
    const win = window as any
    if (win.L) return resolve()
    
    const linkId = 'leaflet-css'
    const scriptId = 'leaflet-js'
    
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link')
      link.id = linkId
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    
    const onLoaded = () => resolve()
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.async = true
      script.onload = onLoaded
      document.body.appendChild(script)
    } else {
      onLoaded()
    }
  })
}

interface ModernMapProps {
  caregivers: Caregiver[]
  country?: 'BE' | 'NL'
  onCaregiverSelect?: (caregiver: Caregiver) => void
}

export function ModernMap({ caregivers, country = 'BE', onCaregiverSelect }: ModernMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const leafletRef = useRef<any>(null)
  const userMarkerRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const radiusCircleRef = useRef<any>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [radius, setRadius] = useState(10)
  const [showRadius, setShowRadius] = useState(true)
  const [mapReady, setMapReady] = useState(false)
  
  // Helper: center on provided location and render marker/circle
  const centerOnLocation = (coords: { lat: number; lng: number }, opts: { fit?: boolean } = {}) => {
    const L = leafletRef.current
    const map = mapInstanceRef.current
    if (!L || !map) return

    // clear previous
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current)
      userMarkerRef.current = null
    }
    if (radiusCircleRef.current) {
      map.removeLayer(radiusCircleRef.current)
      radiusCircleRef.current = null
    }

    // Avoid exact overlap with caregiver marker
    const tooCloseToCaregiver = (() => {
      const haversineKm = (a: {lat:number;lng:number}, b:{lat:number;lng:number}) => {
        const toRad = (x:number) => (x * Math.PI) / 180
        const R = 6371
        const dLat = toRad(b.lat - a.lat)
        const dLon = toRad(b.lng - a.lng)
        const lat1 = toRad(a.lat)
        const lat2 = toRad(b.lat)
        const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2
        return 2 * R * Math.asin(Math.sqrt(h))
      }
      return markersRef.current.some((m) => {
        const p = m.getLatLng()
        return haversineKm(coords, { lat: p.lat, lng: p.lng }) < 0.2
      })
    })()

    const adjusted = { ...coords }
    if (tooCloseToCaregiver) {
      adjusted.lat += 0.0045
      adjusted.lng += 0.0065
    }

    userMarkerRef.current = L.marker([adjusted.lat, adjusted.lng], {
      icon: L.divIcon({
        className: 'user-marker',
        html: `<div style="width: 14px; height: 14px; border-radius: 9999px; background: #2563eb; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      }),
      zIndexOffset: 1000
    }).addTo(map)

    if (showRadius) {
      radiusCircleRef.current = L.circle([adjusted.lat, adjusted.lng], {
        radius: radius * 1000,
        color: '#2563eb',
        weight: 2,
        fillColor: '#93c5fd',
        fillOpacity: 0.18
      }).addTo(map)
      if (opts.fit) {
        const b = radiusCircleRef.current.getBounds().pad(0.15)
        map.fitBounds(b)
      }
    } else {
      if (opts.fit) {
        map.setView([adjusted.lat, adjusted.lng], Math.max(map.getZoom(), 9))
      } else {
        map.panTo([adjusted.lat, adjusted.lng])
      }
    }
  }

  useEffect(() => {
    let map: any
    let markers: any[] = []

    // Cleanup existing map
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.off()
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markersRef.current = []
        userMarkerRef.current = null
        radiusCircleRef.current = null
      } catch (e) {
        console.warn('Cleanup warning:', e)
      }
    }

    // Clear map container
    if (mapRef.current) {
      mapRef.current.innerHTML = ''
      const anyRef = mapRef.current as any
      delete anyRef._leaflet_id
    }

    const mapRefElement = mapRef.current
    if (!mapRefElement) return

    ensureLeafletLoaded().then(() => {
      const win = window as any
      if (!mapRefElement || !win.L) return
      
      if (mapInstanceRef.current) {
        return
      }
      
      const L = win.L
      leafletRef.current = L
      
      const bounds = country === 'NL' ? NETHERLANDS_BOUNDS : BELGIUM_BOUNDS
      const center = country === 'NL' ? [52.3676, 4.9041] : [50.8503, 4.3517]
      const countryBounds = L.latLngBounds(bounds[0], bounds[1])
      
      // Create map - NO event blocking here, let Leaflet handle everything
      map = L.map(mapRefElement, {
        center: center,
        zoom: 8,
        maxBounds: countryBounds,
        maxBoundsViscosity: 1.0,
        minZoom: 7,
        maxZoom: 12,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
        touchZoom: true,
        worldCopyJump: false,
      })
      
      // CRITICAL: Prevent Leaflet zoom controls from triggering navigation
      // Intercept clicks on zoom control buttons BEFORE they bubble up
      map.whenReady(() => {
        // Find zoom control container
        const zoomControl = mapRefElement.querySelector('.leaflet-control-zoom')
        if (zoomControl) {
          // Stop all events on zoom control from bubbling
          const stopBubble = (e: Event) => {
            e.stopPropagation()
            e.stopImmediatePropagation()
          }
          
          zoomControl.addEventListener('click', stopBubble, true)
          zoomControl.addEventListener('mousedown', stopBubble, true)
          zoomControl.addEventListener('mouseup', stopBubble, true)
          zoomControl.addEventListener('touchstart', stopBubble, true)
          zoomControl.addEventListener('touchend', stopBubble, true)
          
          // Also stop events on individual buttons
          const zoomIn = zoomControl.querySelector('.leaflet-control-zoom-in')
          const zoomOut = zoomControl.querySelector('.leaflet-control-zoom-out')
          
          if (zoomIn) {
            zoomIn.addEventListener('click', stopBubble, true)
            zoomIn.addEventListener('mousedown', stopBubble, true)
            zoomIn.addEventListener('mouseup', stopBubble, true)
          }
          
          if (zoomOut) {
            zoomOut.addEventListener('click', stopBubble, true)
            zoomOut.addEventListener('mousedown', stopBubble, true)
            zoomOut.addEventListener('mouseup', stopBubble, true)
          }
        }
      })
      
      mapInstanceRef.current = map

      // Add tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      }).addTo(map)

      // Add scale control
      L.control.scale({ imperial: false }).addTo(map)
      
      setMapReady(true)

      // Create caregiver markers
      caregivers.forEach((c) => {
        const city = (c.city || '').trim()
        let coords: [number, number] | undefined
        if (typeof c.lat === 'number' && typeof c.lng === 'number') {
          coords = [c.lat, c.lng]
        } else if (cityToCoords[city]) {
          coords = cityToCoords[city]
        } else {
          const aliases: Record<string, string> = {
            'brussel stad': 'Brussel-Stad',
            'brussel-stad': 'Brussel-Stad',
            'brussel': 'Brussel',
          }
          const key = city.toLowerCase().replace(/\s+/g, ' ').trim()
          const mapped = aliases[key]
          if (mapped && cityToCoords[mapped]) {
            coords = cityToCoords[mapped]
          }
        }
        if (!coords) return
        
        const marker = L.marker(coords as any, {
          icon: L.divIcon({
            className: 'caregiver-marker',
            html: `<div style="width: 16px; height: 16px; border-radius: 9999px; background: hsl(var(--tt-primary)); border: 2px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.25); cursor: pointer;"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
        }).addTo(map)
        
        const popupContent = `
          <div class="p-4 min-w-[250px]">
            <div class="font-semibold text-gray-900 mb-2 text-lg">${(c.user?.name || 'Verzorger')}</div>
            <div class="text-gray-600 text-sm mb-2">📍 ${city}</div>
            ${c.hourlyRate ? `<div class="text-emerald-600 font-bold text-lg">€${c.hourlyRate}/uur</div>` : ''}
            <button 
              class="mt-3 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors w-full" 
              data-caregiver-id="${c.id}"
            >
              Bekijk profiel
            </button>
          </div>
        `
        
        marker.bindPopup(popupContent)
        
        marker.on('popupopen', () => {
          const popup = marker.getPopup()
          if (popup) {
            const popupElement = popup.getElement()
            const button = popupElement?.querySelector('[data-caregiver-id]')
            if (button) {
              button.addEventListener('click', () => {
                if (onCaregiverSelect) {
                  onCaregiverSelect(c)
                }
              })
            }
          }
        })
        
        marker.on('click', () => {
          onCaregiverSelect?.(c)
        })
        
        markers.push(marker)
      })

      markersRef.current = markers

      // Fit map to markers or country
      if (markers.length > 0) {
        const group = L.featureGroup(markers)
        const markersBounds = group.getBounds()
        if (countryBounds.intersects(markersBounds)) {
          map.fitBounds(markersBounds.pad(0.2))
        } else {
          map.fitBounds(countryBounds)
        }
      } else {
        map.setView(center as [number, number], 8)
      }
    })

    return () => {
      try {
        const cleanupMap = mapInstanceRef.current
        if (cleanupMap) {
          cleanupMap.off()
          cleanupMap.remove()
        }
        if (mapRefElement) {
          mapRefElement.innerHTML = ''
          const anyRef = mapRefElement as any
          delete anyRef._leaflet_id
        }
        mapInstanceRef.current = null
        markersRef.current = []
        setMapReady(false)
      } catch (e) {
        console.warn('Cleanup error:', e)
      }
    }
  }, [caregivers, country, onCaregiverSelect])

  // Update user location marker and radius
  useEffect(() => {
    const L = leafletRef.current
    const map = mapInstanceRef.current
    if (!L || !map || !userLocation) return

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: L.divIcon({
          className: 'user-marker',
          html: `<div style="width: 14px; height: 14px; border-radius: 9999px; background: #2563eb; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })
      }).addTo(map)
    } else {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng])
    }

    if (showRadius) {
      if (!radiusCircleRef.current) {
        radiusCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
          radius: radius * 1000,
          color: '#2563eb',
          weight: 2,
          fillColor: '#93c5fd',
          fillOpacity: 0.18
        }).addTo(map)
      } else {
        radiusCircleRef.current.setLatLng([userLocation.lat, userLocation.lng])
        radiusCircleRef.current.setRadius(radius * 1000)
      }
    } else if (radiusCircleRef.current) {
      map.removeLayer(radiusCircleRef.current)
      radiusCircleRef.current = null
    }

    // Dim markers outside radius
    const haversineKm = (a: {lat:number;lng:number}, b:{lat:number;lng:number}) => {
      const toRad = (x:number) => (x * Math.PI) / 180
      const R = 6371
      const dLat = toRad(b.lat - a.lat)
      const dLon = toRad(b.lng - a.lng)
      const lat1 = toRad(a.lat)
      const lat2 = toRad(b.lat)
      const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2
      return 2 * R * Math.asin(Math.sqrt(h))
    }

    markersRef.current.forEach((m) => {
      const el = m.getElement?.()
      if (!el) return
      if (showRadius) {
        const p = m.getLatLng()
        const d = haversineKm(userLocation, { lat: p.lat, lng: p.lng })
        el.style.opacity = d <= radius ? '1' : '0.35'
      } else {
        el.style.opacity = '1'
      }
    })
  }, [userLocation, radius, showRadius])

  // Request browser geolocation
  const handleLocateMe = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!navigator.geolocation) {
      alert('Geolocatie wordt niet ondersteund door je browser')
      return
    }
    const L = leafletRef.current
    if (!L) return
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const inside = lat >= BELGIUM_BOUNDS[0][0] && lat <= BELGIUM_BOUNDS[1][0] && lng >= BELGIUM_BOUNDS[0][1] && lng <= BELGIUM_BOUNDS[1][1]
        const coords = inside ? { lat, lng } : { lat: 50.8503, lng: 4.3517 }
        setUserLocation(coords)
        centerOnLocation(coords, { fit: true })
      },
      (error) => {
        console.error('Geolocation error:', error)
        alert('Kon je locatie niet bepalen. Controleer je browser instellingen.')
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
    )
  }

  return (
    <div className="relative w-full">
      {/* Controls */}
      <div className="absolute top-2 right-2 md:top-4 md:right-4 z-[1000]">
        <div className="card-tt p-2 md:p-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3 bg-white/95 backdrop-blur-sm shadow-lg rounded-lg">
          <button
            onClick={handleLocateMe}
            className="btn-accent text-xs px-2 py-1 md:px-3 md:py-1.5 whitespace-nowrap"
            type="button"
          >
            📍 Locatie
          </button>
          <div className="hidden sm:block h-5 w-px bg-black/10 dark:bg-white/10" />
          <div className="flex items-center gap-2">
            <label className="text-xs text-foreground flex items-center gap-1.5">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-brand focus:ring-brand w-3.5 h-3.5"
                checked={showRadius}
                onChange={(e) => {
                  e.stopPropagation()
                  setShowRadius(e.target.checked)
                }}
              />
              <span className="hidden sm:inline">Radius</span>
            </label>
            {showRadius && (
              <select
                value={radius}
                onChange={(e) => {
                  e.stopPropagation()
                  setRadius(Number(e.target.value))
                }}
                className="input-tt text-xs py-1 px-1 md:px-2 min-w-[60px]"
                onClick={(e) => e.stopPropagation()}
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
                <option value={50}>50 km</option>
              </select>
            )}
          </div>
          <div className="hidden md:block ml-2 text-xs text-muted-foreground whitespace-nowrap">
            {caregivers.length} in {country === 'NL' ? 'NL' : 'BE'}
          </div>
        </div>
      </div>

      {/* Map Container - Prevent ALL events from bubbling to parent */}
      <div 
        className="map-container h-[400px] md:h-[500px] bg-gray-100 rounded-lg relative overflow-hidden w-full"
        onMouseDown={(e) => {
          e.stopPropagation()
        }}
        onMouseUp={(e) => {
          e.stopPropagation()
        }}
        onClick={(e) => {
          e.stopPropagation()
        }}
        onWheel={(e) => {
          e.stopPropagation()
        }}
        onTouchStart={(e) => {
          e.stopPropagation()
        }}
        onTouchMove={(e) => {
          e.stopPropagation()
        }}
        onTouchEnd={(e) => {
          e.stopPropagation()
        }}
        style={{ 
          touchAction: 'pan-y pinch-zoom', // Allow vertical scroll and pinch zoom
          position: 'relative',
          zIndex: 1,
          isolation: 'isolate' // CSS isolation to prevent event bubbling
        }}
      >
        <div 
          ref={mapRef} 
          className="w-full h-full" 
          key={`map-${country}-${caregivers.length}`}
          onMouseDown={(e) => {
            e.stopPropagation()
          }}
          onMouseUp={(e) => {
            e.stopPropagation()
          }}
          onClick={(e) => {
            e.stopPropagation()
          }}
          style={{ touchAction: 'none' }} // Leaflet handles its own touch
        />
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-emerald-600 mx-auto mb-3"></div>
              <p className="text-sm text-gray-600 font-medium">Kaart laden...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
