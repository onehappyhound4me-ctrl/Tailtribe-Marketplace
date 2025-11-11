"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from "next/link";
import { useNav } from "@/components/navigation/NavContext";

export function MobileMenu() {
  const { isMobileMenuOpen, closeMobileMenu } = useNav();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchHref, setSearchHref] = useState(() => {
    return pathname?.startsWith('/nl') ? '/nl/search' : '/search'
  });

  useEffect(() => {
    setMounted(true);

    const saved = typeof window !== 'undefined' ? localStorage.getItem('userCountry') : null
    if (saved === 'NL') {
      setSearchHref('/nl/search')
    } else {
      const country = pathname?.startsWith('/nl') ? 'NL' : 'BE'
      setSearchHref(country === 'NL' ? '/nl/search' : '/search')
    }

    const handleCountryChange = (event: any) => {
      setSearchHref(event.detail === 'NL' ? '/nl/search' : '/search')
    }

    window.addEventListener('countryChanged', handleCountryChange)
    return () => window.removeEventListener('countryChanged', handleCountryChange)
  }, [pathname]);

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
      className="fixed inset-0 z-[9999] bg-slate-950 text-white flex flex-col"
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
      <div className="shrink-0 flex items-center justify-between px-4 py-4 border-b border-white/10">
        <span className="text-base font-semibold tracking-wide uppercase">
          Menu
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            closeMobileMenu();
          }}
          className="text-sm font-medium p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Sluit menu"
        >
          ✕
        </button>
      </div>

      <nav 
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4 text-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: 'auto' }}
      >
        <Link 
          href="/about" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            closeMobileMenu();
            router.push('/about');
          }} 
          className="block py-2 hover:text-green-400 transition-colors cursor-pointer"
        >
          Over ons
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
            className="block py-2 hover:text-green-400 transition-colors cursor-pointer"
          >
            Zoek dierenverzorgers
          </Link>
        )}

        <Link 
          href="/diensten" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            closeMobileMenu();
            router.push('/diensten');
          }} 
          className="block py-2 hover:text-green-400 transition-colors cursor-pointer"
        >
          Diensten
        </Link>

        {status === 'loading' ? null : session ? (
          <>
            {pathname?.startsWith('/dashboard') && (
              <Link
                href={session.user.role === 'CAREGIVER' ? '/dashboard/caregiver' : '/dashboard/owner'}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  closeMobileMenu();
                  router.push(session.user.role === 'CAREGIVER' ? '/dashboard/caregiver' : '/dashboard/owner');
                }}
                className="block py-2 hover:text-green-400 transition-colors cursor-pointer"
              >
                Dashboard
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
              className="block py-2 hover:text-green-400 transition-colors cursor-pointer"
            >
              Uitloggen
            </Link>
          </>
        ) : (
          <>
            <Link 
              href="/auth/signin" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                closeMobileMenu();
                router.push('/auth/signin');
              }} 
              className="block py-2 hover:text-green-400 transition-colors cursor-pointer"
            >
              Inloggen
            </Link>
            <div className="pt-4">
              <Link
                href="/auth/register"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  closeMobileMenu();
                  router.push('/auth/register');
                }}
                className="inline-flex w-full items-center justify-center rounded-full border border-emerald-400 bg-emerald-500 px-4 py-3 text-base font-semibold text-slate-950 shadow-lg hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                Word dierenoppasser
              </Link>
            </div>
          </>
        )}
      </nav>
    </div>
  );

  return createPortal(overlay, document.body);
}
