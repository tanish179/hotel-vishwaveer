-- ============================================================================
-- HOTEL VISHWAVEER: MASTER RELATIONAL DATABASE SCHEMA
-- PostgreSQL schema for Supabase with RLS, Concurrency Control & Audit Logging
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. HOTEL CONFIGURATION & SETTINGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hotel_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_name VARCHAR(150) NOT NULL DEFAULT 'Hotel Vishwaveer',
    tagline VARCHAR(255) DEFAULT 'A Sanctuary of Refined Heritage & Quiet Luxury',
    address TEXT NOT NULL DEFAULT 'Vishwaveer Heritage Estate, Ring Road, Kolhapur, Maharashtra 416008, India',
    phone VARCHAR(50) NOT NULL DEFAULT '+91 231 265 4400',
    email VARCHAR(100) NOT NULL DEFAULT 'concierge@hotelvishwaveer.in',
    website VARCHAR(150) DEFAULT 'https://hotelvishwaveer.in',
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    currency_symbol VARCHAR(10) NOT NULL DEFAULT '₹',
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
    check_in_time VARCHAR(20) NOT NULL DEFAULT '14:00',
    check_out_time VARCHAR(20) NOT NULL DEFAULT '11:00',
    advance_payment_percent NUMERIC(5, 2) NOT NULL DEFAULT 30.00 CHECK (advance_payment_percent >= 10.00 AND advance_payment_percent <= 100.00),
    gst_percent NUMERIC(5, 2) NOT NULL DEFAULT 12.00 CHECK (gst_percent >= 0.00 AND gst_percent <= 28.00),
    cancellation_policy TEXT NOT NULL DEFAULT 'Complimentary cancellation up to 48 hours prior to check-in. Cancellations within 48 hours forfeit the advance deposit.',
    hold_duration_minutes INTEGER NOT NULL DEFAULT 15,
    razorpay_key_id VARCHAR(100) DEFAULT '',
    logo_url TEXT DEFAULT '',
    hero_image_url TEXT DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. ROOM TYPES (CATEGORIES)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS room_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    base_price_paise BIGINT NOT NULL CHECK (base_price_paise > 0), -- e.g. 850000 = ₹8,500
    weekend_price_paise BIGINT NOT NULL CHECK (weekend_price_paise > 0),
    max_guests INTEGER NOT NULL DEFAULT 2 CHECK (max_guests >= 1),
    max_adults INTEGER NOT NULL DEFAULT 2 CHECK (max_adults >= 1),
    max_children INTEGER NOT NULL DEFAULT 1 CHECK (max_children >= 0),
    bed_type VARCHAR(100) NOT NULL DEFAULT 'King Bed',
    room_size_sqft INTEGER NOT NULL DEFAULT 420,
    view_type VARCHAR(100) NOT NULL DEFAULT 'Garden Courtyard',
    amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. PHYSICAL ROOMS (INDIVIDUAL INVENTORY)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_number VARCHAR(50) UNIQUE NOT NULL,
    room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT,
    floor INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'cleaning', 'blocked')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. ROOM IMAGES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS room_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    is_primary BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. ROOM MAINTENANCE & BLOCKS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS room_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL CHECK (end_date > start_date),
    reason VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
    created_by VARCHAR(100) DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. GUESTS (PRIMARY CONTACT DETAILS - GUEST CHECKOUT)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    special_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. BOOKINGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference VARCHAR(50) UNIQUE NOT NULL, -- e.g. VWV-2026-XXXX
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT,
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE RESTRICT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL CHECK (check_out > check_in),
    nights INTEGER NOT NULL CHECK (nights >= 1),
    num_guests INTEGER NOT NULL DEFAULT 2,
    base_rate_paise BIGINT NOT NULL,
    subtotal_paise BIGINT NOT NULL,
    gst_percent NUMERIC(5, 2) NOT NULL DEFAULT 12.00,
    gst_amount_paise BIGINT NOT NULL,
    total_amount_paise BIGINT NOT NULL,
    advance_amount_paise BIGINT NOT NULL,
    balance_amount_paise BIGINT NOT NULL,
    advance_paid_paise BIGINT NOT NULL DEFAULT 0,
    balance_paid_paise BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'expired')),
    hold_expires_at TIMESTAMPTZ,
    special_requests TEXT,
    estimated_arrival_time VARCHAR(50),
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. BOOKING STATUS AUDIT HISTORY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS booking_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by VARCHAR(100) NOT NULL DEFAULT 'system',
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 9. PAYMENT ORDERS (GATEWAY ORDERS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    razorpay_order_id VARCHAR(100) UNIQUE NOT NULL,
    amount_paise BIGINT NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(50) NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'attempted', 'paid', 'expired', 'failed')),
    receipt VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 10. PAYMENT TRANSACTIONS (VERIFIED PAYMENTS & RECEIPTS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    payment_order_id UUID REFERENCES payment_orders(id) ON DELETE SET NULL,
    payment_type VARCHAR(50) NOT NULL DEFAULT 'advance_online' CHECK (payment_type IN ('advance_online', 'balance_offline', 'full_online', 'refund')),
    payment_method VARCHAR(50) NOT NULL DEFAULT 'razorpay' CHECK (payment_method IN ('razorpay', 'cash', 'card_terminal', 'upi_qr', 'bank_transfer')),
    razorpay_payment_id VARCHAR(100) UNIQUE,
    razorpay_signature VARCHAR(255),
    amount_paise BIGINT NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(50) NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed', 'refunded', 'pending')),
    recorded_by VARCHAR(100) NOT NULL DEFAULT 'gateway',
    notes TEXT,
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 11. REFUNDS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    payment_transaction_id UUID REFERENCES payment_transactions(id) ON DELETE SET NULL,
    amount_paise BIGINT NOT NULL,
    razorpay_refund_id VARCHAR(100) UNIQUE,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'processed' CHECK (status IN ('pending', 'processed', 'failed')),
    processed_by VARCHAR(100) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 12. ADMIN AUDIT LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id VARCHAR(100) NOT NULL DEFAULT 'system',
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    changes JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 13. NOTIFICATION LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    recipient_email VARCHAR(150),
    recipient_phone VARCHAR(50),
    channel VARCHAR(50) NOT NULL DEFAULT 'email' CHECK (channel IN ('email', 'sms', 'whatsapp')),
    template_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'failed')),
    error_message TEXT,
    payload JSONB,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- INDEXES FOR MAXIMUM QUERY SPEED & INTEGRITY
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_rooms_room_type ON rooms(room_type_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_room ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_guest ON bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_hold_expiry ON bookings(hold_expires_at) WHERE status = 'held';
CREATE INDEX IF NOT EXISTS idx_room_blocks_dates ON room_blocks(room_id, start_date, end_date) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_payment_orders_booking ON payment_orders(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_rzp_order ON payment_orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_booking ON payment_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_rzp_payment ON payment_transactions(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_guests_phone_email ON guests(email, phone);

-- ----------------------------------------------------------------------------
-- CONCURRENCY CONTROL & ATOMIC AVAILABILITY CHECK FUNCTIONS
-- ----------------------------------------------------------------------------

-- Check if a specific room is available between check_in and check_out
CREATE OR REPLACE FUNCTION check_room_availability(
    p_room_id UUID,
    p_check_in DATE,
    p_check_out DATE,
    p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_conflict_count INTEGER;
    v_block_count INTEGER;
BEGIN
    -- Check for conflicting bookings
    -- A booking conflicts if:
    -- 1. It is for the same room
    -- 2. It is confirmed, checked_in, or actively held (hold_expires_at > NOW())
    -- 3. The date intervals overlap: (booking.check_in < p_check_out AND booking.check_out > p_check_in)
    -- 4. It is not our excluded booking (if updating)
    SELECT COUNT(*)
    INTO v_conflict_count
    FROM bookings
    WHERE room_id = p_room_id
      AND (id != p_exclude_booking_id OR p_exclude_booking_id IS NULL)
      AND (
          status IN ('confirmed', 'checked_in')
          OR (status = 'held' AND hold_expires_at > NOW())
      )
      AND check_in < p_check_out
      AND check_out > p_check_in;

    IF v_conflict_count > 0 THEN
        RETURN FALSE;
    END IF;

    -- Check for maintenance blocks
    SELECT COUNT(*)
    INTO v_block_count
    FROM room_blocks
    WHERE room_id = p_room_id
      AND status = 'active'
      AND start_date < p_check_out
      AND end_date > p_check_in;

    IF v_block_count > 0 THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$;

-- Atomic hold placement with row lock to prevent race conditions
CREATE OR REPLACE FUNCTION place_booking_hold(
    p_room_id UUID,
    p_check_in DATE,
    p_check_out DATE,
    p_guest_name VARCHAR,
    p_guest_email VARCHAR,
    p_guest_phone VARCHAR,
    p_num_guests INTEGER,
    p_special_requests TEXT DEFAULT NULL,
    p_arrival_time VARCHAR DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_room_record RECORD;
    v_room_type_record RECORD;
    v_hotel_settings RECORD;
    v_guest_id UUID;
    v_booking_id UUID;
    v_booking_ref VARCHAR;
    v_nights INTEGER;
    v_base_rate BIGINT;
    v_subtotal BIGINT;
    v_gst_percent NUMERIC(5, 2);
    v_gst_amount BIGINT;
    v_total_amount BIGINT;
    v_advance_amount BIGINT;
    v_balance_amount BIGINT;
    v_hold_expires TIMESTAMPTZ;
    v_is_available BOOLEAN;
BEGIN
    -- 1. Acquire row lock on the room to prevent simultaneous concurrent holds
    SELECT * INTO v_room_record
    FROM rooms
    WHERE id = p_room_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Room not found');
    END IF;

    IF v_room_record.status != 'available' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Room is currently unavailable');
    END IF;

    -- 2. Verify room availability within the date range
    v_is_available := check_room_availability(p_room_id, p_check_in, p_check_out);
    IF NOT v_is_available THEN
        RETURN jsonb_build_object('success', false, 'error', 'Room is already reserved for the selected dates');
    END IF;

    -- 3. Retrieve room type and pricing rules
    SELECT * INTO v_room_type_record
    FROM room_types
    WHERE id = v_room_record.room_type_id;

    -- 4. Retrieve hotel settings
    SELECT * INTO v_hotel_settings
    FROM hotel_settings
    LIMIT 1;

    -- 5. Calculate nights and authoritatively compute pricing on server
    v_nights := (p_check_out - p_check_in);
    IF v_nights < 1 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid date range: check-out must be after check-in');
    END IF;

    v_base_rate := v_room_type_record.base_price_paise;
    v_subtotal := v_base_rate * v_nights;
    v_gst_percent := COALESCE(v_hotel_settings.gst_percent, 12.00);
    -- Integer paise calculation: round(subtotal * gst / 100)
    v_gst_amount := ROUND((v_subtotal * v_gst_percent) / 100);
    v_total_amount := v_subtotal + v_gst_amount;
    
    -- Authoritative 30% advance in paise: round(total * advance_percent / 100)
    v_advance_amount := ROUND((v_total_amount * COALESCE(v_hotel_settings.advance_payment_percent, 30.00)) / 100);
    v_balance_amount := v_total_amount - v_advance_amount;

    -- 6. Upsert or create guest record
    SELECT id INTO v_guest_id
    FROM guests
    WHERE email = p_guest_email AND phone = p_guest_phone
    LIMIT 1;

    IF v_guest_id IS NULL THEN
        INSERT INTO guests (full_name, email, phone)
        VALUES (p_guest_name, p_guest_email, p_guest_phone)
        RETURNING id INTO v_guest_id;
    END IF;

    -- 7. Generate unique booking reference: VWV-YYYY-XXXX
    v_booking_ref := 'VWV-' || TO_CHAR(NOW(), 'YYYY') || '-' || UPPER(SUBSTRING(MD5(gen_random_uuid()::text) FROM 1 FOR 5));
    v_hold_expires := NOW() + (COALESCE(v_hotel_settings.hold_duration_minutes, 15) || ' minutes')::INTERVAL;

    -- 8. Insert temporary booking hold
    INSERT INTO bookings (
        booking_reference,
        room_id,
        room_type_id,
        guest_id,
        check_in,
        check_out,
        nights,
        num_guests,
        base_rate_paise,
        subtotal_paise,
        gst_percent,
        gst_amount_paise,
        total_amount_paise,
        advance_amount_paise,
        balance_amount_paise,
        status,
        hold_expires_at,
        special_requests,
        estimated_arrival_time
    ) VALUES (
        v_booking_ref,
        p_room_id,
        v_room_record.room_type_id,
        v_guest_id,
        p_check_in,
        p_check_out,
        v_nights,
        p_num_guests,
        v_base_rate,
        v_subtotal,
        v_gst_percent,
        v_gst_amount,
        v_total_amount,
        v_advance_amount,
        v_balance_amount,
        'held',
        v_hold_expires,
        p_special_requests,
        p_arrival_time
    )
    RETURNING id INTO v_booking_id;

    -- 9. Insert status history
    INSERT INTO booking_status_history (
        booking_id,
        previous_status,
        new_status,
        changed_by,
        note
    ) VALUES (
        v_booking_id,
        NULL,
        'held',
        'system',
        'Temporary hold created for 15 minutes pending Razorpay advance payment'
    );

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_booking_id,
        'booking_reference', v_booking_ref,
        'room_number', v_room_record.room_number,
        'room_type_name', v_room_type_record.name,
        'nights', v_nights,
        'subtotal_paise', v_subtotal,
        'gst_amount_paise', v_gst_amount,
        'total_amount_paise', v_total_amount,
        'advance_amount_paise', v_advance_amount,
        'balance_amount_paise', v_balance_amount,
        'hold_expires_at', v_hold_expires
    );
END;
$$;

-- Clean up expired holds
CREATE OR REPLACE FUNCTION expire_stale_holds()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_expired_count INTEGER;
BEGIN
    WITH expired_rows AS (
        UPDATE bookings
        SET status = 'expired',
            updated_at = NOW()
        WHERE status = 'held'
          AND hold_expires_at <= NOW()
        RETURNING id
    )
    SELECT COUNT(*) INTO v_expired_count FROM expired_rows;

    IF v_expired_count > 0 THEN
        INSERT INTO booking_status_history (booking_id, previous_status, new_status, changed_by, note)
        SELECT id, 'held', 'expired', 'cron_cleanup', 'Temporary room hold expired without advance payment'
        FROM bookings
        WHERE status = 'expired' AND updated_at >= NOW() - INTERVAL '1 minute';
    END IF;

    RETURN v_expired_count;
END;
$$;
