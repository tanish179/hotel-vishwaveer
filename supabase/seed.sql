-- ============================================================================
-- HOTEL VISHWAVEER: PRODUCTION-GRADE SEED DATA
-- Seed script for room types, physical rooms, images, settings, and sample data
-- ============================================================================

-- 1. Hotel Settings
INSERT INTO hotel_settings (
    id,
    hotel_name,
    tagline,
    address,
    phone,
    email,
    website,
    currency,
    currency_symbol,
    timezone,
    check_in_time,
    check_out_time,
    advance_payment_percent,
    gst_percent,
    cancellation_policy,
    hold_duration_minutes,
    razorpay_key_id,
    logo_url,
    hero_image_url
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Hotel Vishwaveer',
    'A Sanctuary of Refined Heritage, Stone Architecture & Quiet Luxury',
    'Vishwaveer Heritage Estate, Ring Road, Kolhapur, Maharashtra 416008, India',
    '+91 231 265 4400',
    'reservations@hotelvishwaveer.in',
    'https://hotelvishwaveer.in',
    'INR',
    '₹',
    'Asia/Kolkata',
    '14:00',
    '11:00',
    30.00,
    12.00,
    'Complimentary cancellation up to 48 hours prior to check-in. Cancellations within 48 hours forfeit the 30% advance deposit.',
    15,
    'rzp_test_placeholder_key',
    '/brand/logo.svg',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=85'
) ON CONFLICT (id) DO UPDATE SET
    hotel_name = EXCLUDED.hotel_name,
    tagline = EXCLUDED.tagline,
    address = EXCLUDED.address;

-- 2. Room Types
INSERT INTO room_types (
    id, slug, name, short_description, full_description,
    base_price_paise, weekend_price_paise, max_guests, max_adults, max_children,
    bed_type, room_size_sqft, view_type, amenities, is_active, sort_order
) VALUES 
(
    '11111111-1111-1111-1111-111111111101',
    'deluxe-heritage-room',
    'Deluxe Heritage Room',
    'Carved teak woodwork, limestone floorings, and a tranquil courtyard garden view.',
    'Thoughtfully curated for discerning travelers, the Deluxe Heritage Room captures the timeless soul of Deccan craftsmanship. Features restored stone masonry, bespoke handcrafted teakwood furniture, natural Belgian linen bedding, and a sunlit marble bathroom with rainfall shower and organic ayurvedic botanicals.',
    650000, -- ₹6,500/night
    750000, -- ₹7,500 weekend
    2, 2, 1,
    'California King Bed',
    380,
    'Central Courtyard & Frangipani Garden',
    '["High-Speed Wi-Fi 6", "Artisan Tea & French Press Coffee", "Rainfall Forest Shower", "Organic Forest Essentials Toiletries", "Custom Teak Workdesk", "Bose Bluetooth Audio", "In-Room Mineral Water Bar", "Climate Controlled Inverter AC"]'::jsonb,
    true,
    1
),
(
    '11111111-1111-1111-1111-111111111102',
    'courtyard-suite',
    'Courtyard Suite',
    'Generous private veranda, freestanding soaking tub, and separate day lounge.',
    'Our Courtyard Suite seamlessly merges indoor tranquility with the outdoors. Glass pocket doors slide back to reveal your private shaded veranda enveloped in bougainvillea. Inside, a plush seating lounge, soaking stone bathtub, and a handwoven wool rug invite deep decompression after estate wanderings.',
    980000, -- ₹9,800/night
    1150000, -- ₹11,500 weekend
    3, 3, 1,
    'Emperor Teak Bed',
    540,
    'Private Garden & Water Lily Pond',
    '["Private Veranda with Daybed", "Handcrafted Freestanding Stone Tub", "Separate Living Lounge", "High-Speed Wi-Fi 6", "Artisan Bar & Pour-Over Station", "Walk-in Dressing Wardrobe", "Twice-Daily Housekeeping & Turndown", "Smart 4K Frame Display"]'::jsonb,
    true,
    2
),
(
    '11111111-1111-1111-1111-111111111103',
    'royal-veranda-suite',
    'Royal Veranda Suite',
    'Panoramic estate vistas, private plunge terrace, and dedicated butler service.',
    'Perched on the upper gallery of the heritage wing, the Royal Veranda Suite offers uninhibited horizons over the Western Ghat foothills. High arched ceilings, antique brass chandeliers, a secluded open-air heated plunge pool, and personalized in-suite dining service define this signature retreat.',
    1450000, -- ₹14,500/night
    1680000, -- ₹16,800 weekend
    3, 2, 2,
    'Hand-Carved Canopy Bed',
    720,
    'Panoramic Foothill & Canopy Vistas',
    '["Private Heated Plunge Pool", "Dedicated Butler On-Call", "Panoramic Wrap-around Balcony", "Walk-in Dressing Room", "Dual Vanity Limestone Bath", "Complimentary High-Tea Experience", "Vintage Record Player with Curated Vinyl", "Complimentary Laundry Service"]'::jsonb,
    true,
    3
),
(
    '11111111-1111-1111-1111-111111111104',
    'the-vishwaveer-residence',
    'The Vishwaveer Residence',
    'Our premier two-bedroom private sanctuary with private lap pool and dining pavilion.',
    'The pinnacle of hospitality at Vishwaveer. A secluded estate residence spanning two expansive en-suite bedrooms, a chef dining pavilion, private infinity-edge lap pool, and lush walled courtyard gardens. Ideal for multi-generational families or privacy-seeking luminaries desiring complete seclusion.',
    2400000, -- ₹24,000/night
    2750000, -- ₹27,500 weekend
    5, 4, 2,
    'Two Master King Suites',
    1250,
    'Private Walled Garden & Foothills',
    '["Private Infinity Lap Pool", "Exclusive In-Residence Chef Dining", "Two Master Bedroom En-Suites", "Private Garden Pavilion & Firepit", "Chauffeur Airport Transfers Included", "Full Premium Beverage Bar", "Private Yoga Instructor on Request", "24/7 Dedicated Estate Concierge"]'::jsonb,
    true,
    4
) ON CONFLICT (slug) DO UPDATE SET
    base_price_paise = EXCLUDED.base_price_paise,
    weekend_price_paise = EXCLUDED.weekend_price_paise;

