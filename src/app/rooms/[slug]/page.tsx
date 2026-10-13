import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Users,
  Bed,
  Maximize2,
  Compass,
  Check,
  ShieldCheck,
  Clock,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { db } from '@/lib/db';
import { formatINR, calculateAuthoritativePrice } from '@/lib/pricing';
import { addDays, format } from 'date-fns';

export const dynamic = 'force-dynamic';

interface RoomDetailPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    checkIn?: string;
    checkOut?: string;
  };
}

export default async function RoomDetailPage({ params, searchParams }: RoomDetailPageProps) {
  const { slug } = params;
  const room = db.getRoomTypeBySlug(slug);

  if (!room) {
    notFound();
  }

  const settings = db.getSettings();
  const allRooms = db.getAllPhysicalRooms();
  const physicalRooms = allRooms.filter((r) => r.room_type_id === room.id && r.status === 'available');

  const today = new Date();
  const checkIn = searchParams.checkIn || format(addDays(today, 1), 'yyyy-MM-dd');
  const checkOut = searchParams.checkOut || format(addDays(today, 3), 'yyyy-MM-dd');

  // Compute live price breakdown
  let pricing = null;
  let availableCount = physicalRooms.length;

  try {
    pricing = calculateAuthoritativePrice({
      checkIn,
      checkOut,
      basePricePaise: room.base_price_paise,
      gstPercent: settings.gst_percent,
      advancePercent: settings.advance_payment_percent,
    });

    availableCount = physicalRooms.filter((r) =>
      db.isRoomAvailable({
        roomId: r.id,
        checkIn,
        checkOut,
      })
    ).length;
  } catch {
    // fallback
  }

  const primaryImage =
    room.images?.find((i) => i.is_primary)?.image_url ||
    room.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80';

  const checkoutUrl = `/book?roomTypeId=${room.id}&checkIn=${encodeURIComponent(
    checkIn
  )}&checkOut=${encodeURIComponent(checkOut)}`;

  return (
    <main className="min-h-screen bg-hotel-limestone flex flex-col">
      <Navbar />

      {/* Top Breadcrumb & Title */}
      <section className="pt-32 pb-8 px-6 md:px-12 border-b border-hotel-charcoal/10 bg-hotel-sand/30">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/rooms"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-hotel-muted hover:text-hotel-charcoal transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Suites</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-hotel-cypress font-medium block mb-2">
                Suite Portfolio · {room.view_type}
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-hotel-charcoal font-normal">
                {room.name}
              </h1>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-xs uppercase tracking-wider text-hotel-muted">Starting from</span>
              <span className="font-serif text-3xl font-semibold text-hotel-charcoal">
                {formatINR(room.base_price_paise)}
              </span>
              <span className="text-xs text-hotel-muted">/ night + GST</span>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-10 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Primary Big Photo */}
            <div className="lg:col-span-8 relative aspect-[16/10] rounded-3xl overflow-hidden shadow-elevated border border-hotel-charcoal/10">
              <Image
                src={primaryImage}
                alt={room.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
            </div>

            {/* Thumbnail Stack */}
            <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-6">
              {(room.images?.slice(1, 3) || []).map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-hotel-charcoal/10"
                >
                  <Image
                    src={img.image_url}
                    alt={img.alt_text}
                    fill
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Content & Direct Reservation Column */}
      <section className="py-12 px-6 md:px-12 flex-1">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Details */}
          <div className="lg:col-span-7 space-y-12">
            {/* Key Specs Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl bg-white border border-hotel-charcoal/10">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-hotel-muted font-bold flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-hotel-cypress" />
                  Space
                </span>
                <span className="text-sm font-semibold text-hotel-charcoal">
                  {room.room_size_sqft} sq ft
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-hotel-muted font-bold flex items-center gap-1.5">
                  <Bed className="w-3.5 h-3.5 text-hotel-cypress" />
                  Bed
                </span>
                <span className="text-sm font-semibold text-hotel-charcoal">
                  {room.bed_type}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-hotel-muted font-bold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-hotel-cypress" />
                  Capacity
                </span>
                <span className="text-sm font-semibold text-hotel-charcoal">
                  {room.max_guests} Guests
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-hotel-muted font-bold flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-hotel-cypress" />
                  View
                </span>
                <span className="text-sm font-semibold text-hotel-charcoal">
                  {room.view_type}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="font-serif text-3xl font-medium text-hotel-charcoal mb-4">
                About this Residence
              </h2>
              <p className="text-hotel-muted text-base leading-relaxed">
                {room.full_description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div>
              <h2 className="font-serif text-3xl font-medium text-hotel-charcoal mb-6">
                Room Amenities & Inclusions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {room.amenities.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white border border-hotel-charcoal/10 flex items-center gap-3 text-xs font-medium text-hotel-charcoal"
                  >
                    <Check className="w-4 h-4 text-hotel-cypress shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timings & House Policies */}
            <div className="p-6 rounded-2xl bg-hotel-sand/50 border border-hotel-charcoal/10 space-y-4">
              <h3 className="font-serif text-xl font-medium text-hotel-charcoal">
                Hospitality Policies & Standards
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-hotel-muted">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-hotel-cypress shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-hotel-charcoal block">Check-In / Out</strong>
                    Check-in: 14:00 PM · Check-out: 11:00 AM
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-hotel-cypress shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-hotel-charcoal block">Advance Deposit</strong>
                    30% advance required online; 70% balance at hotel.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Direct Price Calculator & Checkout Card */}
          <div className="lg:col-span-5 sticky top-28">
            <div className="doppelrand-shell shadow-elevated">
              <div className="doppelrand-core p-6 md:p-8 bg-white">
                <span className="text-[10px] uppercase tracking-[0.2em] text-hotel-muted font-bold block mb-2">
                  Direct Reservation
                </span>
                <h3 className="font-serif text-2xl font-medium text-hotel-charcoal mb-6">
                  Select Dates & Tariff
                </h3>

                {/* Date Inputs */}
                <form action={`/rooms/${room.slug}`} method="GET" className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-hotel-muted font-bold block mb-1">
                        Check-In
                      </label>
                      <input
                        type="date"
                        name="checkIn"
                        defaultValue={checkIn}
                        className="w-full text-xs font-semibold p-2.5 rounded-lg border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-hotel-muted font-bold block mb-1">
                        Check-Out
                      </label>
                      <input
                        type="date"
                        name="checkOut"
                        defaultValue={checkOut}
                        className="w-full text-xs font-semibold p-2.5 rounded-lg border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-hotel-limestone hover:bg-hotel-sand text-hotel-charcoal text-xs font-semibold uppercase tracking-wider rounded-lg border border-hotel-charcoal/10 transition-colors"
                  >
                    Recalculate Price
                  </button>
                </form>

                {/* Authoritative Price Breakdown */}
                {pricing && (
                  <div className="pt-4 border-t border-hotel-charcoal/10 space-y-3 text-xs">
                    <div className="flex justify-between text-hotel-muted">
                      <span>
                        {formatINR(room.base_price_paise)} × {pricing.nights} {pricing.nights === 1 ? 'night' : 'nights'}
                      </span>
                      <span className="text-hotel-charcoal font-medium">
                        {formatINR(pricing.subtotal_paise)}
                      </span>
                    </div>

                    <div className="flex justify-between text-hotel-muted">
                      <span>Taxes & GST (12%)</span>
                      <span className="text-hotel-charcoal font-medium">
                        {formatINR(pricing.gst_amount_paise)}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-dashed border-hotel-charcoal/20 flex justify-between font-serif text-lg text-hotel-charcoal font-bold">
                      <span>Total Reservation</span>
                      <span>{formatINR(pricing.total_amount_paise)}</span>
                    </div>

                    {/* 30% Advance Deposit Callout */}
                    <div className="p-3.5 rounded-xl bg-hotel-cypress/5 border border-hotel-cypress/20 space-y-1.5 mt-4">
                      <div className="flex justify-between text-xs font-bold text-hotel-cypress">
                        <span>Advance Required (30%)</span>
                        <span>{formatINR(pricing.advance_amount_paise)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-hotel-muted">
                        <span>Remaining Balance at Check-In</span>
                        <span>{formatINR(pricing.balance_amount_paise)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="mt-8">
                  {availableCount === 0 ? (
                    <button
                      disabled
                      className="w-full py-4 rounded-full bg-gray-200 text-gray-500 text-xs font-semibold uppercase tracking-wider cursor-not-allowed"
                    >
                      Sold Out for Selected Dates
                    </button>
                  ) : (
                    <Link
                      href={checkoutUrl}
                      className="w-full py-4 rounded-full bg-hotel-cypress hover:bg-hotel-cypress-dark text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-subtle active:scale-[0.98]"
                    >
                      <span>Proceed to Guest Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                  <p className="text-center text-[10px] text-hotel-muted mt-3">
                    Instant confirmation · Secure 30% advance via Razorpay
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
