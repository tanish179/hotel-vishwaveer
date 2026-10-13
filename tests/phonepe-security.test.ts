import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import {
  createPhonePePayload,
  verifyPhonePeChecksum,
  getPhonePeConfig,
} from '../src/lib/phonepe';
import { db } from '../src/lib/db';

describe('PhonePe Payment Security & Checksum Verification', () => {
  it('generates authentic Base64 payload and valid X-VERIFY SHA-256 checksum', () => {
    const config = getPhonePeConfig();
    const result = createPhonePePayload({
      merchantTransactionId: 'TXN_TEST_123',
      amountPaise: 279000, // ₹2,790.00
      merchantUserId: 'guest_user_456',
      mobileNumber: '+91 98201 54321',
      redirectUrl: 'http://localhost:3000/api/payment/phonepe/callback',
      callbackUrl: 'http://localhost:3000/api/payment/phonepe/callback',
      bookingReference: 'VWV-2026-TEST',
    });

    expect(result.merchantId).toBe(config.merchantId);
    expect(result.merchantTransactionId).toBe('TXN_TEST_123');
    expect(result.amountPaise).toBe(279000);
    expect(result.base64Payload).toBeTruthy();
    expect(result.xVerify).toContain(`###${config.saltIndex}`);

    // Decode base64 payload to verify contents
    const decoded = JSON.parse(Buffer.from(result.base64Payload, 'base64').toString('utf8'));
    expect(decoded.amount).toBe(279000);
    expect(decoded.mobileNumber).toBe('9820154321');
    expect(decoded.merchantTransactionId).toBe('TXN_TEST_123');

    // Verify SHA-256 calculation
    const expectedHash = crypto
      .createHash('sha256')
      .update(`${result.base64Payload}/pg/v1/pay${config.saltKey}`)
      .digest('hex');
    expect(result.xVerify).toBe(`${expectedHash}###${config.saltIndex}`);
  });

  it('verifies valid PhonePe checksum and rejects forged or tampered signatures', () => {
    const config = getPhonePeConfig();
    const rawPayload = 'TXN_VWV_998877';

    // Correct signature
    const validHash = crypto
      .createHash('sha256')
      .update(`${rawPayload}${config.saltKey}`)
      .digest('hex');
    const validHeader = `${validHash}###${config.saltIndex}`;

    expect(
      verifyPhonePeChecksum({
        rawOrBase64: rawPayload,
        xVerifyHeader: validHeader,
      })
    ).toBe(true);

    // Tampered payload
    expect(
      verifyPhonePeChecksum({
        rawOrBase64: 'TXN_VWV_TAMPERED',
        xVerifyHeader: validHeader,
      })
    ).toBe(false);

    // Forged signature
    const forgedHeader = 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789###1';
    expect(
      verifyPhonePeChecksum({
        rawOrBase64: rawPayload,
        xVerifyHeader: forgedHeader,
      })
    ).toBe(false);
  });

  it('confirms booking payment via PhonePe with UTR reference and idempotent lock', async () => {
    const hold = await db.createBookingHold({
      roomTypeId: '11111111-1111-1111-1111-111111111101',
      checkIn: '2026-12-01',
      checkOut: '2026-12-04',
      guestName: 'PhonePe Test User',
      guestEmail: 'phonepe_test@example.com',
      guestPhone: '+91 98888 77777',
      numGuests: 2,
    });

    expect(hold.success).toBe(true);
    const booking = hold.booking!;

    const phonepeTxnId = `phonepe_T${Date.now()}`;
    const utr = '987654321098';

    // First confirmation via PhonePe
    const confirm = db.confirmBookingPayment({
      bookingId: booking.id,
      razorpayOrderId: 'TXN_TEST_PHONEPE_1',
      razorpayPaymentId: phonepeTxnId,
      razorpaySignature: `utr_${utr}`,
      amountPaise: booking.advance_amount_paise,
      paymentMethod: 'upi_qr',
      paymentType: 'advance_online',
      recordedBy: 'phonepe_gateway_engine',
    });

    expect(confirm.success).toBe(true);
    expect(confirm.booking?.status).toBe('confirmed');
    expect(confirm.booking?.advance_paid_paise).toBe(booking.advance_amount_paise);

    // Verify audit log entry
    const auditLogs = db.getAuditLogs();
    const phonepeLog = auditLogs.find(
      (log) => log.entity_id === booking.id && log.action === 'PAYMENT_VERIFIED_AND_CONFIRMED'
    );
    expect(phonepeLog).toBeDefined();
    expect(phonepeLog?.actor_id).toBe('phonepe_gateway_engine');
  });
});
