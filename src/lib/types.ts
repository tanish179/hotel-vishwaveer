// ============================================================================
// HOTEL VISHWAVEER: CORE TYPES & DOMAIN MODELS
// ============================================================================

export type BookingStatus =
  | 'held'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'expired';

export type PaymentMethod =
  | 'razorpay'
  | 'cash'
  | 'card_terminal'
  | 'upi_qr'
  | 'bank_transfer';

export type PaymentType =
  | 'advance_online'
  | 'balance_offline'
  | 'full_online'
  | 'refund';

export type RoomStatus = 'available' | 'maintenance' | 'cleaning' | 'blocked';

export interface HotelSettings {
  id: string;
  hotel_name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  currency: string;
  currency_symbol: string;
  timezone: string;
  check_in_time: string;
  check_out_time: string;
  advance_payment_percent: number; // e.g. 30.00
  gst_percent: number; // e.g. 12.00
  cancellation_policy: string;
  hold_duration_minutes: number;
  razorpay_key_id: string;
  logo_url: string;
  hero_image_url: string;
  updated_at: string;
}

export interface RoomImage {
  id: string;
  room_type_id: string;
  image_url: string;
  alt_text: string;
  caption?: string;
  is_primary: boolean;
  display_order: number;
}

export interface RoomType {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  full_description: string;
  base_price_paise: number; // integer paise
  weekend_price_paise: number;
  max_guests: number;
  max_adults: number;
  max_children: number;
  bed_type: string;
  room_size_sqft: number;
  view_type: string;
  amenities: string[];
  is_active: boolean;
  sort_order: number;
  images?: RoomImage[];
}

export interface PhysicalRoom {
  id: string;
  room_number: string;
  room_type_id: string;
  floor: number;
  status: RoomStatus;
  notes?: string;
  room_type?: RoomType;
}

export interface RoomBlock {
  id: string;
  room_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  reason: string;
  status: 'active' | 'resolved' | 'cancelled';
  created_by: string;
  created_at: string;
}

export interface Guest {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city?: string;
  country: string;
  special_notes?: string;
  created_at: string;
}

export interface Booking {
  id: string;
  booking_reference: string;
  room_id: string;
  room_type_id: string;
  guest_id: string;
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD
  nights: number;
  num_guests: number;
  base_rate_paise: number;
  subtotal_paise: number;
  gst_percent: number;
  gst_amount_paise: number;
  total_amount_paise: number;
  advance_amount_paise: number;
  balance_amount_paise: number;
  advance_paid_paise: number;
  balance_paid_paise: number;
  status: BookingStatus;
  hold_expires_at?: string;
  special_requests?: string;
  estimated_arrival_time?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  room?: PhysicalRoom;
  room_type?: RoomType;
  guest?: Guest;
  payments?: PaymentTransaction[];
}

export interface PaymentOrder {
  id: string;
  booking_id: string;
  razorpay_order_id: string;
  amount_paise: number;
  currency: string;
  status: 'created' | 'attempted' | 'paid' | 'expired' | 'failed';
  receipt?: string;
  created_at: string;
}

export interface PaymentTransaction {
  id: string;
  booking_id: string;
  payment_order_id?: string;
  payment_type: PaymentType;
  payment_method: PaymentMethod;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  amount_paise: number;
  currency: string;
  status: 'success' | 'failed' | 'refunded' | 'pending';
  recorded_by: string;
  notes?: string;
  verified_at: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  changes?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface PriceBreakdown {
  nights: number;
  base_rate_paise: number;
  subtotal_paise: number;
  gst_percent: number;
  gst_amount_paise: number;
  total_amount_paise: number;
  advance_percent: number;
  advance_amount_paise: number;
  balance_amount_paise: number;
}
