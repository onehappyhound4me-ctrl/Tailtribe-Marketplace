'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { createPortal } from 'react-dom'

type Props = {
  primaryCtaHref?: string
  primaryCtaLabel?: string
}

export function SiteHeader({ primaryCtaHref = '/boeken', primaryCtaLabel = 'Boek Nu' }: Props) {
  const { data: session } = useSession()
  const canSeeCommunity = session?.user?.role === 'CAREGIVER' || session?.user?.role === 'ADMIN'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const prevBodyStyle = useRef<{
    overflow: string
    position: string
    top: string
    left: string
    right: string
    width: string
  } | null>(null)
  const lockedScrollY = useRef<number>(0)
  const mobileMenuToggleRef = useRef<HTMLButtonElement | null>(null)
  const mobileMenuCloseRef = useRef<HTMLButtonElement | null>(null)
  const prevMobileMenuOpen = useRef<boolean | null>(null)
  const prevPathnameRef = useRef<string | null>(null)
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [mounted, setMounted] = useState(false)

  const unlockBodyScroll = () => {
    if (!prevBodyStyle.current) return
    const prev = prevBodyStyle.current
    prevBodyStyle.current = null
    document.body.style.overflow = prev.overflow
    document.body.style.position = prev.position
    document.body.style.top = prev.top
    document.body.style.left = prev.left
    document.body.style.right = prev.right
    document.body.style.width = prev.width
    window.scrollTo(0, lockedScrollY.current || 0)
    lockedScrollY.current = 0
  }

  const closeMobileMenu = useCallback(() => {
    // Critical: unlock synchronously so iOS Safari can't get "stuck"
    // if navigation happens before React effects flush.
    unlockBodyScroll()
    setMobileMenuOpen(false)
  }, [])

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/', redirect: true })
  }

  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileMenu()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileMenuOpen, closeMobileMenu])

  useEffect(() => {
    setMounted(true)
  }, [])

  const onMobileNavClick = (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Hotfix: let the browser handle navigation (most reliable across iPhone/Android),
    // and just close the menu immediately.
    e.stopPropagation()
    closeMobileMenu()
  }

  // Close menu after navigation (mobile Safari can drop link-clicks when we close inside onClick handlers).
  useEffect(() => {
    // Don't run on first mount.
    if (prevPathnameRef.current === null) {
      prevPathnameRef.current = pathname
      return
    }

    const changed = prevPathnameRef.current !== pathname
    prevPathnameRef.current = pathname
    if (changed && mobileMenuOpen) {
      closeMobileMenu()
    }
  }, [pathname, mobileMenuOpen, closeMobileMenu])

  // Also close on hash navigation (e.g. "/#services").
  useEffect(() => {
    if (!mobileMenuOpen) return
    const onHashChange = () => closeMobileMenu()
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [mobileMenuOpen, closeMobileMenu])

  // Mobile-only UX: prevent background scroll when the mobile menu is open (important on iOS Safari).
  useEffect(() => {
    if (!mobileMenuOpen) {
      unlockBodyScroll()
      return
    }

    // iOS Safari needs a stronger scroll lock than overflow:hidden.
    if (!prevBodyStyle.current) {
      prevBodyStyle.current = {
        overflow: document.body.style.overflow,
        position: document.body.style.position,
        top: document.body.style.top,
        left: document.body.style.left,
        right: document.body.style.right,
        width: document.body.style.width,
      }
    }
    lockedScrollY.current = window.scrollY
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${lockedScrollY.current}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'

    return () => {
      unlockBodyScroll()
    }
  }, [mobileMenuOpen])

  // Reasonable focus management: focus the close button when opened, restore focus to toggle when closed.
  useEffect(() => {
    // Don't steal focus on first mount (avoids mobile Safari focus/scroll quirks).
    if (prevMobileMenuOpen.current === null) {
      prevMobileMenuOpen.current = mobileMenuOpen
      return
    }

    prevMobileMenuOpen.current = mobileMenuOpen
    if (mobileMenuOpen) {
      window.setTimeout(() => mobileMenuCloseRef.current?.focus(), 0)
      return
    }
    window.setTimeout(() => mobileMenuToggleRef.current?.focus(), 0)
  }, [mobileMenuOpen])

  const mobileMenu = mobileMenuOpen ? (
    <div className="md:hidden fixed inset-0 z-[2000] h-[100dvh]" role="presentation" data-testid="mobile-menu-root">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/35"
        onClick={closeMobileMenu}
        aria-hidden="true"
        data-testid="mobile-menu-backdrop"
      />

      {/* Drawer */}
      <aside
        id="mobile-menu-drawer"
        data-testid="mobile-menu-drawer"
        className="absolute top-0 bottom-0 right-0 z-[2001] w-[88vw] max-w-sm border-l border-emerald-200/70 bg-white shadow-2xl rounded-l-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Navigatie menu"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (safe-area aware) */}
        <div className="px-4 sm:px-6 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 border-b border-emerald-100 bg-white/95 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-900">Navigatie</div>
            <button
              type="button"
              onClick={closeMobileMenu}
              className="inline-flex items-center justify-center h-11 w-11 rounded-full border border-emerald-200 bg-white hover:bg-emerald-50 transition"
              aria-label="Sluit menu"
              data-testid="mobile-menu-close"
              ref={mobileMenuCloseRef}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.29 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.3-6.3 1.41 1.42Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] space-y-2">
          {/* Primary actions (mobile-only) */}
          <div className="pb-2 space-y-2">
            <a
              href="/boeken"
              onClick={onMobileNavClick('/boeken')}
              className="rounded-xl bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-3 text-sm font-semibold transition min-h-[44px] flex items-center justify-between shadow-md hover:from-green-700 hover:to-blue-700"
            >
              Boek een oppasser
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="w-4 h-4 text-white/90">
                <path
                  fillRule="evenodd"
                  d="M8.47 3.47a.75.75 0 0 1 1.06 0l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06L12.94 9 8.47 4.53a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="/verzorger-aanmelden"
              onClick={onMobileNavClick('/verzorger-aanmelden')}
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 hover:bg-amber-100 transition min-h-[44px] flex items-center justify-between"
            >
              Word dierenoppas
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="w-4 h-4 text-amber-700/80">
                <path
                  fillRule="evenodd"
                  d="M8.47 3.47a.75.75 0 0 1 1.06 0l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06L12.94 9 8.47 4.53a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>

          <a
            href="/#services"
            onClick={onMobileNavClick('/#services')}
            className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-emerald-50 transition min-h-[44px] flex items-center justify-between"
          >
            Diensten
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="w-4 h-4 text-gray-400">
              <path
                fillRule="evenodd"
                d="M8.47 3.47a.75.75 0 0 1 1.06 0l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06L12.94 9 8.47 4.53a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </a>
          <a
            href="/over-ons"
            onClick={onMobileNavClick('/over-ons')}
            className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-emerald-50 transition min-h-[44px] flex items-center justify-between"
          >
            Over ons
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="w-4 h-4 text-gray-400">
              <path
                fillRule="evenodd"
                d="M8.47 3.47a.75.75 0 0 1 1.06 0l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06L12.94 9 8.47 4.53a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </a>
          <a
            href="/blog"
            onClick={onMobileNavClick('/blog')}
            className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-emerald-50 transition min-h-[44px] flex items-center justify-between"
          >
            Blog
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="w-4 h-4 text-gray-400">
              <path
                fillRule="evenodd"
                d="M8.47 3.47a.75.75 0 0 1 1.06 0l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06L12.94 9 8.47 4.53a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </a>
          {canSeeCommunity && (
            <a
              href="/community"
              onClick={onMobileNavClick('/community')}
              className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-emerald-50 transition min-h-[44px] flex items-center justify-between"
            >
              Community
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="w-4 h-4 text-gray-400">
                <path
                  fillRule="evenodd"
                  d="M8.47 3.47a.75.75 0 0 1 1.06 0l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06L12.94 9 8.47 4.53a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          )}

          <div className="pt-2">
            <div className="text-xs font-semibold text-gray-500 mb-2">Account</div>
            {session ? (
              <div className="space-y-2">
                <a
                  href="/dashboard"
                  onClick={onMobileNavClick('/dashboard')}
                  className="rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-blue-50 transition min-h-[44px] flex items-center justify-between"
                >
                  Dashboard
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="w-4 h-4 text-gray-400">
                    <path
                      fillRule="evenodd"
                      d="M8.47 3.47a.75.75 0 0 1 1.06 0l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06L12.94 9 8.47 4.53a.75.75 0 0 1 0-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu()
                    void handleLogout()
                  }}
                  className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-red-50 transition text-left min-h-[44px] flex items-center justify-between"
                >
                  Uitloggen
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="w-4 h-4 text-gray-400">
                    <path
                      fillRule="evenodd"
                      d="M8.47 3.47a.75.75 0 0 1 1.06 0l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06L12.94 9 8.47 4.53a.75.75 0 0 1 0-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <a
                href="/login"
                onClick={onMobileNavClick('/login')}
                className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-emerald-50 transition min-h-[44px] flex items-center justify-between"
              >
                Inloggen
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="w-4 h-4 text-gray-400">
                  <path
                    fillRule="evenodd"
                    d="M8.47 3.47a.75.75 0 0 1 1.06 0l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06L12.94 9 8.47 4.53a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            )}
          </div>
        </div>
      </aside>
    </div>
  ) : null

  return (
    <header
      className="bg-gradient-to-r from-blue-200/95 via-teal-200/90 to-emerald-300/82 backdrop-blur-lg shadow-md border-b border-emerald-300/60 sticky top-0 z-[999] relative overflow-visible"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_55%,rgba(241,248,255,0.55),transparent_58%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_52%,rgba(37,99,235,0.18),transparent_65%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_50%,rgba(16,185,129,0.16),transparent_60%)]" />

      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 overflow-visible">
        <div className="flex items-center justify-between h-20 md:h-24 py-4">
          <Link
            href="/"
            className="flex items-center hover:opacity-95 transition-all duration-300 select-none transform hover:scale-[1.02] no-underline -ml-2 sm:ml-0"
          >
            {/* Smaller on mobile to prevent right-side overflow */}
            <div
              className={
                isHome
                  ? 'w-[200px] max-w-[58vw] sm:w-[220px] md:w-[320px] lg:w-[360px] h-auto overflow-hidden relative'
                  : 'w-[200px] max-w-[58vw] sm:w-[220px] md:w-[320px] lg:w-[360px] h-auto overflow-hidden relative'
              }
            >
              {/* Hotfix: use <img> for local public/ asset (bypasses Next/Image optimizer issues on mobile Safari). */}
              <img
                src="/tailtribe_logo_masked_1751977129022.png"
                alt="TailTribe Logo"
                width={700}
                height={700}
                loading="eager"
                decoding="async"
                className="w-full h-auto object-contain relative z-10 transition-transform duration-300 hover:scale-[1.02]"
                style={{
                  filter: 'sepia(0.08) saturate(1.08) hue-rotate(-4deg) brightness(1.08)',
                  // Crop tiny artifact/smear in the bottom-right of the source image (header).
                  clipPath: 'inset(0 4% 10% 0)',
                }}
              />
            </div>
          </Link>

          <div className="flex items-center gap-2 md:gap-4 lg:gap-6 min-w-0">
            {/* Desktop Menu - alleen zichtbaar op md en groter */}
            <Link
              href="/#services"
              className="hidden md:block text-gray-700 hover:text-green-700 font-medium transition whitespace-nowrap"
            >
              Diensten
            </Link>
            <Link
              href="/over-ons"
              className="hidden md:block text-gray-700 hover:text-green-700 font-medium transition whitespace-nowrap"
            >
              Over ons
            </Link>
            <Link
              href="/blog"
              className="hidden md:block text-gray-700 hover:text-green-700 font-medium transition whitespace-nowrap"
            >
              Blog
            </Link>
            {canSeeCommunity && (
              <Link
                href="/community"
                className="hidden md:block text-gray-700 hover:text-green-700 font-medium transition whitespace-nowrap"
              >
                Community
              </Link>
            )}
            
            {/* Desktop Session Links - alleen op md en groter */}
            <div className="hidden md:flex md:items-center md:gap-3 lg:gap-4">
              {session && (
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-600 font-medium transition whitespace-nowrap"
                >
                  Dashboard
                </Link>
              )}
              
              {session ? (
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 font-medium transition whitespace-nowrap"
                >
                  Uitloggen
                </button>
              ) : (
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-green-700 font-medium transition whitespace-nowrap"
                >
                  Inloggen
                </Link>
              )}
            </div>
            
            {/* Mobile & Shared Buttons */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => {
                  if (mobileMenuOpen) closeMobileMenu()
                  else setMobileMenuOpen(true)
                }}
                aria-label="Menu"
                aria-controls="mobile-menu-drawer"
                aria-expanded={mobileMenuOpen}
                data-testid="mobile-menu-toggle"
                ref={mobileMenuToggleRef}
                className="inline-flex md:hidden items-center justify-center rounded-full border border-emerald-200 bg-white/80 backdrop-blur h-11 w-11 p-0 text-gray-900 hover:bg-white transition shadow-sm"
              >
                {mobileMenuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.29 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.3-6.3 1.41 1.42Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" />
                  </svg>
                )}
              </button>
              
              {/* Primary CTA - altijd zichtbaar */}
              <Link
                href={primaryCtaHref}
                className="inline-flex items-center justify-center bg-gradient-to-r from-green-600 to-blue-600 text-white px-5 md:px-6 h-11 md:h-auto py-0 md:py-2.5 rounded-full font-semibold hover:from-green-700 hover:to-blue-700 transition shadow-lg hover:shadow-xl text-sm md:text-base whitespace-nowrap"
              >
                {primaryCtaLabel}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile dropdown menu (portal to body for iOS Safari fixed-position reliability) */}
      {mounted && mobileMenuOpen && typeof document !== 'undefined' ? createPortal(mobileMenu, document.body) : null}
    </header>
  )
}



