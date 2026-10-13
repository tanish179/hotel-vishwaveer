'use client';

import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Lock,
  X,
  ArrowRight,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';
import { formatINR } from '@/lib/pricing';

export interface PhonePeModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantTransactionId: string;
  amountPaise: number;
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  onSuccess: (paymentData: {
    merchantTransactionId: string;
    phonepeTransactionId: string;
    utrNumber: string;
  }) => void;
  onFailure?: (error: string) => void;
}

export function PhonePeModal({
  isOpen,
  onClose,
  merchantTransactionId,
  amountPaise,
  bookingReference,
  guestName,
  guestEmail,
  guestPhone,
  onSuccess,
  onFailure,
}: PhonePeModalProps) {
  const [activeTab, setActiveTab] = useState<'qr' | 'intent' | 'vpa'>('qr');
  const [upiVpa, setUpiVpa] = useState('guest@ybl');
  const [isProcessing, setIsProcessing] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 mins for QR

  useEffect(() => {
    if (isOpen && timerSeconds > 0) {
      const interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen, timerSeconds]);

  if (!isOpen) return null;

  const handleAuthorizeSuccess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const mockPhonePeTxnId = `T${Date.now()}`;
      const mockUtr = `${Math.floor(100000000000 + Math.random() * 900000000000)}`;

      setIsProcessing(false);
      onSuccess({
        merchantTransactionId,
        phonepeTransactionId: mockPhonePeTxnId,
        utrNumber: mockUtr,
      });
    }, 1200);
  };

  const handleSimulateDecline = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (onFailure) {
        onFailure('UPI transaction declined by bank server (Simulated PhonePe Decline)');
      }
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border border-purple-200 flex flex-col max-h-[92vh]">
        {/* Authentic PhonePe Brand Header (Purple #5f259f) */}
        <div className="bg-[#5f259f] text-white p-4 sm:p-5 flex flex-col">
          {/* Mobile Sheet Handle */}
          <div className="sm:hidden w-10 h-1 bg-white/30 rounded-full mx-auto mb-3" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#5f259f] font-black text-xl shadow shrink-0">
                पे
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight">PhonePe Gateway</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-400/30 text-purple-200 font-bold uppercase tracking-wider">
                    0% Fee UPI
                  </span>
                </div>
                <span className="text-[11px] text-purple-200 block truncate max-w-[200px] sm:max-w-none">
                  Hotel Vishwaveer · Ref: {bookingReference}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close PhonePe Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Amount Ribbon */}
        <div className="bg-purple-50/70 border-b border-purple-100 px-4 sm:px-5 py-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-purple-900 font-medium block">
              30% Advance Deposit Required
            </span>
            <span className="text-[10px] text-purple-700">70% balance payable at check-in</span>
          </div>
          <span className="font-serif text-2xl font-bold text-[#5f259f]">
            {formatINR(amountPaise)}
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Method Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('qr')}
              className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all ${
                activeTab === 'qr'
                  ? 'bg-white text-[#5f259f] shadow-sm font-bold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan QR</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('intent')}
              className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all ${
                activeTab === 'intent'
                  ? 'bg-white text-[#5f259f] shadow-sm font-bold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>UPI Apps</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('vpa')}
              className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all ${
                activeTab === 'vpa'
                  ? 'bg-white text-[#5f259f] shadow-sm font-bold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>UPI ID</span>
            </button>
          </div>

          {/* TAB 1: Scan QR Code */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center justify-center text-center p-3 space-y-3">
              {/* Dynamic QR Box */}
              <div className="p-3 bg-white border-2 border-purple-200 rounded-2xl shadow-inner relative group">
                <div className="w-44 h-44 bg-purple-50 rounded-xl flex flex-col items-center justify-center p-2 relative overflow-hidden border border-purple-100">
                  {/* Stylized QR Code Visual */}
                  <div className="w-36 h-36 bg-[#5f259f] rounded-lg p-2.5 flex items-center justify-center relative">
                    <div className="w-full h-full bg-white rounded-md flex items-center justify-center p-2">
                      <QrCode className="w-28 h-28 text-[#5f259f]" />
                    </div>
                    {/* Centered PhonePe Badge */}
                    <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-[#5f259f] text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">
                      पे
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-gray-800 text-xs block">
                  Scan with PhonePe, Google Pay, Paytm, or BHIM
                </span>
                <span className="text-[11px] text-gray-500 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 text-[#5f259f]" />
                  QR expires in {Math.floor(timerSeconds / 60)}:
                  {(timerSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: Direct UPI Apps (Mobile Intent) */}
          {activeTab === 'intent' && (
            <div className="space-y-2.5 pt-1">
              <span className="text-[11px] font-semibold text-gray-600 block mb-2">
                Tap to pay directly with your preferred UPI app:
              </span>

              {[
                { name: 'PhonePe', color: 'bg-purple-50 border-purple-200 text-[#5f259f]' },
                { name: 'Google Pay (GPay)', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                { name: 'Paytm UPI', color: 'bg-sky-50 border-sky-200 text-sky-800' },
                { name: 'BHIM UPI', color: 'bg-amber-50 border-amber-200 text-amber-800' },
              ].map((app) => (
                <button
                  key={app.name}
                  type="button"
                  onClick={handleAuthorizeSuccess}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between font-semibold transition-all hover:shadow-sm ${app.color}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4" />
                    <span>Pay with {app.name}</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ))}
            </div>
          )}

          {/* TAB 3: UPI ID / VPA */}
          {activeTab === 'vpa' && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                  Enter Your UPI Virtual Payment Address (VPA)
                </label>
                <input
                  type="text"
                  value={upiVpa}
                  onChange={(e) => setUpiVpa(e.target.value)}
                  placeholder="e.g. mobile@ybl or yourname@okaxis"
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-white font-mono text-xs focus:outline-none focus:border-[#5f259f]"
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-[11px] text-purple-900">
                A payment request for <strong>{formatINR(amountPaise)}</strong> will be sent to your UPI app.
              </div>
            </div>
          )}

          {/* Guest Prefill Details */}
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-[11px] text-gray-500 flex justify-between items-center">
            <div>
              <strong className="text-gray-700 block">{guestName}</strong>
              <span>{guestPhone} · {guestEmail}</span>
            </div>
            <span className="text-[10px] font-mono text-gray-400">
              Txn: {merchantTransactionId.slice(0, 10)}...
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-2.5">
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleAuthorizeSuccess}
            className="w-full py-4 bg-[#5f259f] hover:bg-[#4d1d82] disabled:opacity-50 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] min-h-[48px]"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>
              {isProcessing
                ? 'Processing with Bank UPI...'
                : `Authorize ₹${(amountPaise / 100).toLocaleString('en-IN')} (PhonePe Sandbox Approval)`}
            </span>
          </button>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <button
              type="button"
              onClick={handleSimulateDecline}
              className="text-red-600 hover:underline font-medium"
            >
              Simulate Payment Failure
            </button>

            <span className="text-gray-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#5f259f]" />
              Zero Fee UPI Gateway
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
