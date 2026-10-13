'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Lock,
  Zap,
  Code2,
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { PhonePeModal } from '@/components/phonepe-modal';
import { formatINR } from '@/lib/pricing';
import confetti from 'canvas-confetti';

export default function PhonePeDemoPage() {
  const [amountRupees, setAmountRupees] = useState(2184); // 30% advance on ₹7,280
  const [guestName, setGuestName] = useState('Vikramaditya Rao');
  const [guestEmail, setGuestEmail] = useState('vikram@example.com');
  const [guestPhone, setGuestPhone] = useState('+91 98111 67890');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phonepeData, setPhonepeData] = useState<{
    merchantTransactionId: string;
    amountPaise: number;
    bookingReference: string;
    xVerify: string;
  } | null>(null);

  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    phonepeTransactionId: string;
    utrNumber: string;
    amountPaidPaise: number;
    verifiedAt: string;
  } | null>(null);

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLaunchPhonePe = async () => {
    setLoading(true);
    setErrorMessage('');
    setVerificationResult(null);

    const amountPaise = Math.round(amountRupees * 100);
    const mockRef = `VWV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const res = await fetch('/api/payment/phonepe/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: '44444444-4444-4444-4444-444444444001', // existing demo booking
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPhonepeData({
          merchantTransactionId: data.merchantTransactionId,
          amountPaise: data.amountPaise,
          bookingReference: data.bookingReference,
          xVerify: data.xVerify,
        });
        setIsModalOpen(true);
      } else {
        // Direct sandbox simulator
        setPhonepeData({
          merchantTransactionId: `TXN_VWV_${Date.now()}`,
          amountPaise,
          bookingReference: mockRef,
          xVerify: `sha256_uat_mock_${Date.now()}###1`,
        });
        setIsModalOpen(true);
      }
    } catch {
      setPhonepeData({
        merchantTransactionId: `TXN_VWV_${Date.now()}`,
        amountPaise,
        bookingReference: mockRef,
        xVerify: `sha256_uat_mock_${Date.now()}###1`,
      });
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentData: {
    merchantTransactionId: string;
    phonepeTransactionId: string;
    utrNumber: string;
  }) => {
    setIsModalOpen(false);

    try {
      const verifyRes = await fetch('/api/payment/phonepe/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: '44444444-4444-4444-4444-444444444001',
          merchantTransactionId: paymentData.merchantTransactionId,
          phonepeTransactionId: paymentData.phonepeTransactionId,
          utrNumber: paymentData.utrNumber,
          xVerify: 'phonepe_ok_simulated',
        }),
      });

      const verifyJson = await verifyRes.json();
      if (verifyJson.success) {
        setVerificationResult({
          success: true,
          phonepeTransactionId: paymentData.phonepeTransactionId,
          utrNumber: paymentData.utrNumber,
          amountPaidPaise: Math.round(amountRupees * 100),
          verifiedAt: new Date().toISOString(),
        });
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else {
        setErrorMessage(verifyJson.error || 'Verification failed');
      }
    } catch {
      setErrorMessage('Server network error during PhonePe verification.');
    }
  };

  return (
    <main className="min-h-screen bg-hotel-limestone flex flex-col">
      <Navbar />

      <section className="pt-36 pb-20 px-6 md:px-12 flex-1">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-[10px] uppercase tracking-[0.2em] text-[#5f259f] font-bold mb-4">
              <Zap className="w-3.5 h-3.5 text-[#5f259f]" />
              <span>PhonePe Payment Gateway · 0% Fee UPI Demo</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl font-medium text-hotel-charcoal">
              Test PhonePe 30% Advance Deposit
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-hotel-muted leading-relaxed">
              Experience the 100% free UPI reservation engine. Zero gateway fees, instant mobile UPI Intent, dynamic QR codes, and SHA-256 signature verification.
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
                      className="w-full text-base font-serif font-bold p-2.5 pl-8 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none focus:border-[#5f259f]"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[1950, 2184, 2940, 4350].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmountRupees(preset)}
                        className="px-2.5 py-1 rounded-md bg-purple-50 text-[10px] font-semibold text-[#5f259f] hover:bg-[#5f259f] hover:text-white transition-colors"
                      >
                        ₹{preset.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-hotel-charcoal block mb-1.5">
                    Primary Guest Name
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
                    Mobile Number (UPI Intent)
                  </label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none"
                  />
                </div>
              </div>

              {/* Zero Fee Advantage Banner */}
              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/80 flex flex-wrap items-center justify-between gap-4 text-[11px] text-purple-900">
                <span className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#5f259f]" />
                  Zero Gateway Commission: 0% Fee on UPI Payments
                </span>
                <span>·</span>
                <span>SHA-256 Checksum: Verified</span>
                <span>·</span>
                <span>UTR Auto-Generated: 12-Digit Reference</span>
              </div>

              {/* Action Button */}
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleLaunchPhonePe}
                  className="px-10 py-4 bg-[#5f259f] hover:bg-[#4d1d82] text-white rounded-full text-xs uppercase tracking-wider font-bold transition-all duration-300 flex items-center gap-3 shadow-elevated active:scale-[0.98] disabled:opacity-50"
                >
                  <span className="w-5 h-5 rounded-full bg-white text-[#5f259f] font-black text-xs flex items-center justify-center">
                    पे
                  </span>
                  <span>
                    {loading
                      ? 'Initiating PhonePe Session...'
                      : `Open PhonePe Checkout (${formatINR(Math.round(amountRupees * 100))})`}
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
                      PhonePe Payment Confirmed & Verified
                    </h3>
                    <span className="text-xs text-hotel-muted">
                      Direct settlement confirmed into hotel current account.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-hotel-limestone space-y-1">
                    <span className="text-[10px] uppercase font-bold text-hotel-muted block">
                      PhonePe Txn ID
                    </span>
                    <span className="font-mono text-hotel-charcoal font-semibold">
                      {verificationResult.phonepeTransactionId}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-hotel-limestone space-y-1">
                    <span className="text-[10px] uppercase font-bold text-hotel-muted block">
                      Bank UPI UTR Number
                    </span>
                    <span className="font-mono text-hotel-charcoal font-semibold">
                      {verificationResult.utrNumber}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-hotel-limestone space-y-1">
                    <span className="text-[10px] uppercase font-bold text-hotel-muted block">
                      30% Advance Settled
                    </span>
                    <span className="font-serif text-lg font-bold text-[#5f259f]">
                      {formatINR(verificationResult.amountPaidPaise)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap gap-4 items-center justify-between border-t border-hotel-charcoal/10">
                  <Link
                    href="/admin/reservations"
                    className="text-xs font-semibold uppercase tracking-wider text-hotel-cypress hover:underline"
                  >
                    View in Admin Reception Register →
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

      {/* Embedded PhonePe Modal */}
      {phonepeData && (
        <PhonePeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          merchantTransactionId={phonepeData.merchantTransactionId}
          amountPaise={phonepeData.amountPaise}
          bookingReference={phonepeData.bookingReference}
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
