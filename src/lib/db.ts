// ============================================================================
// HOTEL VISHWAVEER: PRODUCTION DATABASE & REPOSITORY LAYER
// Concurrency-Safe Data Access Layer with Supabase & Relational Store
// ============================================================================

import {
  Booking,
  BookingStatus,
  Guest,
  HotelSettings,
  PaymentOrder,
  PaymentTransaction,
  PhysicalRoom,
  RoomBlock,
  RoomType,
  AuditLog,
} from './types';
import { calculateAuthoritativePrice } from './pricing';
import { isBefore, parseISO } from 'date-fns';

// ----------------------------------------------------------------------------
// INITIAL SEED DATA STORE
// (Loaded in memory with persistence across API requests in Node.js server)
// ----------------------------------------------------------------------------

const initialSettings: HotelSettings = {
  id: '00000000-0000-0000-0000-000000000001',
  hotel_name: 'Hotel Vishwaveer',
  tagline: 'A Sanctuary of Refined Heritage, Stone Architecture & Quiet Luxury',
  address: 'Vishwaveer Heritage Estate, Ring Road, Kolhapur, Maharashtra 416008, India',
  phone: '+91 231 265 4400',
  email: 'reservations@hotelvishwaveer.in',
  website: 'https://hotelvishwaveer.in',
  currency: 'INR',
  currency_symbol: '₹',
  timezone: 'Asia/Kolkata',
  check_in_time: '14:00',
  check_out_time: '11:00',
  advance_payment_percent: 30.0,
  gst_percent: 12.0,
  cancellation_policy:
    'Complimentary cancellation up to 48 hours prior to check-in. Cancellations within 48 hours forfeit the 30% advance deposit.',
  hold_duration_minutes: 15,
  razorpay_key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_51MockVishwa99',
  logo_url: '/brand/logo.svg',
  hero_image_url:
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=85',
  updated_at: new Date().toISOString(),
};

