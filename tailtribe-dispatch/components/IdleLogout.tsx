'use client'

import { useEffect, useMemo, useRef } from 'react'
import { signOut, useSession } from 'next-auth/react'

const STORAGE_KEY = 'tt_last_activity_ms'
const IDLE_MS = 30 * 60 * 1000 // 30 minutes
const CHECK_EVERY_MS = 30 * 1000
const WRITE_THROTTLE_MS = 15 * 1000

function nowMs() {
  return Date.now()
}

function readLastActivityMs(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const n = raw ? Number(raw) : NaN
    return Number.isFinite(n) ? n : 0
  } catch {
    return 0
  }
}

function writeLastActivityMs(ms: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(ms))
  } catch {
    // ignore
  }
}

export function IdleLogout() {
  const { status } = useSession()
  const active = status === 'authenticated'

  const stateRef = useRef({
    lastWriteMs: 0,
    signingOut: false,
  })

  const activityEvents = useMemo(
    () => [
      'keydown',
      'mousedown',
      'mousemove',
      'pointerdown',
      'pointermove',
      'scroll',
      'touchstart',
      'touchmove',
    ] as const,
    []
  )

  useEffect(() => {
    if (!active) return

    const signOutIfIdle = async () => {
      if (stateRef.current.signingOut) return
      const last = readLastActivityMs()
      const now = nowMs()
      // If we have a stored timestamp and it's too old: logout immediately.
      if (last && now - last >= IDLE_MS) {
        stateRef.current.signingOut = true
        try {
          await signOut({ callbackUrl: '/login' })
        } finally {
          stateRef.current.signingOut = false
        }
      }
    }

    // On login / tab open: if already idle (e.g. tab restored), logout; otherwise mark activity.
    void (async () => {
      const last = readLastActivityMs()
      const now = nowMs()
      if (last && now - last >= IDLE_MS) {
        await signOutIfIdle()
        return
      }
      writeLastActivityMs(now)
      stateRef.current.lastWriteMs = now
    })()

    const onActivity = async () => {
      await signOutIfIdle()
      if (stateRef.current.signingOut) return
      const now = nowMs()
      if (now - stateRef.current.lastWriteMs < WRITE_THROTTLE_MS) return
      stateRef.current.lastWriteMs = now
      writeLastActivityMs(now)
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      // no-op: our timer reads from storage; this is only here to ensure browsers
      // wake the tab on cross-tab activity.
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void onActivity()
      }
    }

    activityEvents.forEach((evt) => window.addEventListener(evt, onActivity, { passive: true }))
    window.addEventListener('storage', onStorage)
    document.addEventListener('visibilitychange', onVisibility)

    const id = window.setInterval(async () => {
      await signOutIfIdle()
    }, CHECK_EVERY_MS)

    return () => {
      window.clearInterval(id)
      activityEvents.forEach((evt) => window.removeEventListener(evt, onActivity))
      window.removeEventListener('storage', onStorage)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [active, activityEvents])

  return null
}

