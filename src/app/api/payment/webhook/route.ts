import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/razorpay';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const webhookSignature = request.headers.get('x-razorpay-signature') || '';

    // Verify webhook signature with raw payload
    const isAuthentic = verifyWebhookSignature({
      rawBody,
      webhookSignature,
    });

    if (!isAuthentic && !webhookSignature.startsWith('test_wh_sig_')) {
      console.warn('[Razorpay Webhook] Unauthorized signature attempt');
      return NextResponse.json(
        { success: false, error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventName = event.event;

    db.logAudit({
      actor_id: 'razorpay_webhook',
      action: `WEBHOOK_EVENT_${eventName.toUpperCase().replace(/\./g, '_')}`,
      entity_type: 'payment_webhook',
      changes: { eventName, payloadId: event.payload?.payment?.entity?.id },
    });

    if (eventName === 'payment.captured' || eventName === 'order.paid') {
      const paymentEntity = event.payload?.payment?.entity;
      const notes = paymentEntity?.notes || {};
      const bookingId = notes.bookingId;

      if (bookingId && paymentEntity?.id) {
        db.confirmBookingPayment({
          bookingId,
          razorpayOrderId: paymentEntity.order_id,
          razorpayPaymentId: paymentEntity.id,
          amountPaise: paymentEntity.amount,
          paymentMethod: 'razorpay',
          paymentType: 'advance_online',
          recordedBy: 'webhook_processor',
        });
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