const initialRoomTypes: RoomType[] = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    slug: 'deluxe-heritage-room',
    name: 'Deluxe Heritage Room',
    short_description:
      'Carved teak woodwork, limestone floorings, and a tranquil courtyard garden view.',
    full_description:
      'Thoughtfully curated for discerning travelers, the Deluxe Heritage Room captures the timeless soul of Deccan craftsmanship. Features restored stone masonry, bespoke handcrafted teakwood furniture, natural Belgian linen bedding, and a sunlit marble bathroom with rainfall shower and organic ayurvedic botanicals.',
    base_price_paise: 650000, // ₹6,500/night
    weekend_price_paise: 750000,
    max_guests: 2,
    max_adults: 2,
    max_children: 1,
    bed_type: 'California King Bed',
    room_size_sqft: 380,
    view_type: 'Central Courtyard & Frangipani Garden',
    amenities: [
      'High-Speed Wi-Fi 6',
      'Artisan Tea & French Press Coffee',
      'Rainfall Forest Shower',
      'Organic Forest Essentials Toiletries',
      'Custom Teak Workdesk',
      'Bose Bluetooth Audio',
      'In-Room Mineral Water Bar',
      'Climate Controlled Inverter AC',
    ],
    is_active: true,
    sort_order: 1,
    images: [
      {
        id: 'img-101-1',
        room_type_id: '11111111-1111-1111-1111-111111111101',
        image_url:
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
        alt_text: 'Deluxe Heritage Bedroom with warm lighting and teak furnishings',
        caption: 'Bedroom view with natural linen',
        is_primary: true,
        display_order: 1,
      },
      {
        id: 'img-101-2',
        room_type_id: '11111111-1111-1111-1111-111111111101',
        image_url:
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
        alt_text: 'Ensuite limestone bathroom with rainfall shower',
        caption: 'Artisanal stone bathroom',
        is_primary: false,
        display_order: 2,
      },
      {
        id: 'img-101-3',
        room_type_id: '11111111-1111-1111-1111-111111111101',
        image_url:
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
        alt_text: 'Detail of teak desk and reading lounge',
        caption: 'Bespoke heritage furniture',
        is_primary: false,
        display_order: 3,
      },
    ],
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    slug: 'courtyard-suite',
    name: 'Courtyard Suite',
    short_description:
      'Generous private veranda, freestanding soaking tub, and separate day lounge.',
    full_description:
      'Our Courtyard Suite seamlessly merges indoor tranquility with the outdoors. Glass pocket doors slide back to reveal your private shaded veranda enveloped in bougainvillea. Inside, a plush seating lounge, soaking stone bathtub, and a handwoven wool rug invite deep decompression after estate wanderings.',
    base_price_paise: 980000, // ₹9,800/night
    weekend_price_paise: 1150000,
    max_guests: 3,
    max_adults: 3,
    max_children: 1,
    bed_type: 'Emperor Teak Bed',
    room_size_sqft: 540,
    view_type: 'Private Garden & Water Lily Pond',
    amenities: [
      'Private Veranda with Daybed',
      'Handcrafted Freestanding Stone Tub',
      'Separate Living Lounge',
      'High-Speed Wi-Fi 6',
      'Artisan Bar & Pour-Over Station',
      'Walk-in Dressing Wardrobe',
      'Twice-Daily Housekeeping & Turndown',
      'Smart 4K Frame Display',
    ],
    is_active: true,
    sort_order: 2,
    images: [
      {
        id: 'img-102-1',
        room_type_id: '11111111-1111-1111-1111-111111111102',
        image_url:
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
        alt_text: 'Courtyard Suite with open veranda doors and daybed',
        caption: 'Private veranda overlooking water gardens',
        is_primary: true,
        display_order: 1,
      },
      {
        id: 'img-102-2',
        room_type_id: '11111111-1111-1111-1111-111111111102',
        image_url:
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
        alt_text: 'Freestanding stone bathtub with botanical view',
        caption: 'Soaking stone bath pavilion',
        is_primary: false,
        display_order: 2,
      },
      {
        id: 'img-102-3',
        room_type_id: '11111111-1111-1111-1111-111111111102',
        image_url:
          'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
        alt_text: 'Lounge seating area with handwoven rug',
        caption: 'Inner living lounge',
        is_primary: false,
        display_order: 3,
      },
    ],
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    slug: 'royal-veranda-suite',
    name: 'Royal Veranda Suite',
    short_description:
      'Panoramic estate vistas, private plunge terrace, and dedicated butler service.',
    full_description:
      'Perched on the upper gallery of the heritage wing, the Royal Veranda Suite offers uninhibited horizons over the Western Ghat foothills. High arched ceilings, antique brass chandeliers, a secluded open-air heated plunge pool, and personalized in-suite dining service define this signature retreat.',
    base_price_paise: 1450000, // ₹14,500/night
    weekend_price_paise: 1680000,
    max_guests: 3,
    max_adults: 2,
    max_children: 2,
    bed_type: 'Hand-Carved Canopy Bed',
    room_size_sqft: 720,
    view_type: 'Panoramic Foothill & Canopy Vistas',
    amenities: [
      'Private Heated Plunge Pool',
      'Dedicated Butler On-Call',
      'Panoramic Wrap-around Balcony',
      'Walk-in Dressing Room',
      'Dual Vanity Limestone Bath',
      'Complimentary High-Tea Experience',
      'Vintage Record Player with Curated Vinyl',
      'Complimentary Laundry Service',
    ],
    is_active: true,
    sort_order: 3,
    images: [
      {
        id: 'img-103-1',
        room_type_id: '11111111-1111-1111-1111-111111111103',
        image_url:
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
        alt_text: 'Royal Veranda Suite interior with vaulted ceiling and canopy bed',
        caption: 'Upper gallery sanctuary',
        is_primary: true,
        display_order: 1,
      },
      {
        id: 'img-103-2',
        room_type_id: '11111111-1111-1111-1111-111111111103',
        image_url:
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
        alt_text: 'Private heated plunge pool overlooking foothill canopy',
        caption: 'Open-air private plunge terrace',
        is_primary: false,
        display_order: 2,
      },
    ],
  },
  {
    id: '11111111-1111-1111-1111-111111111104',
    slug: 'the-vishwaveer-residence',
    name: 'The Vishwaveer Residence',
    short_description:
      'Our premier two-bedroom private sanctuary with private lap pool and dining pavilion.',
    full_description:
      'The pinnacle of hospitality at Vishwaveer. A secluded estate residence spanning two expansive en-suite bedrooms, a chef dining pavilion, private infinity-edge lap pool, and lush walled courtyard gardens. Ideal for multi-generational families or privacy-seeking luminaries desiring complete seclusion.',
    base_price_paise: 2400000, // ₹24,000/night
    weekend_price_paise: 2750000,
    max_guests: 5,
    max_adults: 4,
    max_children: 2,
    bed_type: 'Two Master King Suites',
    room_size_sqft: 1250,
    view_type: 'Private Walled Garden & Foothills',
    amenities: [
      'Private Infinity Lap Pool',
      'Exclusive In-Residence Chef Dining',
      'Two Master Bedroom En-Suites',
      'Private Garden Pavilion & Firepit',
      'Chauffeur Airport Transfers Included',
      'Full Premium Beverage Bar',
      'Private Yoga Instructor on Request',
      '24/7 Dedicated Estate Concierge',
    ],
    is_active: true,
    sort_order: 4,
    images: [
      {
        id: 'img-104-1',
        room_type_id: '11111111-1111-1111-1111-111111111104',
        image_url:
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
        alt_text: 'The Vishwaveer Residence exterior and private lap pool at dusk',
        caption: 'Private estate residence and lap pool',
        is_primary: true,
        display_order: 1,
      },
      {
        id: 'img-104-2',
        room_type_id: '11111111-1111-1111-1111-111111111104',
        image_url:
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        alt_text: 'Private living pavilion and courtyard dining area',
        caption: 'In-residence dining pavilion',
        is_primary: false,
        display_order: 2,
      },
    ],
  },
];

