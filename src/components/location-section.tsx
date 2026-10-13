import React from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, ExternalLink } from 'lucide-react';

export function LocationSection() {
  return (
    <section id="location" className="py-28 md:py-36 px-6 md:px-12 bg-hotel-limestone border-b border-hotel-charcoal/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Practical Info & Policies */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hotel-charcoal/5 text-[10px] uppercase tracking-[0.2em] text-hotel-cypress font-medium mb-4">
                <MapPin className="w-3 h-3 text-hotel-brass" />
                <span>Kolhapur · Maharashtra</span>
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl text-hotel-charcoal font-normal tracking-tight">
                Arrival & Location
              </h2>
              <p className="mt-4 text-hotel-muted text-sm sm:text-base leading-relaxed">
                Tucked away on the tranquil perimeter of Kolhapur, surrounded by private acreage yet within effortless reach of historical landmarks.
              </p>
            </div>

            {/* Timings & Policies Card */}
            <div className="mt-8 doppelrand-shell">
              <div className="doppelrand-core p-6 bg-white space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-hotel-cypress shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-hotel-charcoal block">
                      Check-In: 14:00 (2:00 PM) · Check-Out: 11:00 AM
                    </span>
                    <span className="text-[11px] text-hotel-muted">
                      Early check-in and luggage storage available upon advance request.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-hotel-charcoal/10">
                  <ShieldCheck className="w-4 h-4 text-hotel-cypress shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-hotel-charcoal block">
                      Guaranteed Advance Policy
                    </span>
                    <span className="text-[11px] text-hotel-muted">
                      30% advance secure deposit secures your reservation. The remaining 70% balance is payable at the hotel.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-hotel-charcoal/10">
                  <Mail className="w-4 h-4 text-hotel-cypress shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-hotel-charcoal block">
                      Concierge Desk
                    </span>
                    <a
                      href="mailto:reservations@hotelvishwaveer.in"
                      className="text-[11px] text-hotel-cypress hover:underline block"
                    >
                      reservations@hotelvishwaveer.in
                    </a>
                    <a
                      href="tel:+912312654400"
                      className="text-[11px] text-hotel-muted hover:underline"
                    >
                      +91 231 265 4400
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Details & Map Card */}
          <div className="lg:col-span-7 doppelrand-shell">
            <div className="doppelrand-core p-8 md:p-10 bg-hotel-sand/80 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-hotel-muted font-bold block mb-2">
                  Estate Address
                </span>
                <p className="font-serif text-2xl text-hotel-charcoal font-medium leading-snug">
                  Vishwaveer Heritage Estate, Ring Road, Kolhapur, Maharashtra 416008, India
                </p>

                {/* Regional Distances */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-hotel-charcoal/10">
                  <div>
                    <span className="font-serif text-xl font-semibold text-hotel-cypress block">
                      15 Mins
                    </span>
                    <span className="text-xs text-hotel-muted mt-1 block">
                      Mahalaxmi Temple
                    </span>
                  </div>
                  <div>
                    <span className="font-serif text-xl font-semibold text-hotel-cypress block">
                      20 Mins
                    </span>
                    <span className="text-xs text-hotel-muted mt-1 block">
                      Kolhapur Airport (KLH)
                    </span>
                  </div>
                  <div>
                    <span className="font-serif text-xl font-semibold text-hotel-cypress block">
                      40 Mins
                    </span>
                    <span className="text-xs text-hotel-muted mt-1 block">
                      Panhala Hill Fort
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-hotel-charcoal/10 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-hotel-muted">
                  Coordinates: 16.7050° N, 74.2433° E
                </span>
                <a
                  href="https://maps.google.com/?q=Kolhapur,Maharashtra,India"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-hotel-charcoal text-white text-xs uppercase tracking-wider font-semibold hover:bg-hotel-cypress transition-colors"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
