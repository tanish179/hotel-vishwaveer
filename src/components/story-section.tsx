import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export function StorySection() {
  return (
    <section id="estate" className="py-28 md:py-36 px-6 md:px-12 bg-hotel-sand/50 border-b border-hotel-charcoal/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Asymmetric Typography Column */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hotel-charcoal/5 text-[10px] uppercase tracking-[0.2em] text-hotel-cypress font-medium w-fit mb-6">
              <Sparkles className="w-3 h-3 text-hotel-brass" />
              <span>Architectural Philosophy</span>
            </div>

            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-hotel-charcoal font-normal leading-[1.1] tracking-tight">
              Crafted in basalt stone, nurtured by silence.
            </h2>

            <div className="mt-8 space-y-6 text-hotel-muted text-base sm:text-lg leading-relaxed font-normal">
              <p>
                Hotel Vishwaveer was conceived as an antidote to transient hospitality. Located on the heritage fringes of Kolhapur, our estate honors vernacular Maratha masonry, hand-chiseled black basalt archways, and centuries-old teak timbers.
              </p>
              <p>
                Every suite opens to natural daylight and the whisper of frangipani leaves. With only ten private residences across two acres of landscaped gardens, your stay is unhurried, intimate, and deeply rooted in restorative calm.
              </p>
            </div>

            <div className="mt-10 flex items-center gap-6">
              <Link
                href="/rooms"
                className="group inline-flex items-center gap-3 bg-hotel-charcoal text-white px-6 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 hover:bg-hotel-cypress active:scale-[0.98]"
              >
                <span>Explore The 10 Suites</span>
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          </div>

          {/* Asymmetric Photographic Duo */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden shadow-elevated border border-hotel-charcoal/10">
              <Image
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
                alt="Architectural details of Hotel Vishwaveer courtyard and carved stone"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* Floating Overlap Card */}
            <div className="absolute -bottom-8 -left-6 sm:-left-10 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-card border border-hotel-charcoal/10 max-w-[280px] hidden sm:block">
              <span className="font-serif text-3xl font-semibold text-hotel-cypress block">
                10
              </span>
              <span className="text-xs uppercase tracking-wider text-hotel-charcoal font-medium block mt-1">
                Private Residences
              </span>
              <p className="text-[11px] text-hotel-muted mt-2 leading-relaxed">
                Guaranteed solitude with dedicated estate attendants and private courtyards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
