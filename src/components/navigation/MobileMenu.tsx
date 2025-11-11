"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useNav } from "@/components/navigation/NavContext";

export function MobileMenu() {
  const { isMobileMenuOpen, closeMobileMenu } = useNav();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isMobileMenuOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mounted, isMobileMenuOpen]);

  if (!mounted || !isMobileMenuOpen) return null;

  const overlay = (
    <div
      className="
        fixed inset-0
        z-[9999]
        bg-slate-950
        text-white
        flex flex-col
      "
      aria-modal="true"
      role="dialog"
    >
      <div className="shrink-0 flex items-center justify-between px-4 py-4 border-b border-white/10">
        <span className="text-base font-semibold tracking-wide uppercase">
          Menu
        </span>
        <button
          type="button"
          onClick={closeMobileMenu}
          className="text-sm font-medium"
        >
          ✕
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-4 text-lg">
        <Link href="#how-it-works" onClick={closeMobileMenu} className="block py-2">
          Hoe werkt TailTribe?
        </Link>
        <Link href="#services" onClick={closeMobileMenu} className="block py-2">
          Diensten
        </Link>
        <Link href="#sitters" onClick={closeMobileMenu} className="block py-2">
          Word verzorger
        </Link>
        <Link href="#contact" onClick={closeMobileMenu} className="block py-2">
          Contact
        </Link>

        <div className="pt-6">
          <Link
            href="/signup"
            onClick={closeMobileMenu}
            className="inline-flex w-full items-center justify-center rounded-full border border-emerald-400 bg-emerald-500 px-4 py-3 text-base font-semibold text-slate-950 shadow-lg"
          >
            Start met zoeken
          </Link>
        </div>
      </nav>
    </div>
  );

  return createPortal(overlay, document.body);
}
