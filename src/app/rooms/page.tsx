import React from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { RoomCard } from '@/components/room-card';
import { BookingSearchBar } from '@/components/booking-search-bar';
import { db } from '@/lib/db';
import { calculateAuthoritativePrice } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

interface RoomsPageProps {
  searchParams: {
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  };
}

export default async function RoomsPage({ searchParams }: RoomsPageProps) {
  const { checkIn, checkOut, guests: guestsParam } = searchParams;
  const numGuests = parseInt(guestsParam || '2', 10);

  const roomTypes = db.getRoomTypes();
  const allRooms = db.getAllPhysicalRooms();
  const settings = db.getSettings();

  // Evaluate live availability per room type
  const processedRooms = roomTypes.map((type) => {
    const physicalRooms = allRooms.filter((r) => r.room_type_id === type.id && r.status === 'available');

    let availableCount = physicalRooms.length;
    let pricing = null;

    if (checkIn && checkOut) {
      try {
        pricing = calculateAuthoritativePrice({
          checkIn,
          checkOut,
          basePricePaise: type.base_price_paise,
          gstPercent: settings.gst_percent,
          advancePercent: settings.advance_payment_percent,
        });

        // Filter physical rooms that are free on the selected dates
        availableCount = physicalRooms.filter((r) =>
          db.isRoomAvailable({
            roomId: r.id,
            checkIn,
            checkOut,
          })
        ).length;
      } catch {
        // Date parse fallback
      }
    }

    return {
      ...type,
      totalPhysicalRooms: physicalRooms.length,
      availableCount,
      isSoldOut: availableCount === 0,
      pricing,
    };
  });

  return (
    <main className="min-h-screen bg-hotel-limestone flex flex-col">
      <Navbar />

      {/* Header Banner */}
      <section className="pt-36 pb-12 px-6 md:px-12 bg-hotel-sand/40 border-b border-hotel-charcoal/10">
        <div className="max-w-7xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.25em] text-hotel-muted font-bold block mb-3">
            Individual Inventory & Suites
          </span>
          <h1 className="font-serif text-5xl md:text-6xl text-hotel-charcoal font-normal tracking-tight">
            Accommodations & Residences
          </h1>
          <p className="mt-4 text-hotel-muted text-base sm:text-lg max-w-[60ch]">
            Every room at Vishwaveer is an individual architectural sanctum. Explore availability, amenities, and guaranteed direct tariffs.
          </p>

          {/* Interactive Date & Filter Bar */}
          <div className="mt-8">
            <BookingSearchBar
              initialCheckIn={checkIn}
              initialCheckOut={checkOut}
              initialGuests={numGuests}
            />
          </div>
        </div>
      </section>

      {/* Listing Grid */}
      <section className="py-20 px-6 md:px-12 flex-1">
        <div className="max-w-7xl mx-auto">
          {checkIn && checkOut && (
            <div className="mb-8 p-4 rounded-2xl bg-hotel-sand/60 border border-hotel-charcoal/10 flex flex-wrap items-center justify-between gap-4 text-xs">
              <span className="text-hotel-charcoal font-medium">
                Displaying real-time inventory for <strong>{checkIn}</strong> to{' '}
                <strong>{checkOut}</strong> ({numGuests} {numGuests === 1 ? 'Guest' : 'Guests'})
              </span>
              <span className="text-hotel-cypress font-semibold">
                30% advance deposit payable upon checkout
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {processedRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                checkIn={checkIn}
                checkOut={checkOut}
                guests={numGuests}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
