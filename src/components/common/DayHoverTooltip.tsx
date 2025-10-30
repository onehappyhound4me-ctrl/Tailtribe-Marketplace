'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface TimeSegment {
  start: string
  end: string
}

interface Segments {
  available: TimeSegment[]
  booked: TimeSegment[]
  blocked: boolean
  isPast: boolean
  isWeekend?: boolean
}

interface Props {
  date: Date
  segments: Segments
  anchorEl: HTMLElement | null
  onRequestClose: () => void
  readOnly?: boolean
}

export function DayHoverTooltip({ date, segments, anchorEl, onRequestClose, readOnly = false }: Props) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!anchorEl) return

    const updatePosition = () => {
      const rect = anchorEl.getBoundingClientRect()
      const tooltipRect = tooltipRef.current?.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let left = rect.left + rect.width / 2
      let top = rect.bottom + 8

      // Flip horizontally if tooltip would overflow right edge
      if (tooltipRect && left + tooltipRect.width / 2 > viewportWidth) {
        left = rect.right - tooltipRect.width
      }

      // Flip vertically if tooltip would overflow bottom edge
      if (tooltipRect && top + tooltipRect.height > viewportHeight) {
        top = rect.top - tooltipRect.height - 8
      }

      setPosition({ top, left })
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [anchorEl])

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onRequestClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onRequestClose])

  // Use isWeekend from segments (passed from calendar) or calculate it
  const isWeekend = segments.isWeekend !== undefined ? segments.isWeekend : (date.getDay() === 0 || date.getDay() === 6)
  
  // Show tooltip if:
  // 1. Position is set
  // 2. Not past
  // 3. Has some data (available/booked/blocked) OR it's a weekend day (to show "weekend - not available")
  if (!position || segments.isPast || (!segments.available.length && !segments.booked.length && !segments.blocked && !isWeekend)) {
    return null
  }

  const tooltipContent = (
    <div
      ref={tooltipRef}
      className="tooltip-portal fixed bg-white rounded-lg shadow-xl border-2 border-gray-200 p-3 max-w-xs pointer-events-auto"
      style={{ top: `${position.top}px`, left: `${position.left}px`, zIndex: 9999 }}
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={onRequestClose}
      role="dialog"
      aria-live="polite"
    >
      <div className="text-xs font-semibold text-gray-700 mb-2 border-b pb-2">
        {date.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}
      </div>

      {segments.blocked ? (
        <div className="text-sm text-rose-600 font-medium">Dag geblokkeerd</div>
      ) : isWeekend && !segments.available.length && !segments.booked.length ? (
        <div className="text-sm text-amber-600 font-medium">Weekend - niet beschikbaar</div>
      ) : (
        <>
          {segments.available.length > 0 && (
            <div className="mb-2">
              <div className="text-xs font-semibold text-gray-600 mb-1">Beschikbare uren</div>
              <div className="space-y-1">
                {segments.available.map((slot, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                    <span>{slot.start}–{slot.end}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {segments.booked.length > 0 && (
            <div className="mb-1">
              <div className="text-xs font-semibold text-gray-600 mb-1">Geboekt</div>
              <div className="space-y-1">
                {segments.booked.map((slot, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                    <span>{slot.start}–{slot.end}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!segments.available.length && !segments.booked.length && !isWeekend && (
            <div className="text-sm text-gray-500">Geen ingeplande beschikbaarheid.</div>
          )}
        </>
      )}
    </div>
  )

  // Render via portal to document.body
  if (typeof document !== 'undefined') {
    return createPortal(tooltipContent, document.body)
  }
  
  return null
}
