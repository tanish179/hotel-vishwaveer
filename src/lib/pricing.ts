// ============================================================================
// HOTEL VISHWAVEER: PRICING ENGINE
// Server-Authoritative Integer Paise Calculations
// ============================================================================

import { PriceBreakdown } from './types';
import { differenceInCalendarDays, parseISO, isValid } from 'date-fns';

/**
 * Formats integer paise into INR string (e.g., 650000 -> "₹6,500")
 */
export function formatINR(paise: number, includeDecimals = false): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: includeDecimals ? 2 : 0,
  }).format(rupees);
}

/**
 * Calculate authoritative reservation pricing on the server.
 * All arithmetic is strictly integer-based to prevent IEEE 754 floating point inaccuracies.
 */
export function calculateAuthoritativePrice({
  checkIn,
  checkOut,
  basePricePaise,
  gstPercent = 12,
  advancePercent = 30,
}: {
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  basePricePaise: number;
  gstPercent?: number;
  advancePercent?: number;
}): PriceBreakdown {
  const checkInDate = parseISO(checkIn);
  const checkOutDate = parseISO(checkOut);

  if (!isValid(checkInDate) || !isValid(checkOutDate)) {
    throw new Error('Invalid reservation dates provided.');
  }

  const nights = differenceInCalendarDays(checkOutDate, checkInDate);
  if (nights < 1) {
    throw new Error('Check-out date must be at least one day after check-in.');
  }

  if (basePricePaise <= 0) {
    throw new Error('Base room tariff must be greater than zero.');
  }

  // 1. Subtotal in integer paise
  const subtotal_paise = Math.round(basePricePaise * nights);

  // 2. GST in integer paise (Round to nearest integer paise)
  const gst_amount_paise = Math.round((subtotal_paise * gstPercent) / 100);

  // 3. Gross Total
  const total_amount_paise = subtotal_paise + gst_amount_paise;

  // 4. Advance deposit (authoritative 30%)
  const advance_amount_paise = Math.round((total_amount_paise * advancePercent) / 100);

  // 5. Remaining balance payable at hotel
  const balance_amount_paise = total_amount_paise - advance_amount_paise;

  return {
    nights,
    base_rate_paise: basePricePaise,
    subtotal_paise,
    gst_percent: gstPercent,
    gst_amount_paise,
    total_amount_paise,
    advance_percent: advancePercent,
    advance_amount_paise,
    balance_amount_paise,
  };
}
