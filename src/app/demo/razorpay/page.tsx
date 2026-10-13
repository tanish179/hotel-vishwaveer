'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  Code2,
  Lock,
  Smartphone,
  Copy,
  Check,
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { RazorpayModal } from '@/components/razorpay-modal';
import { formatINR } from '@/lib/pricing';
import confetti from 'canvas-confetti';

export default function RazorpayDemoPage() {
  const [amountRupees, setAmountRupees] = useState(2184); // e.g. 30% advance on ₹7,280
  const [guestName, setGuestName] = useState('Aarav Singhania');
  const [guestEmail, setGuestEmail] = useState('aarav@example.com');
  const [guestPhone, setGuestPhone] = useState('+91 98201 54321');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderData, setOrderData] = useState<{
    orderId: string;
    amountPaise: number;
    bookingReference: string;
  } | null>(null);

  // Verification result state
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    paymentId: string;
    signature: string;
    verifiedAt: string;
    details?: any;
  } | null>(null);

  const [errorMessage, setErrorMessage] = useState('');
  const [loadingOrder, setLoadingOrder] = useState(false);

  // Launch Razorpay order creation
  const handleLaunchCheckout = async () => {
    setLoadingOrder(true);
    setErrorMessage('');
    setVerificationResult(null);

    const amountPaise = Math.round(amountRupees * 100);
    const mockRef = `VWV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // 1. Create order via real API
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: '44444444-4444-4444-4444-444444444001', // existing demo booking
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrderData({
          orderId: data.orderId,
          amountPaise,
          bookingReference: mockRef,
        });
        setIsModalOpen(true);
      } else {
        // Fallback demo order ID
        setOrderData({
          orderId: `order_demo_${Date.now()}`,
          amountPaise,
          bookingReference: mockRef,
        });
        setIsModalOpen(true);
      }
    } catch {
      setOrderData({
        orderId: `order_demo_${Date.now()}`,
        amountPaise,
        bookingReference: mockRef,
      });
      setIsModalOpen(true);
    } finally {
      setLoadingOrder(false);
    }
  };

  // Called when user clicks "Authorize Test Payment" inside the modal
  const handlePaymentSuccess = async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    setIsModalOpen(false);

    try {
      // Cryptographically verify signature on server
      const verifyRes = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: '44444444-4444-4444-4444-444444444001',
          razorpayOrderId: paymentData.razorpay_order_id,
          razorpayPaymentId: paymentData.razorpay_payment_id,
          razorpaySignature: paymentData.razorpay_signature,
        }),
      });

      const verifyJson = await verifyRes.json();

      if (verifyJson.success) {
        setVerificationResult({
          success: true,
          paymentId: paymentData.razorpay_payment_id,
          signature: paymentData.razorpay_signature,
          verifiedAt: new Date().toISOString(),
          details: verifyJson,
        });
        confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
      } else {
        setErrorMessage(verifyJson.error || 'Signature check failed on server.');
      }
    } catch {
      setErrorMessage('Server network error during verification.');
    }
  };

  return (
    <main className="min-h-screen bg-hotel-limestone flex flex-col">
      <Navbar />

      <section className="pt-36 pb-20 px-6 md:px-12 flex-1">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] uppercase tracking-[0.2em] text-[#0c2340] font-bold mb-4">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>Razorpay Payment Gateway · Interactive Sandbox Demo</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl font-medium text-hotel-charcoal">
              Test Razorpay Advance Payment
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-hotel-muted leading-relaxed">
              Experience the exact direct booking checkout flow. Test UPI, Card, and Netbanking payments with cryptographic HMAC-SHA256 signature verification.
            </p>
          </div>

          {/* Interactive Control Panel */}
          <div className="doppelrand-shell">
            <div className="doppelrand-core p-8 md:p-10 bg-white space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div>
                  <label className="font-semibold text-hotel-charcoal block mb-1.5">
                    Advance Payment Amount (INR ₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-sm font-serif font-bold text-hotel-muted">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={100}
                      step={10}
                      value={amountRupees}
                      onChange={(e) => setAmountRupees(parseFloat(e.target.value) || 0)}
                      className="w-full text-base font-serif font-bold p-2.5 pl-8 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none focus:border-hotel-cypress"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[1950, 2184, 2940, 4350].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmountRupees(preset)}
                        className="px-2.5 py-1 rounded-md bg-hotel-sand text-[10px] font-semibold text-hotel-charcoal hover:bg-hotel-cypress hover:text-white transition-colors"
                      >
                        ₹{preset.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-hotel-charcoal block mb-1.5">
                    Guest Name (Pre-filled for checkout)
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-hotel-charcoal block mb-1.5">
                    Guest Email
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-hotel-charcoal block mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none"
                  />
                </div>
              </div>

              {/* Security Specs Ribbon */}
              <div className="p-4 rounded-xl bg-hotel-sand/40 border border-hotel-charcoal/10 flex flex-wrap items-center justify-between gap-4 text-[11px] text-hotel-muted">
                <span className="flex items-center gap-1.5 text-hotel-charcoal font-medium">
                  <Lock className="w-3.5 h-3.5 text-hotel-cypress" />
                  Amount in Paise: <strong>{Math.round(amountRupees * 100)} paise</strong>
                </span>
                <span>·</span>
                <span>HMAC-SHA256 Verification: Active</span>
                <span>·</span>
                <span>Idempotent Confirmation: Active</span>
              </div>

              {/* Trigger Button */}
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  disabled={loadingOrder}
                  onClick={handleLaunchCheckout}
                  className="px-10 py-4 bg-[#0c2340] hover:bg-[#14325a] text-white rounded-full text-xs uppercase tracking-wider font-semibold transition-all duration-300 flex items-center gap-3 shadow-elevated active:scale-[0.98] disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>
                    {loadingOrder
                      ? 'Creating Razorpay Order...'
                      : `Open Razorpay Checkout (${formatINR(Math.round(amountRupees * 100))})`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Verification Results Dossier */}
          {verificationResult && (
            <div className="doppelrand-shell animate-in fade-in duration-300">
              <div className="doppelrand-core p-8 bg-white space-y-6">
                <div className="flex items-center gap-3 text-emerald-800 pb-4 border-b border-hotel-charcoal/10">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-hotel-charcoal">
                      Payment Cryptographically Verified & Confirmed
                    </h3>
                    <span className="text-xs text-hotel-muted">
                      HMAC-SHA256 signature verified matching secret key in server memory.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-hotel-limestone space-y-1">
                    <span className="text-[10px] uppercase font-bold text-hotel-muted block">
                      Razorpay Payment ID
                    </span>
                    <span className="font-mono text-hotel-charcoal font-semibold">
                      {verificationResult.paymentId}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-hotel-limestone space-y-1">
                    <span className="text-[10px] uppercase font-bold text-hotel-muted block">
                      Amount Paid (30% Deposit)
                    </span>
                    <span className="font-serif text-lg font-bold text-hotel-cypress">
                      {formatINR(Math.round(amountRupees * 100))}
                    </span>
                  </div>

                  <div className="sm:col-span-2 p-4 rounded-xl bg-hotel-limestone space-y-1">
                    <span className="text-[10px] uppercase font-bold text-hotel-muted block">
                      HMAC Signature Hash
                    </span>
                    <span className="font-mono text-[11px] text-hotel-charcoal break-all">
                      {verificationResult.signature}
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap gap-4 items-center justify-between border-t border-hotel-charcoal/10">
                  <Link
                    href="/admin/finance"
                    className="text-xs font-semibold uppercase tracking-wider text-hotel-cypress hover:underline"
                  >
                    View in Admin Financial Ledger →
                  </Link>

                  <button
                    onClick={() => setVerificationResult(null)}
                    className="text-xs text-hotel-muted hover:text-hotel-charcoal"
                  >
                    Clear Result
                  </button>
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </section>

      {/* Embedded Razorpay Sandbox Modal */}
      {orderData && (
        <RazorpayModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          orderId={orderData.orderId}
          amountPaise={orderData.amountPaise}
          bookingReference={orderData.bookingReference}
          guestName={guestName}
          guestEmail={guestEmail}
          guestPhone={guestPhone}
          onSuccess={handlePaymentSuccess}
          onFailure={(err) => setErrorMessage(err)}
        />
      )}

      <Footer />
    </main>
  );
}
