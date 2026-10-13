import { describe, it, expect } from 'vitest';
import { calculateAuthoritativePrice, formatINR } from '../src/lib/pricing';

describe('Pricing Engine & Integer Paise Arithmetic', () => {
  it('correctly calculates 3-night tariff, 12% GST, and 30% advance in integer paise', () => {
    // Room tariff: ₹6,500/night = 650,000 paise
    const result = calculateAuthoritativePrice({
      checkIn: '2026-10-15',
      checkOut: '2026-10-18', // 3 nights
      basePricePaise: 650000,
      gstPercent: 12,
      advancePercent: 30,
    });

    expect(result.nights).toBe(3);
    expect(result.subtotal_paise).toBe(1950000); // ₹19,500.00
    expect(result.gst_amount_paise).toBe(234000); // 12% of 1950000 = ₹2,340.00
    expect(result.total_amount_paise).toBe(2184000); // ₹21,840.00

    // Authoritative 30% advance
    expect(result.advance_amount_paise).toBe(655200); // 30% of 2184000 = ₹6,552.00
    expect(result.balance_amount_paise).toBe(1528800); // 70% = ₹15,288.00

    // Exact integer paise reconciliation: advance + balance MUST EXACTLY equal total
    expect(result.advance_amount_paise + result.balance_amount_paise).toBe(
      result.total_amount_paise
    );
  });

  it('handles fractional paise rounding without precision leakage', () => {
    // Tariff with uneven paise: ₹9,833.33 -> 983333 paise
    const result = calculateAuthoritativePrice({
      checkIn: '2026-10-20',
      checkOut: '2026-10-21', // 1 night
      basePricePaise: 983333,
      gstPercent: 12,
      advancePercent: 30,
    });

    expect(Number.isInteger(result.subtotal_paise)).toBe(true);
    expect(Number.isInteger(result.gst_amount_paise)).toBe(true);
    expect(Number.isInteger(result.total_amount_paise)).toBe(true);
    expect(Number.isInteger(result.advance_amount_paise)).toBe(true);
    expect(Number.isInteger(result.balance_amount_paise)).toBe(true);
    expect(result.advance_amount_paise + result.balance_amount_paise).toBe(
      result.total_amount_paise
    );
  });

  it('rejects invalid reservation dates where checkout is not after checkin', () => {
    expect(() =>
      calculateAuthoritativePrice({
        checkIn: '2026-10-20',
        checkOut: '2026-10-20', // Same day checkout
        basePricePaise: 650000,
      })
    ).toThrow('Check-out date must be at least one day after check-in.');

    expect(() =>
      calculateAuthoritativePrice({
        checkIn: '2026-10-25',
        checkOut: '2026-10-20', // Inverted dates
        basePricePaise: 650000,
      })
    ).toThrow('Check-out date must be at least one day after check-in.');
  });

  it('formats integer paise cleanly into Indian Rupee currency representations', () => {
    expect(formatINR(650000)).toMatch(/₹\s?6,500/);
    expect(formatINR(2400000)).toMatch(/₹\s?24,000/);
  });
});
