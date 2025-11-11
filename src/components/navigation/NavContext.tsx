'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type NavContextValue = {
  isMobileMenuOpen: boolean
  openMobileMenu: () => void
  closeMobileMenu: () => void
  toggleMobileMenu: () => void
}

const NavContext = createContext<NavContextValue | undefined>(undefined)

export function NavProvider({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Add/remove class on <html> to hide hero video when menu is open
  useEffect(() => {
    const html = document.documentElement
    if (isMobileMenuOpen) {
      html.classList.add('mobile-menu-open')
    } else {
      html.classList.remove('mobile-menu-open')
    }
    return () => {
      html.classList.remove('mobile-menu-open')
    }
  }, [isMobileMenuOpen])

  const openMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(true)
  }, [])

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev)
  }, [])

  const value = useMemo(
    () => ({
      isMobileMenuOpen,
      openMobileMenu,
      closeMobileMenu,
      toggleMobileMenu,
    }),
    [isMobileMenuOpen, openMobileMenu, closeMobileMenu, toggleMobileMenu]
  )

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>
}

export function useNav() {
  const context = useContext(NavContext)
  if (!context) {
    throw new Error('useNav must be used within a NavProvider')
  }
  return context
}

