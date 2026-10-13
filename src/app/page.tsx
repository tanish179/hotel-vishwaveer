import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Hero } from '@/components/hero';
import { RoomCard } from '@/components/room-card';
import { StorySection } from '@/components/story-section';
import { DiningSection } from '@/components/dining-section';
import { AmenitiesSection } from '@/components/amenities-section';
import { LocationSection } from '@/components/location-section';
import { Footer } from '@/components/footer';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const roomTypes = db.getRoomTypes();
  const allRooms = db.getAllPhysicalRooms();

  // Attach available room counts
  const featuredRooms = roomTypes.map((type) => {
    const physicalRooms = allRooms.filter((r) => r.room_type_id === type.id && r.status === 'available');
    return {
      ...type,
      availableCount: physicalRooms.length,
      isSoldOut: physicalRooms.length === 0,
    };
  });

  return (
    <main className="min-h-screen bg-hotel-limestone flex flex-col">
      <Navbar />
      <Hero />

      {/* Featured Suites Section */}
      <section id="suites" className="py-16 sm:py-28 md:py-36 px-4 sm:px-6 md:px-12 bg-hotel-limestone border-b border-hotel-charcoal/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-hotel-muted font-bold block mb-2 sm:mb-3">
                Accommodations
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl text-hotel-charcoal font-normal tracking-tight">
                Suites &amp; Residences
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <p className="text-sm text-hotel-muted max-w-[40ch]">
                Ten bespoke physical rooms, each featuring private outdoor courtyards or terraces and artisanal stone masonry.
              </p>
              <Link
                href="/rooms"
                className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-hotel-cypress hover:text-hotel-cypress-dark transition-colors self-start sm:self-auto shrink-0"
              >
                <span>View All Inventory</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Room Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
            {featuredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      </section>

      {/* Narrative & Lifestyle Sections */}
      <StorySection />
      <DiningSection />
      <AmenitiesSection />
      <LocationSection />
      <Footer />
    </main>
  );
}
