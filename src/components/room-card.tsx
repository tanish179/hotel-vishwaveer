'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Users, Bed, Maximize2, Check } from 'lucide-react';
import { RoomType } from '@/lib/types';
import { formatINR } from '@/lib/pricing';

export function RoomCard({
  room,
  checkIn,
  checkOut,
  guests,
}: {
  room: RoomType & { availableCount?: number; isSoldOut?: boolean };
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}) {
  const primaryImage =
    room.images?.find((img) => img.is_primary)?.image_url ||
    room.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80';

  const bookUrl = `/book?roomTypeId=${room.id}${
    checkIn ? `&checkIn=${encodeURIComponent(checkIn)}` : ''
  }${checkOut ? `&checkOut=${encodeURIComponent(checkOut)}` : ''}${
    guests ? `&guests=${guests}` : ''
  }`;

  return (
    <article className="doppelrand-shell group h-full flex flex-col justify-between">
      <div className="doppelrand-core flex flex-col h-full overflow-hidden bg-white">
        {/* Photographic Card Header */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-hotel-parchment">
          <Image
            src={primaryImage}
            alt={room.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Availability Pill */}
          <div className="absolute top-4 left-4 z-10">
            {room.isSoldOut ? (
              <span className="px-3 py-1 rounded-full bg-red-900/90 text-white text-[10px] font-semibold tracking-wider uppercase backdrop-blur-sm">
                Sold Out
              </span>
            ) : room.availableCount !== undefined && room.availableCount <= 1 ? (
              <span className="px-3 py-1 rounded-full bg-amber-800/90 text-white text-[10px] font-semibold tracking-wider uppercase backdrop-blur-sm">
                Last Suite Remaining
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-hotel-cypress/90 text-white text-[10px] font-semibold tracking-wider uppercase backdrop-blur-sm">
                Available
              </span>
            )}
          </div>

          {/* Size Tag */}
          <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 text-white/95 text-xs font-medium px-2.5 py-1 rounded-md bg-black/40 backdrop-blur-sm">
            <Maximize2 className="w-3 h-3" />
            <span>{room.room_size_sqft} sq ft</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="font-serif text-2xl font-medium text-hotel-charcoal group-hover:text-hotel-cypress transition-colors">
                {room.name}
              </h3>
            </div>

            <p className="text-xs text-hotel-muted font-normal line-clamp-2 leading-relaxed mb-6">
              {room.short_description}
            </p>

            {/* Room Specifications Grid */}
            <div className="grid grid-cols-2 gap-3 py-4 border-y border-hotel-charcoal/10 text-xs text-hotel-charcoal mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-hotel-cypress" />
                <span>Up to {room.max_guests} Guests</span>
              </div>
              <div className="flex items-center gap-2">
                <Bed className="w-3.5 h-3.5 text-hotel-cypress" />
                <span>{room.bed_type}</span>
              </div>
            </div>

            {/* Key Amenities */}
            <div className="flex flex-wrap gap-1.5 mb-8">
              {room.amenities.slice(0, 3).map((amenity, i) => (
                <span
                  key={i}
                  className="text-[11px] text-hotel-charcoal/80 bg-hotel-limestone px-2.5 py-1 rounded-md border border-hotel-charcoal/5 flex items-center gap-1"
                >
                  <Check className="w-2.5 h-2.5 text-hotel-cypress" />
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          {/* Pricing & CTA Footer */}
          <div className="pt-4 flex items-center justify-between border-t border-hotel-charcoal/10">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-hotel-muted block">
                Tariff per night
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-2xl font-semibold text-hotel-charcoal">
                  {formatINR(room.base_price_paise)}
                </span>
                <span className="text-[10px] text-hotel-muted">+ 12% GST</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/rooms/${room.slug}`}
                className="text-xs font-semibold uppercase tracking-wider text-hotel-charcoal/70 hover:text-hotel-charcoal px-3 py-2 rounded-full hover:bg-hotel-limestone transition-colors"
              >
                Details
              </Link>

              {room.isSoldOut ? (
                <button
                  disabled
                  className="px-4 py-2.5 rounded-full bg-gray-200 text-gray-500 text-xs uppercase font-semibold cursor-not-allowed"
                >
                  Sold Out
                </button>
              ) : (
                <Link
                  href={bookUrl}
                  className="inline-flex items-center gap-2 bg-hotel-cypress hover:bg-hotel-cypress-dark text-white text-xs uppercase font-semibold px-4 py-2.5 rounded-full transition-all group-hover:shadow-subtle active:scale-[0.98]"
                >
                  <span>Book</span>
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