-- 3. Room Images
INSERT INTO room_images (id, room_type_id, image_url, alt_text, caption, is_primary, display_order) VALUES
-- Deluxe Heritage Room
(gen_random_uuid(), '11111111-1111-1111-1111-111111111101', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', 'Deluxe Heritage Bedroom with warm lighting and teak furnishings', 'Bedroom view with natural linen', true, 1),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111101', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', 'Ensuite limestone bathroom with rainfall shower', 'Artisanal stone bathroom', false, 2),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111101', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80', 'Detail of teak desk and reading lounge', 'Bespoke heritage furniture', false, 3),

-- Courtyard Suite
(gen_random_uuid(), '11111111-1111-1111-1111-111111111102', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80', 'Courtyard Suite with open veranda doors and daybed', 'Private veranda overlooking water gardens', true, 1),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111102', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80', 'Freestanding stone bathtub with botanical view', 'Soaking stone bath pavilion', false, 2),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111102', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80', 'Lounge seating area with handwoven rug', 'Inner living lounge', false, 3),

-- Royal Veranda Suite
(gen_random_uuid(), '11111111-1111-1111-1111-111111111103', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80', 'Royal Veranda Suite interior with vaulted ceiling and canopy bed', 'Upper gallery sanctuary', true, 1),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111103', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80', 'Private heated plunge pool overlooking foothill canopy', 'Open-air private plunge terrace', false, 2),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111103', 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80', 'Dual vanity limestone ensuite bathroom', 'Hand-cut limestone vanity', false, 3),

-- The Vishwaveer Residence
(gen_random_uuid(), '11111111-1111-1111-1111-111111111104', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80', 'The Vishwaveer Residence exterior and private lap pool at dusk', 'Private estate residence and lap pool', true, 1),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111104', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', 'Private living pavilion and courtyard dining area', 'In-residence dining pavilion', false, 2),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111104', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80', 'Master bedroom with garden view', 'Master wing bedroom', false, 3);

-- 4. Physical Rooms (10 Distinct Stable Rooms)
INSERT INTO rooms (id, room_number, room_type_id, floor, status, notes) VALUES
-- Deluxe Heritage Rooms (3 rooms)
('22222222-2222-2222-2222-222222222101', '101', '11111111-1111-1111-1111-111111111101', 1, 'available', 'Ground floor heritage wing with direct garden path access'),
('22222222-2222-2222-2222-222222222102', '102', '11111111-1111-1111-1111-111111111101', 1, 'available', 'Corner courtyard room, secluded and quiet'),
('22222222-2222-2222-2222-222222222103', '103', '11111111-1111-1111-1111-111111111101', 1, 'available', 'Adjacent to the central frangipani reflection pond'),

-- Courtyard Suites (3 rooms)
('22222222-2222-2222-2222-222222222201', '201', '11111111-1111-1111-1111-111111111102', 2, 'available', 'First floor terrace with bougainvillea trellises'),
('22222222-2222-2222-2222-222222222202', '202', '11111111-1111-1111-1111-111111111102', 2, 'available', 'Central suite with dual verandas'),
('22222222-2222-2222-2222-222222222203', '203', '11111111-1111-1111-1111-111111111102', 2, 'available', 'Garden-facing suite with extra large stone bath'),

-- Royal Veranda Suites (2 rooms)
('22222222-2222-2222-2222-222222222301', '301', '11111111-1111-1111-1111-111111111103', 3, 'available', 'Penthouse level with heated plunge pool and mountain views'),
('22222222-2222-2222-2222-222222222302', '302', '11111111-1111-1111-1111-111111111103', 3, 'available', 'Upper gallery suite with sunset orientation'),

-- The Vishwaveer Residences (2 residences)
('22222222-2222-2222-2222-222222222401', 'Villa 1', '11111111-1111-1111-1111-111111111104', 1, 'available', 'Private gated estate compound with 15m lap pool'),
('22222222-2222-2222-2222-222222222402', 'Villa 2', '11111111-1111-1111-1111-111111111104', 1, 'available', 'Secluded east pavilion with private chef garden')
ON CONFLICT (room_number) DO NOTHING;

-- 5. Sample Guests
INSERT INTO guests (id, full_name, email, phone, city, country) VALUES
('33333333-3333-3333-3333-333333333001', 'Aarav Singhania', 'aarav.singhania@example.com', '+91 98201 54321', 'Mumbai', 'India'),
('33333333-3333-3333-3333-333333333002', 'Devika Nambiar', 'devika.nambiar@example.com', '+91 98450 12345', 'Bengaluru', 'India'),
('33333333-3333-3333-3333-333333333003', 'Vikramaditya Rao', 'vikram.rao@example.com', '+91 98111 67890', 'Pune', 'India')
ON CONFLICT DO NOTHING;

-- 6. Sample Initial Bookings for Demonstration & Admin Statistics
-- Booking 1: Confirmed with advance paid
INSERT INTO bookings (
    id, booking_reference, room_id, room_type_id, guest_id,
    check_in, check_out, nights, num_guests,
    base_rate_paise, subtotal_paise, gst_percent, gst_amount_paise,
    total_amount_paise, advance_amount_paise, balance_amount_paise,
    advance_paid_paise, balance_paid_paise, status,
    special_requests, estimated_arrival_time
) VALUES (
    '44444444-4444-4444-4444-444444444001',
    'VWV-2026-9481',
    '22222222-2222-2222-2222-222222222201', -- Room 201
    '11111111-1111-1111-1111-111111111102',
    '33333333-3333-3333-3333-333333333001',
    CURRENT_DATE + INTERVAL '2 days',
    CURRENT_DATE + INTERVAL '5 days',
    3, 2,
    980000, 2940000, 12.00, 352800,
    3292800, 987840, 2304960,
    987840, 0, 'confirmed',
    'Anniversary celebration; quiet room preferred with extra pillows.',
    '15:30'
) ON CONFLICT (booking_reference) DO NOTHING;

-- Payment order & transaction for Booking 1
INSERT INTO payment_orders (
    id, booking_id, razorpay_order_id, amount_paise, status, receipt
) VALUES (
    gen_random_uuid(),
    '44444444-4444-4444-4444-444444444001',
    'order_test_demo_001',
    987840,
    'paid',
    'rcpt_vwv_9481'
) ON CONFLICT DO NOTHING;

INSERT INTO payment_transactions (
    id, booking_id, payment_type, payment_method, razorpay_payment_id,
    razorpay_signature, amount_paise, status, recorded_by
) VALUES (
    gen_random_uuid(),
    '44444444-4444-4444-4444-444444444001',
    'advance_online',
    'razorpay',
    'pay_test_demo_001',
    'sig_verified_mock_001',
    987840,
    'success',
    'gateway'
) ON CONFLICT DO NOTHING;

-- Booking 2: Currently checked-in
INSERT INTO bookings (
    id, booking_reference, room_id, room_type_id, guest_id,
    check_in, check_out, nights, num_guests,
    base_rate_paise, subtotal_paise, gst_percent, gst_amount_paise,
    total_amount_paise, advance_amount_paise, balance_amount_paise,
    advance_paid_paise, balance_paid_paise, status,
    special_requests, estimated_arrival_time
) VALUES (
    '44444444-4444-4444-4444-444444444002',
    'VWV-2026-3104',
    '22222222-2222-2222-2222-222222222102', -- Room 102
    '11111111-1111-1111-1111-111111111101',
    '33333333-3333-3333-3333-333333333002',
    CURRENT_DATE - INTERVAL '1 day',
    CURRENT_DATE + INTERVAL '1 day',
    2, 2,
    650000, 1300000, 12.00, 156000,
    1456000, 436800, 1019200,
    436800, 1019200, 'checked_in',
    'Late evening arrival; prefers lactose-free milk with morning coffee.',
    '20:00'
) ON CONFLICT (booking_reference) DO NOTHING;
