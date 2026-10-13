import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ShieldCheck, Lock, CreditCard } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-hotel-charcoal text-white pt-24 pb-12 px-6 md:px-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          {/* Brand Column */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/5">
                <span className="font-serif text-lg font-bold text-white">V</span>
              </div>
              <span className="font-serif text-2xl tracking-tight font-medium text-white">
                Hotel Vishwaveer
              </span>
            </div>
            <p className="text-white/70 text-sm max-w-[40ch] leading-relaxed mb-6 font-light">
              A private boutique sanctuary in Kolhapur, Maharashtra. Restored basalt architecture, ten bespoke residences, and quiet luxury.
            </p>
            <div className="flex items-center gap-3 text-xs text-white/50">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-hotel-brass" />
                256-Bit SSL Encrypted
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-hotel-brass" />
                Razorpay Secure
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="lg:col-span-3">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-white/50 font-mono mb-6">
              Navigation
            </h4>
            <ul className="space-y-3 text-sm text-white/80">
              <li>
                <Link href="/rooms" className="hover:text-white transition-colors">
                  All Suites & Residences
                </Link>
              </li>
              <li>
                <Link href="/#estate" className="hover:text-white transition-colors">
                  The Estate & Heritage
                </Link>
              </li>
              <li>
                <Link href="/#dining" className="hover:text-white transition-colors">
                  The Courtyard Dining
                </Link>
              </li>
              <li>
                <Link href="/#amenities" className="hover:text-white transition-colors">
                  Curated Amenities
                </Link>
              </li>
              <li>
                <Link href="/#location" className="hover:text-white transition-colors">
                  Location & Directions
                </Link>
              </li>
            </ul>
          </div>

          {/* Guest Services & Admin */}
          <div className="lg:col-span-4">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-white/50 font-mono mb-6">
              Guest Services & Desk
            </h4>
            <div className="space-y-4 text-xs text-white/80">
              <p>
                <strong className="text-white block mb-0.5">Physical Address:</strong>
                Vishwaveer Heritage Estate, Ring Road, Kolhapur, Maharashtra 416008
              </p>
              <p>
                <strong className="text-white block mb-0.5">Direct Enquiries:</strong>
                <a href="tel:+912312654400" className="hover:text-white">
                  +91 231 265 4400
                </a>
                <br />
                <a href="mailto:reservations@hotelvishwaveer.in" className="hover:text-white">
                  reservations@hotelvishwaveer.in
                </a>
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href="/lookup"
                  className="inline-flex items-center gap-1.5 text-hotel-brass hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider"
                >
                  <span>Find My Reservation</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-xs uppercase tracking-wider"
                >
                  <span>Staff Portal</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-4">
          <p>© {new Date().getFullYear()} Hotel Vishwaveer. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Direct Booking Guaranteed</span>
            <span>·</span>
            <span>30% Advance Deposit Required</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
