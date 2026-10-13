'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { addDays, format } from 'date-fns';

export function BookingSearchBar({
  initialCheckIn,
  initialCheckOut,
  initialGuests = 2,
  className = '',
}: {
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  className?: string;
}) {
  const router = useRouter();
  const today = new Date();
  const defaultCheckIn = initialCheckIn || format(addDays(today, 1), 'yyyy-MM-dd');
  const defaultCheckOut = initialCheckOut || format(addDays(today, 3), 'yyyy-MM-dd');

  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [guests, setGuests] = useState(initialGuests);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/rooms?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(
        checkOut
      )}&guests=${guests}`
    );
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Double Bezel Outer Shell */}
      <div className="doppelrand-shell shadow-card">
        <form
          onSubmit={handleSearch}
          className="doppelrand-core p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center"
        >
          {/* Check In */}
          <div className="flex flex-col gap-1.5 px-3 py-2 border-b sm:border-b-0 sm:border-r border-hotel-charcoal/10">
            <label className="text-[10px] uppercase tracking-widest text-hotel-muted font-bold flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-hotel-cypress" />
              Check-In
            </label>
            <input
              type="date"
              value={checkIn}
              min={format(today, 'yyyy-MM-dd')}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (e.target.value >= checkOut) {
                  setCheckOut(format(addDays(new Date(e.target.value), 1), 'yyyy-MM-dd'));
                }
              }}
              className="bg-transparent text-sm font-semibold text-hotel-charcoal focus:outline-none cursor-pointer"
              required
            />
          </div>

          {/* Check Out */}
          <div className="flex flex-col gap-1.5 px-3 py-2 border-b lg:border-b-0 lg:border-r border-hotel-charcoal/10">
            <label className="text-[10px] uppercase tracking-widest text-hotel-muted font-bold flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-hotel-cypress" />
              Check-Out
            </label>
            <input
              type="date"
              value={checkOut}
              min={format(addDays(new Date(checkIn || today), 1), 'yyyy-MM-dd')}
              onChange={(e) => setCheckOut(e.target.value)}
              className="bg-transparent text-sm font-semibold text-hotel-charcoal focus:outline-none cursor-pointer"
              required
            />
          </div>

          {/* Guests */}
          <div className="flex flex-col gap-1.5 px-3 py-2 border-b sm:border-b-0 sm:border-r border-hotel-charcoal/10">
            <label className="text-[10px] uppercase tracking-widest text-hotel-muted font-bold flex items-center gap-1.5">
              <Users className="w-3 h-3 text-hotel-cypress" />
              Guests
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value, 10))}
              className="bg-transparent text-sm font-semibold text-hotel-charcoal focus:outline-none cursor-pointer"
            >
              <option value={1}>1 Guest (Single)</option>
              <option value={2}>2 Guests (Couple)</option>
              <option value={3}>3 Guests</option>
              <option value={4}>4 Guests (Family)</option>
              <option value={5}>5+ Guests (Villa)</option>
            </select>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end px-2 pt-2 sm:pt-0">
            <button
              type="submit"
              className="w-full h-12 bg-hotel-cypress hover:bg-hotel-cypress-dark text-white rounded-full text-xs uppercase tracking-wider font-semibold transition-all duration-300 flex items-center justify-center gap-2 group shadow-subtle active:scale-[0.98]"
            >
              <span>Check Rates</span>
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Assurance Bar */}
      <div className="flex items-center justify-center gap-6 mt-3 text-[11px] text-hotel-muted font-medium">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-hotel-cypress" />
          Direct Booking Guaranteed Tariff
        </span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden sm:inline">30% Advance Deposit Only</span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden sm:inline">Zero Hidden Fees</span>
      </div>
    </div>
  );
}
