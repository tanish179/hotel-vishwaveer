'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Menu, X, CalendarCheck, ShieldCheck } from 'lucide-react';

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
            ? 'py-3 bg-hotel-limestone/90 backdrop-blur-md border-b border-hotel-charcoal/5 shadow-subtle'
            : 'py-6 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Brand Identity / Monogram */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-hotel-charcoal/20 flex items-center justify-center bg-white/40 group-hover:bg-hotel-cypress group-hover:border-hotel-cypress transition-colors duration-300">
              <span className="font-serif text-lg font-bold text-hotel-charcoal group-hover:text-white transition-colors duration-300">
                V
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl tracking-tight font-medium text-hotel-charcoal">
                Hotel Vishwaveer
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-hotel-muted font-sans font-medium">
                Kolhapur · Estate
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
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

          {/* CTAs */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/lookup"
              className="text-xs uppercase tracking-wider font-semibold text-hotel-charcoal/70 hover:text-hotel-charcoal flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-black/5 transition-all"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              Find Booking
            </Link>

            {/* Direct Booking Button-in-Button Pill */}
            <Link
              href="/rooms"
              className="group inline-flex items-center gap-3 bg-hotel-cypress text-white px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 hover:bg-hotel-cypress-dark hover:shadow-subtle active:scale-[0.98]"
            >
              <span>Reserve Suite</span>
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
                <ArrowUpRight className="w-3.5 h-3.5 text-white" />
              </span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full border border-hotel-charcoal/15 text-hotel-charcoal hover:bg-white/50 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-hotel-limestone/98 backdrop-blur-xl md:hidden pt-28 px-8 flex flex-col justify-between pb-12 animate-in fade-in duration-300">
          <div className="flex flex-col gap-6">
            <span className="text-[11px] uppercase tracking-[0.2em] text-hotel-muted font-mono">
              Directory
            </span>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-serif text-3xl text-hotel-charcoal hover:text-hotel-cypress transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/lookup"
              onClick={() => setMobileMenuOpen(false)}
              className="font-serif text-2xl text-hotel-muted hover:text-hotel-charcoal transition-colors flex items-center gap-2 pt-4 border-t border-hotel-charcoal/10"
            >
              <CalendarCheck className="w-5 h-5" />
              Find My Reservation
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            <Link
              href="/rooms"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full bg-hotel-cypress text-white py-4 rounded-full text-center text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <span>Book Your Stay</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <p className="text-center text-xs text-hotel-muted">
              Advance 30% deposit · Remaining balance payable at hotel
            </p>
          </div>
        </div>
      )}
    </>
  );
}
