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
  const containerRef = useRef<HTMLDivElement>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [radius, setRadius] = useState(10)
  const [showRadius, setShowRadius] = useState(true)
  const [mapError, setMapError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)
  
  // Debug logging
  console.log('🗺️ ModernMap received:', {
    caregiverCount: caregivers?.length || 0,
    country,
    caregivers: caregivers?.map(c => ({ name: c.user?.name, lat: c.lat, lng: c.lng })),
    hasCoordinates: caregivers?.some(c => c.lat && c.lng)
  })

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

    // Avoid exact overlap with caregiver marker: if too close, nudge user marker slightly
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
      const nearest = markersRef.current.some((m) => {
        const p = m.getLatLng()
        return haversineKm(coords, { lat: p.lat, lng: p.lng }) < 0.2 // < 200m
      })
      return nearest
    })()

    const adjusted = { ...coords }
    if (tooCloseToCaregiver) {
      // Nudge ~500m north-east, keep within country bounds
      const mapInstance = mapInstanceRef.current
      if (mapInstance) {
        const currentBounds = mapInstance.options.maxBounds
        if (currentBounds) {
          adjusted.lat = Math.min(adjusted.lat + 0.0045, currentBounds.getNorth())
          adjusted.lng = Math.min(adjusted.lng + 0.0065, currentBounds.getEast())
        } else {
          adjusted.lat += 0.0045
          adjusted.lng += 0.0065
        }
      }
    }

    userMarkerRef.current = L.marker([adjusted.lat, adjusted.lng], {
      icon: L.divIcon({
        className: 'user-marker',
        html: `<div class=\"w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-md\"></div>`,
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
        // pan without changing zoom
        map.panTo([adjusted.lat, adjusted.lng])
      }
    }

    // If still too close visually, nudge the viewport slightly so markers don't overlap under the circle center
    try {
      const near = markersRef.current.some((m) => {
        const p = m.getLatLng()
        const dx = Math.abs(p.lng - adjusted.lng)
        const dy = Math.abs(p.lat - adjusted.lat)
        return dx < 0.002 && dy < 0.002
      })
      if (near) {
        setTimeout(() => {
          map.panBy([0, 60], { animate: true })
        }, 0)
      }
    } catch {}
  }

  useEffect(() => {
    let map: any
    let markers: any[] = []
    let userMarker: any = null
    let radiusCircle: any = null

    // FORCE CLEANUP FIRST if map already exists
    if (mapInstanceRef.current) {
      try {
        console.log('🧹 Cleaning up existing map...')
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

    // Clear the map container HTML
    if (mapRef.current) {
      mapRef.current.innerHTML = ''
      const anyRef = mapRef.current as any
      delete anyRef._leaflet_id
    }

    const mapRefElement = mapRef.current
    const containerElement = containerRef.current
    
    if (!mapRefElement || !containerElement) return

    ensureLeafletLoaded().then(() => {
      const win = window as any
      if (!mapRefElement || !win.L) return
      
      // Double check no map exists
      if (mapInstanceRef.current) {
        console.log('⚠️ Map still exists, skipping init')
        return
      }
      
      const L = win.L
      leafletRef.current = L
      
      // Determine bounds and center based on country
      const bounds = country === 'NL' ? NETHERLANDS_BOUNDS : BELGIUM_BOUNDS
      const center = country === 'NL' ? [52.3676, 4.9041] : [50.8503, 4.3517] // Amsterdam or Brussels
      const countryBounds = L.latLngBounds(bounds[0], bounds[1])
      
      console.log(`🗺️ Initializing map for: ${country}, center:`, center)
      console.log(`🗺️ Caregivers to map:`, caregivers.length)
      
      // CRITICAL: Prevent ALL events from bubbling up to parent
      // This must be done BEFORE creating the map
      const stopAllEvents = (e: Event) => {
        e.stopPropagation()
        e.stopImmediatePropagation()
        // Don't prevent default for map interactions, only stop bubbling
      }
      
      // Add event listeners to container BEFORE map creation
      containerElement.addEventListener('click', stopAllEvents, true)
      containerElement.addEventListener('dblclick', stopAllEvents, true)
      containerElement.addEventListener('wheel', stopAllEvents, true)
      containerElement.addEventListener('touchstart', stopAllEvents, true)
      containerElement.addEventListener('touchmove', stopAllEvents, true)
      containerElement.addEventListener('touchend', stopAllEvents, true)
      containerElement.addEventListener('mousedown', stopAllEvents, true)
      containerElement.addEventListener('mouseup', stopAllEvents, true)
      containerElement.addEventListener('mousemove', stopAllEvents, true)
      containerElement.addEventListener('contextmenu', stopAllEvents, true)
      
      // Create map with country-specific focus
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
        // CRITICAL: Prevent map from interfering with page scroll
        worldCopyJump: false,
      })
      
      // CRITICAL: Stop ALL map events from propagating
      const stopMapEvents = (e: any) => {
        if (e.originalEvent) {
          e.originalEvent.stopPropagation()
          e.originalEvent.stopImmediatePropagation()
        }
      }
      
      // Listen to ALL map events and stop propagation
      map.on('zoomstart', stopMapEvents)
      map.on('zoom', stopMapEvents)
      map.on('zoomend', stopMapEvents)
      map.on('movestart', stopMapEvents)
      map.on('move', stopMapEvents)
      map.on('moveend', stopMapEvents)
      map.on('dragstart', stopMapEvents)
      map.on('drag', stopMapEvents)
      map.on('dragend', stopMapEvents)
      map.on('click', stopMapEvents)
      map.on('dblclick', stopMapEvents)
      map.on('mousedown', stopMapEvents)
      map.on('mouseup', stopMapEvents)
      map.on('mousemove', stopMapEvents)
      map.on('contextmenu', stopMapEvents)
      
      // Also prevent events on the map container element itself
      mapRefElement.addEventListener('click', stopAllEvents, true)
      mapRefElement.addEventListener('dblclick', stopAllEvents, true)
      mapRefElement.addEventListener('wheel', stopAllEvents, true)
      mapRefElement.addEventListener('touchstart', stopAllEvents, true)
      mapRefElement.addEventListener('touchmove', stopAllEvents, true)
      mapRefElement.addEventListener('touchend', stopAllEvents, true)
      
      mapInstanceRef.current = map

      // Add tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      }).addTo(map)

      // Add scale control
      L.control.scale({ imperial: false }).addTo(map)
      
      // Mark map as ready
      setMapReady(true)
      console.log('✅ Map initialized successfully')

      // Create caregiver markers
      let firstMarkerLatLng: any = null
      caregivers.forEach((c) => {
        const city = (c.city || '').trim()
        let coords: [number, number] | undefined
        // Prefer precise coordinates from backend if available
        if (typeof c.lat === 'number' && typeof c.lng === 'number') {
          coords = [c.lat, c.lng]
        } else if (cityToCoords[city]) {
          coords = cityToCoords[city]
        } else {
          // Try common aliases
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
            html: `<div style="
              width: 16px;
              height: 16px;
              border-radius: 9999px;
              background: hsl(var(--tt-primary));
              border: 2px solid #ffffff;
              box-shadow: 0 4px 10px rgba(0,0,0,0.25);
              cursor: pointer;
            "></div>`,
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
        
        // Add click listener to popup button
        marker.on('popupopen', () => {
          const popup = marker.getPopup()
          if (popup) {
            const popupElement = popup.getElement()
            const button = popupElement?.querySelector('[data-caregiver-id]')
            if (button) {
              button.addEventListener('click', (e) => {
                e.stopPropagation()
                e.stopImmediatePropagation()
                if (onCaregiverSelect) {
                  onCaregiverSelect(c)
                }
              })
            }
          }
        })
        
        marker.on('click', (e) => {
          if (e.originalEvent) {
            e.originalEvent.stopPropagation()
            e.originalEvent.stopImmediatePropagation()
          }
          onCaregiverSelect?.(c)
        })
        
        markers.push(marker)
        if (!firstMarkerLatLng) firstMarkerLatLng = marker.getLatLng()
      })

      // store markers for later radius updates
      markersRef.current = markers

        // ALWAYS focus on selected country first
        console.log(`🗺️ Fitting map to ${country} bounds, markers: ${markers.length}`)
        
        if (markers.length > 0) {
          // Check if markers are in current country bounds
          const group = L.featureGroup(markers)
          const markersBounds = group.getBounds()
          
          if (countryBounds.intersects(markersBounds)) {
            // Markers are in this country - zoom to them
            map.fitBounds(markersBounds.pad(0.2))
            console.log(`✅ Zooming to ${markers.length} markers in ${country}`)
          } else {
            // Markers outside country - just show country
            map.fitBounds(countryBounds)
            console.log(`⚠️ Markers outside ${country}, showing country bounds`)
          }
        } else {
          // No markers - ALWAYS show country center
          console.log(`ℹ️ No markers, showing ${country} center:`, center)
          map.setView(center as [number, number], 8)
        }
    })

    return () => {
      try {
        console.log('🧹 Cleanup effect running...')
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
        // Note: Event listeners are automatically cleaned up when element is removed
        // No need to manually remove them
        mapInstanceRef.current = null
        markersRef.current = []
        setMapReady(false)
      } catch (e) {
        console.warn('Cleanup error:', e)
      }
    }
  }, [caregivers, country, onCaregiverSelect])

  // Update radius visuals and marker dimming when userLocation/radius/toggle changes
  useEffect(() => {
    const L = leafletRef.current
    const map = mapInstanceRef.current
    if (!L || !map) return
    if (!userLocation) return

    // ensure user marker exists
    if (!userMarkerRef.current) {
      try {
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
          icon: L.divIcon({
            className: 'user-marker',
            html: `<div class=\"w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-md\"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          })
        }).addTo(map)
      } catch (e) {
        console.error('Error adding user marker:', e)
        return
      }
    } else {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng])
    }

    // circle handling
    if (showRadius) {
      if (!radiusCircleRef.current) {
        try {
          radiusCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
            radius: radius * 1000,
            color: '#2563eb',
            weight: 2,
            fillColor: '#93c5fd',
            fillOpacity: 0.18
          }).addTo(map)
        } catch (e) {
          console.error('Error adding radius circle:', e)
          return
        }
      } else {
        radiusCircleRef.current.setLatLng([userLocation.lat, userLocation.lng])
        radiusCircleRef.current.setRadius(radius * 1000)
      }

      // keep view approximately within circle without leaving Belgium bounds
      try {
        const circleBounds = radiusCircleRef.current.getBounds().pad(0.1)
        map.fitBounds(circleBounds, { animate: false })
      } catch {}
    } else if (radiusCircleRef.current) {
      map.removeLayer(radiusCircleRef.current)
      radiusCircleRef.current = null
    }

    // dim markers outside radius
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

  // Request browser geolocation and center, respecting Belgium bounds
  const handleLocateMe = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!navigator.geolocation) return
    const L = leafletRef.current
    if (!L) return
    const belgiumBounds = L.latLngBounds(BELGIUM_BOUNDS[0], BELGIUM_BOUNDS[1])
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const inside = lat >= BELGIUM_BOUNDS[0][0] && lat <= BELGIUM_BOUNDS[1][0] && lng >= BELGIUM_BOUNDS[0][1] && lng <= BELGIUM_BOUNDS[1][1]
        const coords = inside ? { lat, lng } : { lat: 50.8503, lng: 4.3517 }
        setUserLocation(coords)
        centerOnLocation(coords, { fit: true })
      },
      () => {
        const coords = { lat: 50.8503, lng: 4.3517 }
        setUserLocation(coords)
        centerOnLocation(coords, { fit: true })
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
    )
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full"
      onClick={(e) => {
        e.stopPropagation()
        if (e.nativeEvent) {
          (e.nativeEvent as any).stopImmediatePropagation()
        }
      }}
      onWheel={(e) => {
        e.stopPropagation()
        if (e.nativeEvent) {
          (e.nativeEvent as any).stopImmediatePropagation()
        }
      }}
      onTouchStart={(e) => {
        e.stopPropagation()
        if (e.nativeEvent) {
          (e.nativeEvent as any).stopImmediatePropagation()
        }
      }}
      onTouchMove={(e) => {
        e.stopPropagation()
        if (e.nativeEvent) {
          (e.nativeEvent as any).stopImmediatePropagation()
        }
      }}
      onTouchEnd={(e) => {
        e.stopPropagation()
        if (e.nativeEvent) {
          (e.nativeEvent as any).stopImmediatePropagation()
        }
      }}
      onMouseDown={(e) => {
        e.stopPropagation()
        if (e.nativeEvent) {
          (e.nativeEvent as any).stopImmediatePropagation()
        }
      }}
      onMouseUp={(e) => {
        e.stopPropagation()
        if (e.nativeEvent) {
          (e.nativeEvent as any).stopImmediatePropagation()
        }
      }}
      style={{ 
        touchAction: 'none',
        isolation: 'isolate' // CSS isolation to prevent event bubbling
      }}
    >
      {/* Controls: Mijn locatie + Radius - RESPONSIVE voor mobile */}
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

      {/* Map Container - FULLY ISOLATED */}
      <div 
        className="map-container h-[400px] md:h-[500px] bg-gray-100 rounded-lg relative overflow-hidden w-full"
        onClick={(e) => {
          e.stopPropagation()
          if (e.nativeEvent) {
            (e.nativeEvent as any).stopImmediatePropagation()
          }
        }}
        onWheel={(e) => {
          e.stopPropagation()
          if (e.nativeEvent) {
            (e.nativeEvent as any).stopImmediatePropagation()
          }
        }}
        onTouchStart={(e) => {
          e.stopPropagation()
          if (e.nativeEvent) {
            (e.nativeEvent as any).stopImmediatePropagation()
          }
        }}
        onTouchMove={(e) => {
          e.stopPropagation()
          if (e.nativeEvent) {
            (e.nativeEvent as any).stopImmediatePropagation()
          }
        }}
        onTouchEnd={(e) => {
          e.stopPropagation()
          if (e.nativeEvent) {
            (e.nativeEvent as any).stopImmediatePropagation()
          }
        }}
        onMouseDown={(e) => {
          e.stopPropagation()
          if (e.nativeEvent) {
            (e.nativeEvent as any).stopImmediatePropagation()
          }
        }}
        onMouseUp={(e) => {
          e.stopPropagation()
          if (e.nativeEvent) {
            (e.nativeEvent as any).stopImmediatePropagation()
          }
        }}
        style={{ 
          touchAction: 'none',
          isolation: 'isolate',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div 
          ref={mapRef} 
          className="w-full h-full" 
          key={`map-${country}-${caregivers.length}`}
          onClick={(e) => {
            e.stopPropagation()
            if (e.nativeEvent) {
              (e.nativeEvent as any).stopImmediatePropagation()
            }
          }}
          style={{ touchAction: 'none' }}
        />
        {/* Loading overlay - shows until map is initialized */}
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