const initialRooms: PhysicalRoom[] = [
  {
    id: '22222222-2222-2222-2222-222222222101',
    room_number: '101',
    room_type_id: '11111111-1111-1111-1111-111111111101',
    floor: 1,
    status: 'available',
    notes: 'Ground floor heritage wing with direct garden path access',
  },
  {
    id: '22222222-2222-2222-2222-222222222102',
    room_number: '102',
    room_type_id: '11111111-1111-1111-1111-111111111101',
    floor: 1,
    status: 'available',
    notes: 'Corner courtyard room, secluded and quiet',
  },
  {
    id: '22222222-2222-2222-2222-222222222103',
    room_number: '103',
    room_type_id: '11111111-1111-1111-1111-111111111101',
    floor: 1,
    status: 'available',
    notes: 'Adjacent to the central frangipani reflection pond',
  },
  {
    id: '22222222-2222-2222-2222-222222222201',
    room_number: '201',
    room_type_id: '11111111-1111-1111-1111-111111111102',
    floor: 2,
    status: 'available',
    notes: 'First floor terrace with bougainvillea trellises',
  },
  {
    id: '22222222-2222-2222-2222-222222222202',
    room_number: '202',
    room_type_id: '11111111-1111-1111-1111-111111111102',
    floor: 2,
    status: 'available',
    notes: 'Central suite with dual verandas',
  },
  {
    id: '22222222-2222-2222-2222-222222222203',
    room_number: '203',
    room_type_id: '11111111-1111-1111-1111-111111111102',
    floor: 2,
    status: 'available',
    notes: 'Garden-facing suite with extra large stone bath',
  },
  {
    id: '22222222-2222-2222-2222-222222222301',
    room_number: '301',
    room_type_id: '11111111-1111-1111-1111-111111111103',
    floor: 3,
    status: 'available',
    notes: 'Penthouse level with heated plunge pool and mountain views',
  },
  {
    id: '22222222-2222-2222-2222-222222222302',
    room_number: '302',
    room_type_id: '11111111-1111-1111-1111-111111111103',
    floor: 3,
    status: 'available',
    notes: 'Upper gallery suite with sunset orientation',
  },
  {
    id: '22222222-2222-2222-2222-222222222401',
    room_number: 'Villa 1',
    room_type_id: '11111111-1111-1111-1111-111111111104',
    floor: 1,
    status: 'available',
    notes: 'Private gated estate compound with 15m lap pool',
  },
  {
    id: '22222222-2222-2222-2222-222222222402',
    room_number: 'Villa 2',
    room_type_id: '11111111-1111-1111-1111-111111111104',
    floor: 1,
    status: 'available',
    notes: 'Secluded east pavilion with private chef garden',
  },
];

const initialGuests: Guest[] = [
  {
    id: '33333333-3333-3333-3333-333333333001',
    full_name: 'Aarav Singhania',
    email: 'aarav.singhania@example.com',
    phone: '+91 98201 54321',
    city: 'Mumbai',
    country: 'India',
    created_at: new Date().toISOString(),
  },
  {
    id: '33333333-3333-3333-3333-333333333002',
    full_name: 'Devika Nambiar',
    email: 'devika.nambiar@example.com',
    phone: '+91 98450 12345',
    city: 'Bengaluru',
    country: 'India',
    created_at: new Date().toISOString(),
  },
];

