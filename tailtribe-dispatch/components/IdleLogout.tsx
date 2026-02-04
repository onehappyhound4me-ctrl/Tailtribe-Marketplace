'use client'

import { useEffect, useMemo, useRef } from 'react'
import { signOut, useSession } from 'next-auth/react'

const STORAGE_KEY = 'tt_last_activity_ms'
const COOKIE_KEY = 'tt_last_activity_ms'
const STORAGE_LOGIN_KEY = 'tt_last_login_ms'
const COOKIE_LOGIN_KEY = 'tt_last_login_ms'
const IDLE_MS = 30 * 60 * 1000 // 30 minutes
const CHECK_EVERY_MS = 30 * 1000
const WRITE_THROTTLE_MS = 15 * 1000

function nowMs() {
  return Date.now()
}

function readCookieMs(): number {
  try {
    const parts = String(document.cookie || '').split(';')
    for (const part of parts) {
      const [k, ...rest] = part.trim().split('=')
      if (k !== COOKIE_KEY) continue
      const raw = decodeURIComponent(rest.join('=') || '')
      const n = raw ? Number(raw) : NaN
      return Number.isFinite(n) ? n : 0
    }
    return 0
  } catch {
    return 0
  }
}

function readCookieLoginMs(): number {
  try {
    const parts = String(document.cookie || '').split(';')
    for (const part of parts) {
      const [k, ...rest] = part.trim().split('=')
      if (k !== COOKIE_LOGIN_KEY) continue
      const raw = decodeURIComponent(rest.join('=') || '')
      const n = raw ? Number(raw) : NaN
      return Number.isFinite(n) ? n : 0
    }
    return 0
  } catch {
    return 0
  }
}

function writeCookieMs(ms: number) {
  try {
    // Persist long enough to cover "close browser, come back later".
    const maxAgeSeconds = 60 * 60 * 24 * 30 // 30 days
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(String(ms))}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`
  } catch {
    // ignore
  }
}

function writeCookieLoginMs(ms: number) {
  try {
    const maxAgeSeconds = 60 * 60 * 24 * 30 // 30 days
    document.cookie = `${COOKIE_LOGIN_KEY}=${encodeURIComponent(String(ms))}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`
  } catch {
    // ignore
  }
}

function readLastActivityMs(): number {
  // Prefer the freshest timestamp between localStorage and cookie.
  // Cookie fallback is important for browsers/environments where localStorage can be blocked/cleared.
  let ls = 0
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const n = raw ? Number(raw) : NaN
    ls = Number.isFinite(n) ? n : 0
  } catch {
    ls = 0
  }
  const ck = readCookieMs()
  return Math.max(ls, ck)
}

function readLastLoginMs(): number {
  let ls = 0
  try {
    const raw = localStorage.getItem(STORAGE_LOGIN_KEY)
    const n = raw ? Number(raw) : NaN
    ls = Number.isFinite(n) ? n : 0
  } catch {
    ls = 0
  }
  const ck = readCookieLoginMs()
  return Math.max(ls, ck)
}

function writeLastActivityMs(ms: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(ms))
  } catch {
    // ignore
  }
  writeCookieMs(ms)
}

function writeLastLoginMs(ms: number) {
  try {
    localStorage.setItem(STORAGE_LOGIN_KEY, String(ms))
  } catch {
    // ignore
  }
  writeCookieLoginMs(ms)
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
      const lastLogin = readLastLoginMs()
      const now = nowMs()
      // If system clock moved backwards, treat as "active now".
      if (last && now < last) {
        writeLastActivityMs(now)
        stateRef.current.lastWriteMs = now
        return
      }
      // If we have a stored timestamp and it's too old: logout immediately.
      if (last && now - last >= IDLE_MS) {
        // If the user JUST logged in, do not immediately kick them out due to an old activity timestamp.
        // (This can happen when switching accounts; activity markers from the previous session remain.)
        if (lastLogin && now - lastLogin < 2 * 60 * 1000) {
          writeLastActivityMs(now)
          stateRef.current.lastWriteMs = now
          return
        }
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
    window.addEventListener('focus', onActivity)
    window.addEventListener('pageshow', onActivity)

    const id = window.setInterval(async () => {
      await signOutIfIdle()
    }, CHECK_EVERY_MS)

    return () => {
      window.clearInterval(id)
      activityEvents.forEach((evt) => window.removeEventListener(evt, onActivity))
      window.removeEventListener('storage', onStorage)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('focus', onActivity)
      window.removeEventListener('pageshow', onActivity)
    }
  }, [active, activityEvents])

  return null
}

