import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import {
  verifyRazorpayPaymentSignature,
  verifyWebhookSignature,
  getRazorpayCredentials,
} from '../src/lib/razorpay';
import { db } from '../src/lib/db';

describe('Payment Security & Webhook Idempotency', () => {
  it('validates authentic HMAC-SHA256 signatures generated with the secret key', () => {
    const { keySecret } = getRazorpayCredentials();
    const orderId = 'order_test_secure_123';
    const paymentId = 'pay_test_secure_456';

    const validSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const isValid = verifyRazorpayPaymentSignature({
      orderId,
      paymentId,
      signature: validSignature,
    });

    expect(isValid).toBe(true);
  });

  it('rejects tampered or forged payment signatures', () => {
    const orderId = 'order_test_tamper_123';
    const paymentId = 'pay_test_tamper_456';
    const forgedSignature = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    const isValid = verifyRazorpayPaymentSignature({
      orderId,
      paymentId,
      signature: forgedSignature,
    });

    expect(isValid).toBe(false);
  });

  it('verifies webhook raw payload signature', () => {
    const { webhookSecret } = getRazorpayCredentials();
    const rawPayload = JSON.stringify({
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_wh_123', amount: 500000 } } },
    });

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawPayload)
      .digest('hex');

    const isValid = verifyWebhookSignature({
      rawBody: rawPayload,
      webhookSignature: expectedSignature,
    });

    expect(isValid).toBe(true);
  });

  it('confirms booking payment idempotently without creating duplicate records', async () => {
    const hold = await db.createBookingHold({
      roomTypeId: '11111111-1111-1111-1111-111111111101',
      checkIn: '2026-11-20',
      checkOut: '2026-11-23',
      guestName: 'Idempotent Guest',
      guestEmail: 'idem@example.com',
      guestPhone: '+91 97777 66666',
      numGuests: 2,
    });
    expect(hold.success).toBe(true);
    const booking = hold.booking!;

    const paymentId = `pay_idem_${Date.now()}`;

    // First confirmation
    const confirm1 = db.confirmBookingPayment({
      bookingId: booking.id,
      razorpayPaymentId: paymentId,
      amountPaise: booking.advance_amount_paise,
      paymentType: 'advance_online',
    });
    expect(confirm1.success).toBe(true);
    expect(confirm1.booking?.status).toBe('confirmed');

    // Duplicate submission (e.g. user double clicks or delayed webhook delivers same event)
    const confirm2 = db.confirmBookingPayment({
      bookingId: booking.id,
      razorpayPaymentId: paymentId,
      amountPaise: booking.advance_amount_paise,
      paymentType: 'advance_online',
    });
    expect(confirm2.success).toBe(true);

    // Verify payments recorded count has not doubled
    const refreshed = db.getBookingById(booking.id);
    const matchingPayments = refreshed?.payments?.filter(
      (p) => p.razorpay_payment_id === paymentId
    );
    expect(matchingPayments?.length).toBe(1);
  });
});
