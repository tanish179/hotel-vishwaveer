'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Compass } from 'lucide-react';
import { BookingSearchBar } from './booking-search-bar';
import gsap from 'gsap';

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Vestibular / Reduced Motion Guard
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1.1 } });

      tl.fromTo(
        headlineRef.current,
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, delay: 0.1 }
      )
        .fromTo(
          subtextRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0 },
          '-=0.7'
        )
        .fromTo(
          searchWrapRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0 },
          '-=0.6'
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[92dvh] flex flex-col justify-between pt-32 pb-16 px-6 md:px-12 bg-hotel-limestone overflow-hidden border-b border-hotel-charcoal/10"
    >
      {/* Background Architectural Texture & Subtle Gradient */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[55vw] h-[75vh] opacity-25 rounded-bl-[12rem] overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=85"
            alt="Hotel Vishwaveer Heritage Estate Courtyard"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-hotel-limestone via-hotel-limestone/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-hotel-limestone/50 to-hotel-limestone" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-hotel-charcoal/5 border border-hotel-charcoal/10 text-[10px] tracking-[0.25em] uppercase text-hotel-cypress font-medium mb-8">
          <Compass className="w-3 h-3 text-hotel-brass" />
          <span>Historic Kolhapur · Heritage Estate</span>
        </div>

        {/* Master Headline */}
        <div className="max-w-4xl">
          <h1
            ref={headlineRef}
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-hotel-charcoal font-normal leading-[1.05]"
          >
            Where Heritage Breathes <span className="italic font-light text-hotel-cypress">in Stone</span> & Silence.
          </h1>

          <p
            ref={subtextRef}
            className="mt-6 text-base sm:text-lg md:text-xl text-hotel-muted font-sans font-normal max-w-[58ch] leading-relaxed"
          >
            A restored sanctuary of quiet Deccan luxury. Ten handcrafted suites, private courtyard verandas, and authentic culinary traditions framed by timeless architecture.
          </p>
        </div>
      </div>

      {/* Booking Search Engine directly in initial viewport */}
      <div ref={searchWrapRef} className="relative z-10 max-w-7xl mx-auto w-full mt-12">
        <BookingSearchBar />
      </div>
    </section>
  );
}
