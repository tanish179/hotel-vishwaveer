import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Utensils, Coffee, Leaf, ArrowUpRight } from 'lucide-react';

export function DiningSection() {
  return (
    <section id="dining" className="py-28 md:py-36 px-6 md:px-12 bg-hotel-limestone border-b border-hotel-charcoal/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hotel-charcoal/5 text-[10px] uppercase tracking-[0.2em] text-hotel-cypress font-medium mb-4">
              <Utensils className="w-3 h-3 text-hotel-brass" />
              <span>Gastronomy</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-hotel-charcoal font-normal tracking-tight">
              The Courtyard Dining
            </h2>
          </div>
          <p className="text-sm md:text-base text-hotel-muted max-w-[45ch] leading-relaxed">
            Heirloom Maharashtrian recipes reimagined through slow-fire hearth cooking, local stone-ground spices, and organic produce harvested daily from neighboring estates.
          </p>
        </div>

        {/* Asymmetric 3-Tile Culinary Bento */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Large Visual Card */}
          <div className="lg:col-span-7 doppelrand-shell">
            <div className="doppelrand-core relative aspect-[16/11] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
                alt="Candlelit dining courtyard at Hotel Vishwaveer"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <span className="text-[10px] uppercase tracking-[0.2em] text-hotel-brass font-medium">
                  Signature Dinner
                </span>
                <h3 className="font-serif text-3xl font-medium mt-1">
                  Candlelit Basalt Veranda
                </h3>
                <p className="text-xs text-white/80 mt-2 max-w-[45ch]">
                  Nightly 7-course tastings paired with artisanal botanical infusions, hosted beneath fragrant frangipani branches.
                </p>
              </div>
            </div>
          </div>

          {/* Staggered Vertical Feature Cards */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            <div className="doppelrand-shell flex-1">
              <div className="doppelrand-core p-8 h-full flex flex-col justify-between bg-white">
                <div>
                  <div className="w-10 h-10 rounded-full bg-hotel-sand flex items-center justify-center text-hotel-cypress mb-4">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-2xl font-medium text-hotel-charcoal">
                    Deccan Morning Table
                  </h4>
                  <p className="text-xs text-hotel-muted mt-2 leading-relaxed">
                    Fresh pressed juices, traditional Kolhapuri jowar flatbreads, artisanal local goat milk cheeses, and estate roast pour-over coffees.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-hotel-cypress mt-4 uppercase tracking-wider block">
                  Complimentary for all in-house guests
                </span>
              </div>
            </div>

            <div className="doppelrand-shell flex-1">
              <div className="doppelrand-core p-8 h-full flex flex-col justify-between bg-white">
                <div>
                  <div className="w-10 h-10 rounded-full bg-hotel-sand flex items-center justify-center text-hotel-cypress mb-4">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-2xl font-medium text-hotel-charcoal">
                    Private In-Suite Dining
                  </h4>
                  <p className="text-xs text-hotel-muted mt-2 leading-relaxed">
                    Personalized multi-course menus prepared and served directly on your suite veranda or private plunge terrace.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-hotel-brass mt-4 uppercase tracking-wider block">
                  Available 24 Hours on Request
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
