"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from "next/link";
import { useNav } from "@/components/navigation/NavContext";
import { switchCountryPath } from "@/lib/utils";

export function MobileMenu() {
  const { isMobileMenuOpen, closeMobileMenu } = useNav();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchHref, setSearchHref] = useState(() => {
    return pathname?.startsWith('/nl') ? '/nl/search' : '/search'
  });
  const [currentCountry, setCurrentCountry] = useState<'BE' | 'NL'>(() => {
    return pathname?.startsWith('/nl') ? 'NL' : 'BE'
  });

  useEffect(() => {
    setMounted(true);

    const saved = typeof window !== 'undefined' ? localStorage.getItem('userCountry') as 'BE' | 'NL' | null : null
    if (saved) {
      setCurrentCountry(saved)
      setSearchHref(saved === 'NL' ? '/nl/search' : '/search')
    } else {
      const country = pathname?.startsWith('/nl') ? 'NL' : 'BE'
      setCurrentCountry(country)
      setSearchHref(country === 'NL' ? '/nl/search' : '/search')
    }

    const handleCountryChange = (event: any) => {
      const country = event.detail as 'BE' | 'NL'
      setCurrentCountry(country)
      setSearchHref(country === 'NL' ? '/nl/search' : '/search')
    }

    window.addEventListener('countryChanged', handleCountryChange)
    return () => window.removeEventListener('countryChanged', handleCountryChange)
  }, [pathname]);

  const handleSwitchCountry = (country: 'BE' | 'NL') => {
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('userCountry', country)
      window.dispatchEvent(new CustomEvent('countryChanged', { detail: country }))
    }
    
    setCurrentCountry(country)
    closeMobileMenu()
    
    // Use utility function to get correct path
    const targetPath = switchCountryPath(pathname || '/', country)
    
    // Use window.location for hard navigation to ensure country switch works
    if (typeof window !== 'undefined') {
      window.location.href = targetPath
    } else {
      router.push(targetPath)
      router.refresh()
    }
  };

  useEffect(() => {
    if (!mounted) return;
    
    if (isMobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const scrollY = window.scrollY;
      
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [mounted, isMobileMenuOpen]);

  if (!mounted) return null;

  if (!isMobileMenuOpen) return null;

  const overlay = (
    <div
      className="fixed inset-0 z-[9999] bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white flex flex-col"
      aria-modal="true"
      role="dialog"
      onClick={(e) => {
        // Close menu if clicking on the backdrop (not on the nav content)
        if (e.target === e.currentTarget) {
          closeMobileMenu();
        }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
      }}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(20,184,166,0.1),transparent_50%)]" />
      
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-6 py-5 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-900/50 to-teal-900/50 backdrop-blur-sm relative z-10">
        <span className="text-lg font-bold tracking-wide text-emerald-100">
          Navigatie
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            closeMobileMenu();
          }}
          className="text-emerald-100 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer"
          aria-label="Sluit menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation Content */}
      <nav 
        className="flex-1 overflow-y-auto px-6 py-8 space-y-1 relative z-10"
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: 'auto' }}
      >
        {/* Main Navigation Links */}
        <div className="space-y-1 mb-6">
          <Link 
            href={pathname?.startsWith('/nl') ? '/nl/about' : '/about'} 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeMobileMenu();
              router.push(pathname?.startsWith('/nl') ? '/nl/about' : '/about');
            }} 
            className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-emerald-500/20 hover:text-emerald-100 transition-all duration-200 cursor-pointer group"
          >
            <svg className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-base font-semibold">Over ons</span>
          </Link>
          
          {(!session || session.user.role === 'OWNER') && (
            <Link 
              href={searchHref} 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                closeMobileMenu();
                router.push(searchHref);
              }} 
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-emerald-500/20 hover:text-emerald-100 transition-all duration-200 cursor-pointer group"
            >
              <svg className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-base font-semibold">Zoek dierenverzorgers</span>
            </Link>
          )}

          <Link 
            href={pathname?.startsWith('/nl') ? '/nl/diensten' : '/diensten'} 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeMobileMenu();
              router.push(pathname?.startsWith('/nl') ? '/nl/diensten' : '/diensten');
            }} 
            className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-emerald-500/20 hover:text-emerald-100 transition-all duration-200 cursor-pointer group"
          >
            <svg className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="text-base font-semibold">Diensten</span>
          </Link>
        </div>

        {/* User Section */}
        {status === 'loading' ? null : session ? (
          <div className="space-y-1 mb-6">
            {pathname?.startsWith('/dashboard') && (
              <Link
                href={session.user.role === 'CAREGIVER' ? '/dashboard/caregiver' : '/dashboard/owner'}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  closeMobileMenu();
                  router.push(session.user.role === 'CAREGIVER' ? '/dashboard/caregiver' : '/dashboard/owner');
                }}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-emerald-500/20 hover:text-emerald-100 transition-all duration-200 cursor-pointer group"
              >
                <svg className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-base font-semibold">Dashboard</span>
              </Link>
            )}
            <Link 
              href="/auth/signout" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                closeMobileMenu();
                router.push('/auth/signout');
              }} 
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-red-500/20 hover:text-red-100 transition-all duration-200 cursor-pointer group"
            >
              <svg className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-base font-semibold">Uitloggen</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-1 mb-6">
            <Link 
              href="/auth/signin" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                closeMobileMenu();
                router.push('/auth/signin');
              }} 
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-emerald-500/20 hover:text-emerald-100 transition-all duration-200 cursor-pointer group"
            >
              <svg className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="text-base font-semibold">Inloggen</span>
            </Link>
            <div className="pt-2">
              <Link
                href="/auth/register"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  closeMobileMenu();
                  router.push('/auth/register');
                }}
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-4 rounded-xl font-bold text-base shadow-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 transform hover:scale-[1.02] cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Word dierenoppasser
              </Link>
            </div>
          </div>
        )}

        {/* Country Switcher */}
        <div className="pt-6 border-t border-emerald-500/20 mt-6">
          <div className="text-xs font-semibold text-emerald-200/70 uppercase tracking-wider mb-3 px-4">Land</div>
          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSwitchCountry('BE');
              }}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                currentCountry === 'BE'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                  : 'bg-white/10 text-emerald-100 hover:bg-white/15 border border-emerald-500/20'
              }`}
            >
              België
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSwitchCountry('NL');
              }}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                currentCountry === 'NL'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                  : 'bg-white/10 text-emerald-100 hover:bg-white/15 border border-emerald-500/20'
              }`}
            >
              Nederland
            </button>
          </div>
        </div>
      </nav>
    </div>
  );

  return createPortal(overlay, document.body);
}
