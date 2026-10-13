'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  Building2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Lock,
  X,
  Smartphone,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { formatINR } from '@/lib/pricing';

export interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amountPaise: number;
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  onSuccess: (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  onFailure?: (error: string) => void;
}

export function RazorpayModal({
  isOpen,
  onClose,
  orderId,
  amountPaise,
  bookingReference,
  guestName,
  guestEmail,
  guestPhone,
  onSuccess,
  onFailure,
}: RazorpayModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('guest@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('789');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSimulateSuccess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const mockPaymentId = `pay_test_${Date.now().toString(36)}_${Math.random()
        .toString(36)
        .substring(2, 7)}`;
      // Mock signature compliant with backend verification
      const mockSignature = `sig_verified_${Date.now()}`;

      setIsProcessing(false);
      onSuccess({
        razorpay_order_id: orderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
      });
    }, 1200);
  };

  const handleSimulateFailure = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (onFailure) {
        onFailure('Payment declined by card issuing bank (Simulated Failure)');
      }
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]">
        {/* Razorpay Brand Header */}
        <div className="bg-[#0c2340] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#0c2340] font-bold font-serif text-lg">
              V
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm">Hotel Vishwaveer</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-500/20 text-blue-300 font-bold uppercase tracking-wider">
                  Test Sandbox
                </span>
              </div>
              <span className="text-[11px] text-white/70 block">
                Ref: {bookingReference} · Order: {orderId.slice(0, 14)}...
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Ribbon */}
        <div className="bg-[#f2f6fa] border-b border-gray-200 px-5 py-3 flex items-center justify-between">
          <span className="text-xs text-gray-600 font-medium">30% Advance Deposit</span>
          <span className="font-serif text-xl font-bold text-gray-900">
            {formatINR(amountPaise)}
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Method Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setSelectedMethod('upi')}
              className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                selectedMethod === 'upi'
                  ? 'bg-white text-[#0c2340] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>UPI / QR</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('card')}
              className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                selectedMethod === 'card'
                  ? 'bg-white text-[#0c2340] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('netbanking')}
              className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                selectedMethod === 'netbanking'
                  ? 'bg-white text-[#0c2340] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Netbanking</span>
            </button>
          </div>

          {/* Tab 1: UPI */}
          {selectedMethod === 'upi' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-blue-200 flex items-center justify-center text-blue-700 font-bold shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-gray-800 block text-xs">Instant UPI QR & Apps</strong>
                  <span className="text-[11px] text-gray-500">
                    Google Pay · PhonePe · Paytm · BHIM
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                  Virtual Payment Address (VPA)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. mobile@upi or name@okhdfcbank"
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-white font-mono text-xs focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Cards */}
          {selectedMethod === 'card' && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                  Card Number (Pre-filled Razorpay Test Visa)
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-white font-mono text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                    Valid Thru (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-300 bg-white font-mono text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-300 bg-white font-mono text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Netbanking */}
          {selectedMethod === 'netbanking' && (
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                Select Your Bank
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => setSelectedBank(bank)}
                    className={`p-2.5 rounded-lg border text-left font-medium text-xs transition-colors ${
                      selectedBank === bank
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {bank}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customer prefill summary */}
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-[11px] text-gray-500 space-y-0.5">
            <div>
              <strong className="text-gray-700">Billing to:</strong> {guestName} ({guestEmail})
            </div>
            <div>
              <strong className="text-gray-700">Phone:</strong> {guestPhone}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-2.5">
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleSimulateSuccess}
            className="w-full py-3 bg-[#0c2340] hover:bg-[#14325a] disabled:opacity-50 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              {isProcessing
                ? 'Verifying with Bank...'
                : `Pay ${formatINR(amountPaise)} (Authorize Test Payment)`}
            </span>
          </button>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <button
              type="button"
              onClick={handleSimulateFailure}
              className="text-red-600 hover:underline font-medium"
            >
              Simulate Payment Failure
            </button>

            <span className="text-gray-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              Secured by Razorpay Standard
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