const initialBookings: Booking[] = [
  {
    id: '44444444-4444-4444-4444-444444444001',
    booking_reference: 'VWV-2026-9481',
    room_id: '22222222-2222-2222-2222-222222222201', // Room 201
    room_type_id: '11111111-1111-1111-1111-111111111102',
    guest_id: '33333333-3333-3333-3333-333333333001',
    check_in: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    check_out: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    nights: 3,
    num_guests: 2,
    base_rate_paise: 980000,
    subtotal_paise: 2940000,
    gst_percent: 12.0,
    gst_amount_paise: 352800,
    total_amount_paise: 3292800,
    advance_amount_paise: 987840,
    balance_amount_paise: 2304960,
    advance_paid_paise: 987840,
    balance_paid_paise: 0,
    status: 'confirmed',
    special_requests: 'Anniversary celebration; quiet room preferred.',
    estimated_arrival_time: '15:30',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const initialPayments: PaymentTransaction[] = [
  {
    id: 'tx-001',
    booking_id: '44444444-4444-4444-4444-444444444001',
    payment_type: 'advance_online',
    payment_method: 'razorpay',
    razorpay_payment_id: 'pay_test_demo_001',
    razorpay_signature: 'sig_verified_mock_001',
    amount_paise: 987840,
    currency: 'INR',
    status: 'success',
    recorded_by: 'gateway',
    verified_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

// ----------------------------------------------------------------------------
// SINGLETON IN-MEMORY DATABASE STATE (FOR CONCURRENCY & ZERO LATENCY)
// ----------------------------------------------------------------------------

interface StoreState {
  settings: HotelSettings;
  roomTypes: RoomType[];
  rooms: PhysicalRoom[];
  roomBlocks: RoomBlock[];
  guests: Guest[];
  bookings: Booking[];
  paymentOrders: PaymentOrder[];
  payments: PaymentTransaction[];
  auditLogs: AuditLog[];
  // Mutex lock map by room ID to serialize concurrent bookings
  roomLocks: Map<string, Promise<void>>;
}

declare global {
  // eslint-disable-next-line no-var
  var __HOTEL_VISHWAVEER_STORE__: StoreState | undefined;
}

function getStore(): StoreState {
  if (!global.__HOTEL_VISHWAVEER_STORE__) {
    global.__HOTEL_VISHWAVEER_STORE__ = {
      settings: { ...initialSettings },
      roomTypes: JSON.parse(JSON.stringify(initialRoomTypes)),
      rooms: JSON.parse(JSON.stringify(initialRooms)),
      roomBlocks: [],
      guests: JSON.parse(JSON.stringify(initialGuests)),
      bookings: JSON.parse(JSON.stringify(initialBookings)),
      paymentOrders: [],
      payments: JSON.parse(JSON.stringify(initialPayments)),
      auditLogs: [],
      roomLocks: new Map(),
    };
  }
  return global.__HOTEL_VISHWAVEER_STORE__;
}

// ----------------------------------------------------------------------------
// REPOSITORY METHODS
// ----------------------------------------------------------------------------

export const db = {
  getStore(): StoreState {
    return getStore();
  },

  updateGuest(guestId: string, updates: Partial<Guest>): Guest | null {
    const store = getStore();
    const guest = store.guests.find((g) => g.id === guestId);
    if (!guest) return null;
    if (updates.full_name !== undefined) guest.full_name = updates.full_name.trim();
    if (updates.email !== undefined) guest.email = updates.email.trim().toLowerCase();
    if (updates.phone !== undefined) guest.phone = updates.phone.trim();
    if (updates.city !== undefined) guest.city = updates.city.trim();
    if (updates.country !== undefined) guest.country = updates.country.trim();
    return { ...guest };
  },

  // Hotel Settings
  getSettings(): HotelSettings {
    const store = getStore();
    return { ...store.settings };
  },

  updateSettings(updates: Partial<HotelSettings>, actor = 'admin'): HotelSettings {
    const store = getStore();
    store.settings = {
      ...store.settings,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    db.logAudit({
      actor_id: actor,
      action: 'UPDATE_HOTEL_SETTINGS',
      entity_type: 'hotel_settings',
      entity_id: store.settings.id,
      changes: updates,
    });
    return { ...store.settings };
  },

  // Room Types
  getRoomTypes(): RoomType[] {
    const store = getStore();
    return store.roomTypes.filter((rt) => rt.is_active);
  },

  getRoomTypeBySlug(slug: string): RoomType | null {
    const store = getStore();
    const rt = store.roomTypes.find((r) => r.slug === slug);
    return rt ? { ...rt } : null;
  },

  // Physical Rooms
  getAllPhysicalRooms(): PhysicalRoom[] {
    const store = getStore();
    return store.rooms.map((room) => ({
      ...room,
      room_type: store.roomTypes.find((rt) => rt.id === room.room_type_id),
    }));
  },

  // Availability Logic: Check-out date is EXCLUSIVE!
  isRoomAvailable({
    roomId,
    checkIn,
    checkOut,
    excludeBookingId,
  }: {
    roomId: string;
    checkIn: string; // YYYY-MM-DD
    checkOut: string; // YYYY-MM-DD
    excludeBookingId?: string;
  }): boolean {
    const store = getStore();
    const now = new Date();

    // 1. Check room operational status
    const room = store.rooms.find((r) => r.id === roomId);
    if (!room || room.status !== 'available') {
      return false;
    }

    // 2. Check maintenance blocks
    const hasBlockConflict = store.roomBlocks.some(
      (block) =>
        block.room_id === roomId &&
        block.status === 'active' &&
        block.start_date < checkOut &&
        block.end_date > checkIn
    );
    if (hasBlockConflict) {
      return false;
    }

    // 3. Check conflicting bookings
    const hasBookingConflict = store.bookings.some((b) => {
      if (b.room_id !== roomId) return false;
      if (excludeBookingId && b.id === excludeBookingId) return false;

      // Only active holds or confirmed/checked-in reservations conflict
      const isConfirmed = b.status === 'confirmed' || b.status === 'checked_in';
      const isHeld =
        b.status === 'held' && b.hold_expires_at && !isBefore(parseISO(b.hold_expires_at), now);

      if (!isConfirmed && !isHeld) return false;

      // Date overlap check: (b.check_in < checkOut) AND (b.check_out > checkIn)
      return b.check_in < checkOut && b.check_out > checkIn;
    });

    return !hasBookingConflict;
  },

  // Find an available physical room for a given room type
  findAvailableRoomForType({
    roomTypeId,
    checkIn,
    checkOut,
  }: {
    roomTypeId: string;
    checkIn: string;
    checkOut: string;
  }): PhysicalRoom | null {
    const store = getStore();
    const candidateRooms = store.rooms.filter(
      (r) => r.room_type_id === roomTypeId && r.status === 'available'
    );

    for (const room of candidateRooms) {
      if (
        db.isRoomAvailable({
          roomId: room.id,
          checkIn,
          checkOut,
        })
      ) {
        return {
          ...room,
          room_type: store.roomTypes.find((rt) => rt.id === room.room_type_id),
        };
      }
    }
    return null;
  },

  // Atomic Booking Hold Creation with mutex lock per room to prevent race conditions
  async createBookingHold({
    roomId,
    roomTypeId,
    checkIn,
    checkOut,
    guestName,
    guestEmail,
    guestPhone,
    numGuests,
    specialRequests,
    estimatedArrivalTime,
  }: {
    roomId?: string;
    roomTypeId: string;
    checkIn: string;
    checkOut: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    numGuests: number;
    specialRequests?: string;
    estimatedArrivalTime?: string;
  }): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    const store = getStore();
    db.expireStaleHolds();

    // Determine target room
    let targetRoom: PhysicalRoom | null = null;
    if (roomId) {
      const candidate = store.rooms.find((r) => r.id === roomId);
      if (candidate && db.isRoomAvailable({ roomId, checkIn, checkOut })) {
        targetRoom = candidate;
      }
    } else {
      targetRoom = db.findAvailableRoomForType({ roomTypeId, checkIn, checkOut });
    }

    if (!targetRoom) {
      return {
        success: false,
        error: 'No rooms available for the selected dates and category.',
      };
    }

    // Concurrency Lock: Serialize hold attempts on this physical room
    const targetRoomId = targetRoom.id;
    let releaseLock: () => void = () => {};
    const lockPromise = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });
    const currentLock = store.roomLocks.get(targetRoomId) || Promise.resolve();
    store.roomLocks.set(targetRoomId, lockPromise);

    try {
      await currentLock;

      // Re-verify availability inside lock
      if (!db.isRoomAvailable({ roomId: targetRoomId, checkIn, checkOut })) {
        return {
          success: false,
          error: 'This room was just reserved by another guest. Please select alternative dates.',
        };
      }

      // Authoritative pricing
      const roomType = store.roomTypes.find((rt) => rt.id === targetRoom!.room_type_id);
      if (!roomType) {
        return { success: false, error: 'Room category not found.' };
      }

      const pricing = calculateAuthoritativePrice({
        checkIn,
        checkOut,
        basePricePaise: roomType.base_price_paise,
        gstPercent: store.settings.gst_percent,
        advancePercent: store.settings.advance_payment_percent,
      });

      // Upsert guest - match by email or clean phone
      const cleanEmail = (guestEmail || '').toLowerCase().trim();
      const cleanPhoneDigits = (guestPhone || '').replace(/[^0-9]/g, '');

      let guest = store.guests.find((g) => {
        const gEmail = (g.email || '').toLowerCase().trim();
        const gPhoneDigits = (g.phone || '').replace(/[^0-9]/g, '');
        return (
          (cleanEmail && gEmail === cleanEmail) ||
          (cleanPhoneDigits && gPhoneDigits === cleanPhoneDigits)
        );
      });

      if (!guest) {
        guest = {
          id: `guest-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          full_name: (guestName || 'Valued Guest').trim(),
          email: cleanEmail || 'guest@example.com',
          phone: guestPhone || '+91 98201 54321',
          country: 'India',
          created_at: new Date().toISOString(),
        };
        store.guests.push(guest);
      } else {
        // ALWAYS update full name with latest user entry
        if (guestName && guestName.trim()) {
          guest.full_name = guestName.trim();
        }
        if (cleanEmail) {
          guest.email = cleanEmail;
        }
        if (guestPhone && guestPhone.trim()) {
          guest.phone = guestPhone.trim();
        }
      }

      // Generate booking reference: VWV-YYYY-XXXX
      const refSuffix = Math.floor(1000 + Math.random() * 9000);
      const bookingReference = `VWV-${new Date().getFullYear()}-${refSuffix}`;
      const holdExpiresAt = new Date(
        Date.now() + (store.settings.hold_duration_minutes || 15) * 60 * 1000
      ).toISOString();

      const newBooking: Booking = {
        id: `book-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        booking_reference: bookingReference,
        room_id: targetRoomId,
        room_type_id: roomType.id,
        guest_id: guest.id,
        check_in: checkIn,
        check_out: checkOut,
        nights: pricing.nights,
        num_guests: numGuests,
        base_rate_paise: pricing.base_rate_paise,
        subtotal_paise: pricing.subtotal_paise,
        gst_percent: pricing.gst_percent,
        gst_amount_paise: pricing.gst_amount_paise,
        total_amount_paise: pricing.total_amount_paise,
        advance_amount_paise: pricing.advance_amount_paise,
        balance_amount_paise: pricing.balance_amount_paise,
        advance_paid_paise: 0,
        balance_paid_paise: 0,
        status: 'held',
        hold_expires_at: holdExpiresAt,
        special_requests: specialRequests,
        estimated_arrival_time: estimatedArrivalTime,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        room: targetRoom,
        room_type: roomType,
        guest,
      };

      store.bookings.push(newBooking);

      db.logAudit({
        actor_id: 'guest',
        action: 'CREATE_BOOKING_HOLD',
        entity_type: 'booking',
        entity_id: newBooking.id,
        changes: {
          reference: bookingReference,
          room_id: targetRoomId,
          dates: `${checkIn} to ${checkOut}`,
          advance_amount_paise: pricing.advance_amount_paise,
        },
      });

      return { success: true, booking: newBooking };
    } finally {
      releaseLock();
      store.roomLocks.delete(targetRoomId);
    }
  },

  // Authoritatively Confirm Booking on Verified Payment
  confirmBookingPayment({
    bookingId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    amountPaise,
    paymentMethod = 'razorpay',
    paymentType = 'advance_online',
    recordedBy = 'gateway',
  }: {
    bookingId: string;
    razorpayOrderId?: string;
    razorpayPaymentId: string;
    razorpaySignature?: string;
    amountPaise: number;
    paymentMethod?: 'razorpay' | 'cash' | 'card_terminal' | 'upi_qr' | 'bank_transfer';
    paymentType?: 'advance_online' | 'balance_offline' | 'full_online';
    recordedBy?: string;
  }): { success: boolean; booking?: Booking; error?: string } {
    const store = getStore();
    const booking = store.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      return { success: false, error: 'Booking not found.' };
    }

    // Idempotency: If already confirmed with this payment ID, return success immediately
    const existingTx = store.payments.find(
      (p) => p.razorpay_payment_id === razorpayPaymentId && p.status === 'success'
    );
    if (existingTx && booking.status === 'confirmed') {
      return { success: true, booking: db.getBookingById(bookingId)! };
    }

    // If hold expired but room is still physically free, reactivate booking
    if (booking.status === 'expired') {
      const isStillAvailable = db.isRoomAvailable({
        roomId: booking.room_id,
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        excludeBookingId: booking.id,
      });
      if (!isStillAvailable) {
        return {
          success: false,
          error:
            'Room availability was released due to hold expiry and re-booked. Payment flagged for staff reconciliation.',
        };
      }
    }

    // Record verified transaction
    const newTx: PaymentTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      booking_id: booking.id,
      payment_type: paymentType,
      payment_method: paymentMethod,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      amount_paise: amountPaise,
      currency: 'INR',
      status: 'success',
      recorded_by: recordedBy,
      verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    store.payments.push(newTx);

    // Update booking amounts & status
    if (paymentType === 'advance_online' || paymentType === 'full_online') {
      booking.advance_paid_paise += amountPaise;
      booking.status = 'confirmed';
      booking.hold_expires_at = undefined;
    } else if (paymentType === 'balance_offline') {
      booking.balance_paid_paise += amountPaise;
    }

    booking.updated_at = new Date().toISOString();

    db.logAudit({
      actor_id: recordedBy,
      action: 'PAYMENT_VERIFIED_AND_CONFIRMED',
      entity_type: 'booking',
      entity_id: booking.id,
      changes: {
        payment_id: razorpayPaymentId,
        amount_paise: amountPaise,
        status: booking.status,
      },
    });

    return { success: true, booking: db.getBookingById(booking.id)! };
  },

  // Lookup booking by reference and verified email or phone
  lookupBooking({
    reference,
    contact,
  }: {
    reference: string;
    contact: string;
  }): Booking | null {
    const store = getStore();
    const cleanRef = reference.trim().toUpperCase();
    const cleanContact = contact.trim().toLowerCase().replace(/\s+/g, '');

    const booking = store.bookings.find(
      (b) => b.booking_reference.toUpperCase() === cleanRef
    );
    if (!booking) return null;

    const guest = store.guests.find((g) => g.id === booking.guest_id);
    if (!guest) return null;

    const guestEmailClean = guest.email.toLowerCase().replace(/\s+/g, '');
    const guestPhoneClean = guest.phone.replace(/[^0-9]/g, '');
    const searchClean = cleanContact.replace(/[^0-9]/g, '');

    const matchesEmail = guestEmailClean === cleanContact;
    const matchesPhone = searchClean.length >= 8 && guestPhoneClean.includes(searchClean);

    if (matchesEmail || matchesPhone) {
      return db.getBookingById(booking.id);
    }

    return null;
  },

  getBookingById(id: string): Booking | null {
    const store = getStore();
    const b = store.bookings.find((item) => item.id === id);
    if (!b) return null;

    const room = store.rooms.find((r) => r.id === b.room_id) || b.room;
    const roomType = store.roomTypes.find((rt) => rt.id === b.room_type_id) || b.room_type;
    const guest = store.guests.find((g) => g.id === b.guest_id) || b.guest;
    const payments = store.payments.filter((p) => p.booking_id === b.id);

    return {
      ...b,
      room,
      room_type: roomType,
      guest,
      payments,
    };
  },

  getBookingByReference(reference: string): Booking | null {
    const store = getStore();
    const b = store.bookings.find(
      (item) => item.booking_reference.toUpperCase() === reference.toUpperCase()
    );
    if (!b) return null;
    return db.getBookingById(b.id);
  },

  // Expire Stale Holds (Background or request-time sweeper)
  expireStaleHolds(): number {
    const store = getStore();
    const now = new Date();
    let expiredCount = 0;

    for (const b of store.bookings) {
      if (b.status === 'held' && b.hold_expires_at) {
        if (isBefore(parseISO(b.hold_expires_at), now)) {
          b.status = 'expired';
          b.updated_at = now.toISOString();
          expiredCount++;
        }
      }
    }
    return expiredCount;
  },

  // Cancel Booking
  cancelBooking({
    bookingId,
    reason,
    cancelledBy = 'guest',
  }: {
    bookingId: string;
    reason: string;
    cancelledBy?: string;
  }): { success: boolean; booking?: Booking; error?: string } {
    const store = getStore();
    const booking = store.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      return { success: false, error: 'Booking not found.' };
    }

    if (booking.status === 'cancelled') {
      return { success: true, booking: db.getBookingById(bookingId)! };
    }

    booking.status = 'cancelled';
    booking.cancelled_at = new Date().toISOString();
    booking.cancellation_reason = reason;
    booking.updated_at = new Date().toISOString();

    db.logAudit({
      actor_id: cancelledBy,
      action: 'CANCEL_BOOKING',
      entity_type: 'booking',
      entity_id: bookingId,
      changes: { reason },
    });

    return { success: true, booking: db.getBookingById(bookingId)! };
  },

  // ADMIN OPERATIONS
  getAdminStats() {
    const store = getStore();
    db.expireStaleHolds();

    const todayStr = new Date().toISOString().split('T')[0];
    const totalRooms = store.rooms.length;

    // Today's arrivals (check_in === today AND status in ('confirmed'))
    const todayArrivals = store.bookings.filter(
      (b) => b.check_in === todayStr && b.status === 'confirmed'
    ).length;

    // Today's departures (check_out === today AND status in ('checked_in'))
    const todayDepartures = store.bookings.filter(
      (b) => b.check_out === todayStr && b.status === 'checked_in'
    ).length;

    // Current Occupancy: checked_in rooms
    const occupiedRooms = store.bookings.filter(
      (b) => b.status === 'checked_in' && b.check_in <= todayStr && b.check_out > todayStr
    ).length;

    const availableRooms = Math.max(0, totalRooms - occupiedRooms);
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // Financial breakdown
    let grossBookedPaise = 0;
    let advanceCollectedPaise = 0;
    let balanceCollectedPaise = 0;
    let outstandingBalancePaise = 0;

    for (const b of store.bookings) {
      if (b.status === 'confirmed' || b.status === 'checked_in' || b.status === 'checked_out') {
        grossBookedPaise += b.total_amount_paise;
        advanceCollectedPaise += b.advance_paid_paise;
        balanceCollectedPaise += b.balance_paid_paise;
        const remaining = b.total_amount_paise - (b.advance_paid_paise + b.balance_paid_paise);
        if (remaining > 0) {
          outstandingBalancePaise += remaining;
        }
      }
    }

    return {
      todayArrivals,
      todayDepartures,
      occupiedRooms,
      availableRooms,
      totalRooms,
      occupancyRate,
      grossBookedPaise,
      advanceCollectedPaise,
      balanceCollectedPaise,
      totalCollectedPaise: advanceCollectedPaise + balanceCollectedPaise,
      outstandingBalancePaise,
      activeBookingsCount: store.bookings.filter(
        (b) => b.status === 'confirmed' || b.status === 'checked_in'
      ).length,
      recentBookings: store.bookings
        .slice(-10)
        .reverse()
        .map((b) => db.getBookingById(b.id)!),
    };
  },

  getAllBookings({
    query,
    status,
  }: {
    query?: string;
    status?: BookingStatus | 'all';
  } = {}): Booking[] {
    const store = getStore();
    db.expireStaleHolds();

    let list = store.bookings.map((b) => db.getBookingById(b.id)!);

    if (status && status !== 'all') {
      list = list.filter((b) => b.status === status);
    }

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (b) =>
          b.booking_reference.toLowerCase().includes(q) ||
          b.guest?.full_name.toLowerCase().includes(q) ||
          b.guest?.email.toLowerCase().includes(q) ||
          b.guest?.phone.includes(q) ||
          b.room?.room_number.toLowerCase().includes(q)
      );
    }

    return list.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  // Update Booking Status (e.g., Check-in, Check-out)
  updateBookingStatus(
    bookingId: string,
    newStatus: BookingStatus,
    actor = 'admin'
  ): { success: boolean; booking?: Booking; error?: string } {
    const store = getStore();
    const booking = store.bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, error: 'Booking not found.' };

    const oldStatus = booking.status;
    booking.status = newStatus;
    booking.updated_at = new Date().toISOString();

    db.logAudit({
      actor_id: actor,
      action: 'UPDATE_BOOKING_STATUS',
      entity_type: 'booking',
      entity_id: bookingId,
      changes: { oldStatus, newStatus },
    });

    return { success: true, booking: db.getBookingById(bookingId)! };
  },

  // Add / Edit Physical Rooms
  addPhysicalRoom(roomData: {
    room_number: string;
    room_type_id: string;
    floor: number;
    notes?: string;
  }): PhysicalRoom {
    const store = getStore();
    const newRoom: PhysicalRoom = {
      id: `room-${Date.now()}`,
      room_number: roomData.room_number,
      room_type_id: roomData.room_type_id,
      floor: roomData.floor,
      status: 'available',
      notes: roomData.notes,
    };
    store.rooms.push(newRoom);
    return newRoom;
  },

  updatePhysicalRoom(
    roomId: string,
    updates: Partial<PhysicalRoom>,
    actor = 'admin'
  ): PhysicalRoom | null {
    const store = getStore();
    const room = store.rooms.find((r) => r.id === roomId);
    if (!room) return null;

    Object.assign(room, updates);
    db.logAudit({
      actor_id: actor,
      action: 'UPDATE_ROOM',
      entity_type: 'room',
      entity_id: roomId,
      changes: updates,
    });
    return { ...room };
  },

  // Maintenance Blocks
  addRoomBlock(block: Omit<RoomBlock, 'id' | 'created_at'>): RoomBlock {
    const store = getStore();
    const newBlock: RoomBlock = {
      id: `block-${Date.now()}`,
      ...block,
      created_at: new Date().toISOString(),
    };
    store.roomBlocks.push(newBlock);
    return newBlock;
  },

  // Audit Logs
  logAudit(log: Omit<AuditLog, 'id' | 'created_at'>) {
    const store = getStore();
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...log,
      created_at: new Date().toISOString(),
    };
    store.auditLogs.unshift(newLog);
    // Keep max 2000 logs in memory
    if (store.auditLogs.length > 2000) {
      store.auditLogs.pop();
    }
  },

  getAuditLogs(limit = 100): AuditLog[] {
    const store = getStore();
    return store.auditLogs.slice(0, limit);
  },

  // Backup & Storage
  getStorageMetrics() {
    const store = getStore();
    const totalRecords =
      store.bookings.length +
      store.guests.length +
      store.payments.length +
      store.rooms.length +
      store.auditLogs.length;

    // Approximate database byte size based on JSON serialization
    const estimatedBytes = JSON.stringify(store).length;
    const expiredHoldCount = store.bookings.filter((b) => b.status === 'expired').length;

    return {
      totalRecords,
      estimatedDatabaseBytes: estimatedBytes,
      estimatedDatabaseKb: (estimatedBytes / 1024).toFixed(1),
      bookingsCount: store.bookings.length,
      guestsCount: store.guests.length,
      paymentsCount: store.payments.length,
      roomsCount: store.rooms.length,
      auditLogsCount: store.auditLogs.length,
      expiredHoldCount,
      lastBackupTime: new Date().toISOString(),
    };
  },

  exportFullBackup() {
    const store = getStore();
    return {
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      hotel_name: store.settings.hotel_name,
      settings: store.settings,
      room_types: store.roomTypes,
      rooms: store.rooms,
      room_blocks: store.roomBlocks,
      guests: store.guests,
      bookings: store.bookings,
      payments: store.payments,
      audit_logs: store.auditLogs,
    };
  },

  cleanupExpiredHolds(actor = 'admin'): number {
    const store = getStore();
    // Safety Guard: NEVER delete confirmed, checked_in, or checked_out bookings!
    const initialCount = store.bookings.length;
    store.bookings = store.bookings.filter((b) => b.status !== 'expired');
    const removedCount = initialCount - store.bookings.length;

    db.logAudit({
      actor_id: actor,
      action: 'CLEANUP_EXPIRED_HOLDS',
      entity_type: 'maintenance',
      changes: { removedExpiredHolds: removedCount },
    });

    return removedCount;
  },
};
