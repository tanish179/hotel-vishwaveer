'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Menu, X, CalendarCheck, ShieldCheck, CreditCard } from 'lucide-react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Suites & Rooms', href: '/rooms' },
    { label: 'The Estate', href: '/#estate' },
    { label: 'Dining', href: '/#dining' },
    { label: 'Amenities', href: '/#amenities' },
    { label: 'Location', href: '/#location' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'py-3 bg-hotel-limestone/95 backdrop-blur-md border-b border-hotel-charcoal/5 shadow-subtle'
            : 'py-5 md:py-6 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12 flex items-center justify-between">
          {/* Brand Identity / Monogram */}
          <Link href="/" className="group flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-hotel-charcoal/20 flex items-center justify-center bg-white/40 group-hover:bg-hotel-cypress group-hover:border-hotel-cypress transition-colors duration-300">
              <span className="font-serif text-base sm:text-lg font-bold text-hotel-charcoal group-hover:text-white transition-colors duration-300">
                V
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-xl tracking-tight font-medium text-hotel-charcoal">
                Hotel Vishwaveer
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-hotel-muted font-sans font-medium">
                Kolhapur · Estate
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-hotel-charcoal/80 hover:text-hotel-cypress transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/lookup"
              className="text-xs uppercase tracking-wider font-semibold text-hotel-charcoal/70 hover:text-hotel-charcoal flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-black/5 transition-all"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Find Booking</span>
            </Link>

            {/* Direct Booking Button */}
            <Link
              href="/rooms"
              className="group inline-flex items-center gap-2.5 bg-hotel-cypress text-white px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 hover:bg-hotel-cypress-dark hover:shadow-subtle active:scale-[0.98]"
            >
              <span>Reserve Suite</span>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
                <ArrowUpRight className="w-3 h-3 text-white" />
              </span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-full border border-hotel-charcoal/15 text-hotel-charcoal hover:bg-white/50 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-hotel-limestone/98 backdrop-blur-xl lg:hidden pt-28 px-6 sm:px-8 flex flex-col justify-between pb-10 animate-in fade-in duration-300">
          <div className="flex flex-col gap-5">
            <span className="text-[10px] uppercase tracking-[0.25em] text-hotel-muted font-mono font-bold">
              Directory
            </span>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-serif text-2xl sm:text-3xl text-hotel-charcoal hover:text-hotel-cypress transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/lookup"
              onClick={() => setMobileMenuOpen(false)}
              className="font-serif text-xl sm:text-2xl text-hotel-muted hover:text-hotel-charcoal transition-colors flex items-center gap-2 pt-4 border-t border-hotel-charcoal/10"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Find My Reservation</span>
            </Link>
          </div>

          <div className="flex flex-col gap-3 pt-6 border-t border-hotel-charcoal/10">
            <Link
              href="/rooms"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full bg-hotel-cypress text-white py-3.5 rounded-full text-center text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-subtle active:scale-[0.98]"
            >
              <span>Reserve a Suite</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <p className="text-center text-[11px] text-hotel-muted">
              Authoritative 30% advance deposit · Remaining payable at hotel
            </p>
          </div>
        </div>
      )}
    </>
  );
}
