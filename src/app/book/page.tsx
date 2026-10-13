'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Clock,
  Printer,
  Copy,
  AlertCircle,
  CreditCard,
  QrCode,
  Smartphone,
  Zap,
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { RoomType, Booking } from '@/lib/types';
import { formatINR } from '@/lib/pricing';
import { PhonePeModal } from '@/components/phonepe-modal';
import confetti from 'canvas-confetti';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

function BookingFlowContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialRoomTypeId = searchParams.get('roomTypeId') || '';
  const initialCheckIn = searchParams.get('checkIn') || '';
  const initialCheckOut = searchParams.get('checkOut') || '';
  const initialGuests = parseInt(searchParams.get('guests') || '2', 10);

  // Steps: 1: Room & Dates, 2: Guest Details, 3: Review & Hold, 4: Confirmed
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>(initialRoomTypeId);
  const [checkIn, setCheckIn] = useState<string>(initialCheckIn);
  const [checkOut, setCheckOut] = useState<string>(initialCheckOut);
  const [guests, setGuests] = useState<number>(initialGuests);

  // Guest details form state
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [estimatedArrival, setEstimatedArrival] = useState('15:00');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Active Hold & Payment state
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [holdSecondsRemaining, setHoldSecondsRemaining] = useState<number>(900); // 15 mins
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [copied, setCopied] = useState(false);

  // PhonePe Payment & Verification State
  const [isPhonePeModalOpen, setIsPhonePeModalOpen] = useState(false);
  const [currentPhonePeOrder, setCurrentPhonePeOrder] = useState<{
    merchantTransactionId: string;
    amountPaise: number;
  } | null>(null);
  const [verifiedPaymentData, setVerifiedPaymentData] = useState<{
    phonepeTransactionId: string;
    utrNumber: string;
  } | null>(null);

  // Load room types
  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await fetch('/api/rooms');
        const data = await res.json();
        if (data.success && data.rooms) {
          setRoomTypes(data.rooms);
          if (!selectedRoomTypeId && data.rooms.length > 0) {
            setSelectedRoomTypeId(data.rooms[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch rooms', err);
      }
    }
    fetchRooms();
  }, [selectedRoomTypeId]);

  // Set default dates if empty
  useEffect(() => {
    const today = new Date();
    if (!checkIn) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      setCheckIn(tomorrow.toISOString().split('T')[0]);
    }
    if (!checkOut) {
      const afterTomorrow = new Date(today);
      afterTomorrow.setDate(afterTomorrow.getDate() + 3);
      setCheckOut(afterTomorrow.toISOString().split('T')[0]);
    }
  }, [checkIn, checkOut]);

  // Hold Timer countdown
  useEffect(() => {
    if (activeBooking && currentStep === 3 && holdSecondsRemaining > 0) {
      const timer = setInterval(() => {
        setHoldSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setErrorMessage('Your 15-minute room hold has expired. Please restart your booking.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeBooking, currentStep, holdSecondsRemaining]);

  const selectedRoom = roomTypes.find((r) => r.id === selectedRoomTypeId);

  // Compute live price estimate
  let estimatedNights = 1;
  let estimatedSubtotalPaise = 0;
  let estimatedGstPaise = 0;
  let estimatedTotalPaise = 0;
  let estimatedAdvancePaise = 0;
  let estimatedBalancePaise = 0;

  if (selectedRoom && checkIn && checkOut) {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diffTime = d2.getTime() - d1.getTime();
    estimatedNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    estimatedSubtotalPaise = selectedRoom.base_price_paise * estimatedNights;
    estimatedGstPaise = Math.round((estimatedSubtotalPaise * 12) / 100);
    estimatedTotalPaise = estimatedSubtotalPaise + estimatedGstPaise;
    estimatedAdvancePaise = Math.round((estimatedTotalPaise * 30) / 100);
    estimatedBalancePaise = estimatedTotalPaise - estimatedAdvancePaise;
  }

  // Handle Step 2 -> Step 3: Create Server Hold
  const handleProceedToHold = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!termsAccepted) {
      setErrorMessage('Please accept the reservation terms and cancellation policy to proceed.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/booking/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomTypeId: selectedRoomTypeId,
          checkIn,
          checkOut,
          guestName,
          guestEmail,
          guestPhone,
          numGuests: guests,
          specialRequests,
          estimatedArrivalTime: estimatedArrival,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMessage(data.error || 'Failed to place temporary hold. Room may be unavailable.');
        setLoading(false);
        return;
      }

      setActiveBooking(data.booking);
      setHoldSecondsRemaining(15 * 60);
      setCurrentStep(3);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Server communication error.');
    } finally {
      setLoading(false);
    }
  };

  // Handle PhonePe Payment Trigger
  const handleInitiatePhonePePayment = async () => {
    if (!activeBooking) return;
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/payment/phonepe/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: activeBooking.id,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
          guestPhone: guestPhone.trim(),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMessage(data.error || 'Failed to initiate PhonePe transaction.');
        setLoading(false);
        return;
      }

      setCurrentPhonePeOrder({
        merchantTransactionId: data.merchantTransactionId,
        amountPaise: data.amountPaise,
      });
      setIsPhonePeModalOpen(true);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Server communication error.');
    } finally {
      setLoading(false);
    }
  };

  const copyReference = () => {
    if (confirmedBooking) {
      navigator.clipboard.writeText(confirmedBooking.booking_reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Progress Stepper - Responsive Mobile & Desktop */}
      <div className="mb-8 sm:mb-12">
        {/* Desktop Stepper */}
        <div className="hidden sm:flex items-center justify-between text-xs font-semibold tracking-wider uppercase text-hotel-muted">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                currentStep >= 1
                  ? 'bg-hotel-cypress text-white'
                  : 'bg-hotel-sand text-hotel-muted'
              }`}
            >
              1
            </span>
            <span className={currentStep >= 1 ? 'text-hotel-cypress font-bold' : ''}>
              Suite &amp; Dates
            </span>
          </div>
          <span className="text-hotel-charcoal/20">———</span>

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                currentStep >= 2
                  ? 'bg-hotel-cypress text-white'
                  : 'bg-hotel-sand text-hotel-muted'
              }`}
            >
              2
            </span>
            <span className={currentStep >= 2 ? 'text-hotel-cypress font-bold' : ''}>
              Guest Details
            </span>
          </div>
          <span className="text-hotel-charcoal/20">———</span>

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                currentStep >= 3
                  ? 'bg-[#5f259f] text-white'
                  : 'bg-hotel-sand text-hotel-muted'
              }`}
            >
              3
            </span>
            <span className={currentStep >= 3 ? 'text-[#5f259f] font-bold' : ''}>
              30% Advance Deposit
            </span>
          </div>
          <span className="text-hotel-charcoal/20">———</span>

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                currentStep === 4
                  ? 'bg-emerald-600 text-white'
                  : 'bg-hotel-sand text-hotel-muted'
              }`}
            >
              4
            </span>
            <span className={currentStep === 4 ? 'text-emerald-700 font-bold' : ''}>
              Confirmed
            </span>
          </div>
        </div>

        {/* Mobile Stepper */}
        <div className="sm:hidden flex flex-col gap-2 p-3 rounded-xl bg-white border border-hotel-charcoal/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-hotel-cypress">
              Step {currentStep} of 4
            </span>
            <span className="text-xs font-serif font-bold text-hotel-charcoal">
              {currentStep === 1 && 'Suite & Itinerary'}
              {currentStep === 2 && 'Guest Particulars'}
              {currentStep === 3 && '30% Advance Deposit'}
              {currentStep === 4 && 'Confirmed & Verified'}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-hotel-charcoal/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-hotel-cypress transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: Suite Selection & Dates */}
      {currentStep === 1 && (
        <div className="doppelrand-shell">
          <div className="doppelrand-core p-5 sm:p-8 md:p-10 bg-white space-y-6 sm:space-y-8">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-hotel-muted font-bold block mb-1">
                Step 1 of 3
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-hotel-charcoal">
                Select Your Suite &amp; Itinerary
              </h2>
            </div>

            {/* Dates & Guests Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 p-4 rounded-2xl bg-hotel-limestone border border-hotel-charcoal/10">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-hotel-muted font-bold block mb-1.5">
                  Check-In Date
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full text-base sm:text-xs font-semibold p-3 sm:p-2.5 rounded-xl bg-white border border-hotel-charcoal/15 min-h-[46px] focus:outline-none focus:border-hotel-cypress"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-hotel-muted font-bold block mb-1.5">
                  Check-Out Date
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full text-base sm:text-xs font-semibold p-3 sm:p-2.5 rounded-xl bg-white border border-hotel-charcoal/15 min-h-[46px] focus:outline-none focus:border-hotel-cypress"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-hotel-muted font-bold block mb-1.5">
                  Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value, 10))}
                  className="w-full text-base sm:text-xs font-semibold p-3 sm:p-2.5 rounded-xl bg-white border border-hotel-charcoal/15 min-h-[46px] focus:outline-none focus:border-hotel-cypress"
                >
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests</option>
                  <option value={3}>3 Guests</option>
                  <option value={4}>4 Guests</option>
                  <option value={5}>5 Guests</option>
                </select>
              </div>
            </div>

            {/* Room Type Selector */}
            <div className="space-y-3.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-hotel-charcoal block">
                Choose Suite Category
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roomTypes.map((r) => {
                  const isSelected = r.id === selectedRoomTypeId;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRoomTypeId(r.id)}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-hotel-cypress bg-hotel-cypress/5 ring-2 ring-hotel-cypress/20'
                          : 'border-hotel-charcoal/10 bg-white hover:border-hotel-charcoal/30'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h4 className="font-serif text-lg sm:text-xl font-medium text-hotel-charcoal">
                          {r.name}
                        </h4>
                        <span className="font-serif text-base sm:text-lg font-semibold text-hotel-charcoal shrink-0">
                          {formatINR(r.base_price_paise)}
                        </span>
                      </div>
                      <p className="text-xs text-hotel-muted line-clamp-2 mb-3">
                        {r.short_description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-hotel-muted font-medium">
                        <span>Up to {r.max_guests} Guests</span>
                        <span>·</span>
                        <span>{r.bed_type}</span>
                        <span>·</span>
                        <span>{r.room_size_sqft} sq ft</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price Preview Card */}
            {selectedRoom && (
              <div className="p-4 sm:p-6 rounded-2xl bg-hotel-sand/50 border border-hotel-charcoal/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <span className="text-xs text-hotel-muted block">
                    Estimated Tariff ({estimatedNights} nights + GST):
                  </span>
                  <span className="font-serif text-xl sm:text-2xl font-semibold text-hotel-charcoal">
                    {formatINR(estimatedTotalPaise)}
                  </span>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-hotel-charcoal/10">
                  <span className="text-xs font-bold text-hotel-cypress block">
                    30% Advance Deposit: {formatINR(estimatedAdvancePaise)}
                  </span>
                  <span className="text-[11px] text-hotel-muted">
                    Balance at check-in: {formatINR(estimatedBalancePaise)}
                  </span>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-hotel-cypress hover:bg-hotel-cypress-dark text-white text-xs uppercase tracking-wider font-semibold px-8 py-4 rounded-full transition-all shadow-subtle active:scale-[0.98]"
              >
                <span>Continue to Guest Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Guest Details Form (Guest Checkout - NO mandatory login!) */}
      {currentStep === 2 && (
        <div className="doppelrand-shell">
          <form
            onSubmit={handleProceedToHold}
            className="doppelrand-core p-5 sm:p-8 md:p-10 bg-white space-y-6 sm:space-y-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-hotel-muted font-bold block mb-1">
                  Step 2 of 3 · Guest Checkout
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-hotel-charcoal">
                  Guest Contact &amp; Preferences
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs uppercase tracking-wider font-semibold text-hotel-muted hover:text-hotel-charcoal flex items-center gap-1.5 self-start sm:self-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Suite</span>
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="text-xs font-semibold text-hotel-charcoal block mb-1.5">
                  Full Name (Primary Guest) *
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Vikramaditya Rao"
                  className="w-full text-base sm:text-sm p-3.5 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none focus:border-hotel-cypress min-h-[48px]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-hotel-charcoal block mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="e.g. vikram@example.com"
                  className="w-full text-base sm:text-sm p-3.5 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none focus:border-hotel-cypress min-h-[48px]"
                />
                <span className="text-[10px] text-hotel-muted mt-1 block">
                  Reservation confirmation &amp; receipt will be sent here.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-hotel-charcoal block mb-1.5">
                  Mobile Phone Number (with Country Code) *
                </label>
                <input
                  type="tel"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+91 98201 54321"
                  className="w-full text-base sm:text-sm p-3.5 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none focus:border-hotel-cypress min-h-[48px]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-hotel-charcoal block mb-1.5">
                  Estimated Arrival Time
                </label>
                <select
                  value={estimatedArrival}
                  onChange={(e) => setEstimatedArrival(e.target.value)}
                  className="w-full text-base sm:text-sm p-3.5 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none focus:border-hotel-cypress min-h-[48px]"
                >
                  <option value="14:00">14:00 (Standard Check-in)</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="18:00">18:00 (Evening)</option>
                  <option value="20:00">20:00+ (Late Evening)</option>
                </select>
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="text-xs font-semibold text-hotel-charcoal block mb-1.5">
                Special Requests or Dietary Preferences (Optional)
              </label>
              <textarea
                rows={3}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Anniversary stay, quiet room preference, lactose-free milk, airport transfer assistance, etc."
                className="w-full text-base sm:text-sm p-3.5 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none focus:border-hotel-cypress resize-none"
              />
            </div>

            {/* Policies & Terms Checkbox */}
            <div className="p-4 rounded-xl bg-hotel-limestone border border-hotel-charcoal/10 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer text-xs text-hotel-charcoal">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-hotel-charcoal/30 text-hotel-cypress focus:ring-hotel-cypress w-4 h-4 shrink-0"
                />
                <span>
                  I acknowledge and accept the <strong>Hotel Vishwaveer Cancellation Policy</strong>{' '}
                  (complimentary cancellation up to 48 hours prior to check-in) and authorize the
                  30% advance deposit.
                </span>
              </label>
            </div>

            {/* Proceed Action */}
            <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs uppercase tracking-wider font-semibold text-hotel-muted hover:text-hotel-charcoal text-center py-2"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-hotel-cypress hover:bg-hotel-cypress-dark disabled:opacity-50 text-white text-xs uppercase tracking-wider font-semibold px-8 py-4 rounded-full transition-all shadow-subtle active:scale-[0.98]"
              >
                <span>{loading ? 'Reserving Temporary Hold...' : 'Review & Lock Reservation'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3: Review Hold & Pay 30% Advance */}
      {currentStep === 3 && activeBooking && (
        <div className="doppelrand-shell">
          <div className="doppelrand-core p-5 sm:p-8 md:p-10 bg-white space-y-6 sm:space-y-8">
            {/* Hold Banner with Countdown */}
            <div className="p-4 rounded-2xl bg-hotel-cypress/10 border border-hotel-cypress/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-hotel-cypress animate-pulse shrink-0" />
                <div>
                  <span className="text-xs font-bold text-hotel-cypress block">
                    Temporary Room Hold Active
                  </span>
                  <span className="text-[11px] text-hotel-muted">
                    This physical room is locked exclusively for you. Complete your 30% advance deposit
                    to confirm.
                  </span>
                </div>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <span className="font-mono text-lg font-bold text-hotel-cypress">
                  {Math.floor(holdSecondsRemaining / 60)}:
                  {(holdSecondsRemaining % 60).toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-hotel-muted block">
                  Remaining
                </span>
              </div>
            </div>

            {/* Reservation Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-hotel-muted font-bold block mb-2">
                  Stay Details
                </span>
                <h3 className="font-serif text-2xl font-medium text-hotel-charcoal mb-4">
                  {activeBooking.room_type?.name}
                </h3>
                <div className="space-y-2 text-xs text-hotel-muted">
                  <p>
                    <strong className="text-hotel-charcoal">Dates:</strong> {activeBooking.check_in}{' '}
                    to {activeBooking.check_out} ({activeBooking.nights} Nights)
                  </p>
                  <p>
                    <strong className="text-hotel-charcoal">Guests:</strong> {activeBooking.num_guests}{' '}
                    Guests
                  </p>
                  <p>
                    <strong className="text-hotel-charcoal">Primary Guest:</strong> {guestName} (
                    {guestEmail})
                  </p>
                  <p>
                    <strong className="text-hotel-charcoal">Hold Ref:</strong>{' '}
                    <span className="font-mono font-bold text-hotel-charcoal">
                      {activeBooking.booking_reference}
                    </span>
                  </p>
                </div>
              </div>

              {/* Authoritative Price Breakdown */}
              <div className="p-6 rounded-2xl bg-hotel-sand/40 border border-hotel-charcoal/10 space-y-3 text-xs">
                <span className="text-[10px] uppercase tracking-wider text-hotel-muted font-bold block mb-1">
                  Authoritative Price Breakdown
                </span>
                <div className="flex justify-between text-hotel-muted">
                  <span>Room Tariff ({activeBooking.nights} Nights)</span>
                  <span className="text-hotel-charcoal font-medium">
                    {formatINR(activeBooking.subtotal_paise)}
                  </span>
                </div>
                <div className="flex justify-between text-hotel-muted">
                  <span>GST (12%)</span>
                  <span className="text-hotel-charcoal font-medium">
                    {formatINR(activeBooking.gst_amount_paise)}
                  </span>
                </div>
                <div className="pt-2 border-t border-hotel-charcoal/10 flex justify-between font-serif text-lg font-bold text-hotel-charcoal">
                  <span>Gross Total</span>
                  <span>{formatINR(activeBooking.total_amount_paise)}</span>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-white border border-hotel-cypress/30 space-y-2">
                  <div className="flex justify-between text-sm font-bold text-hotel-cypress">
                    <span>Pay Now (30% Advance Deposit):</span>
                    <span>{formatINR(activeBooking.advance_amount_paise)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-hotel-muted">
                    <span>Remaining Balance Due at Hotel:</span>
                    <span>{formatINR(activeBooking.balance_amount_paise)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PhonePe Advance Deposit Banner */}
            <div className="pt-6 border-t border-hotel-charcoal/10 space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/70 border border-purple-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#5f259f] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                    पे
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-hotel-charcoal">
                        PhonePe UPI &amp; Dynamic QR
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        0% Extra Fee
                      </span>
                    </div>
                    <span className="text-xs text-purple-800/80 block mt-0.5">
                      Direct UPI Intent (GPay, PhonePe, Paytm, BHIM) &amp; Instant QR
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-purple-200/60">
                  <span className="text-[10px] uppercase tracking-wider text-hotel-muted font-bold block">
                    30% Advance Deposit Due
                  </span>
                  <span className="font-serif text-xl font-bold text-[#5f259f]">
                    {formatINR(activeBooking.advance_amount_paise)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Button & Trust Badge */}
            <div className="pt-4 border-t border-hotel-charcoal/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-hotel-muted flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#5f259f]" />
                Official PhonePe sandbox engine · Zero merchant fees
              </span>

              <button
                type="button"
                onClick={handleInitiatePhonePePayment}
                disabled={loading || holdSecondsRemaining <= 0}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#5f259f] hover:bg-[#4d1d82] text-white text-xs uppercase tracking-wider font-bold px-9 py-4 rounded-full transition-all shadow-subtle active:scale-[0.98] disabled:opacity-50"
              >
                <QrCode className="w-4 h-4" />
                <span>
                  {loading
                    ? 'Connecting to PhonePe...'
                    : `Pay ${formatINR(activeBooking.advance_amount_paise)} Deposit`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Exact Image 1 PhonePe Verified Confirmation Dossier */}
      {currentStep === 4 && confirmedBooking && (
        <div className="doppelrand-shell animate-in fade-in duration-300">
          <div className="doppelrand-core p-5 sm:p-8 md:p-10 bg-white space-y-6">
            {/* Header: Green Check + Title matching Image 1 */}
            <div className="flex items-start sm:items-center gap-3 text-emerald-800 pb-4 border-b border-hotel-charcoal/10">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-hotel-charcoal leading-tight">
                  PhonePe Payment Confirmed &amp; Verified
                </h3>
                <span className="text-xs text-hotel-muted block mt-0.5">
                  Direct settlement confirmed into hotel current account.
                </span>
              </div>
            </div>

            {/* Three Key Status Badges matching Image 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              <div className="p-4 rounded-xl bg-hotel-limestone space-y-1">
                <span className="text-[10px] uppercase font-bold text-hotel-muted block">
                  PHONEPE TXN ID
                </span>
                <span className="font-mono text-hotel-charcoal font-semibold text-sm break-all">
                  {verifiedPaymentData?.phonepeTransactionId ||
                    confirmedBooking.payments?.[0]?.razorpay_payment_id?.replace('phonepe_', '') ||
                    `T${Date.now()}`}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-hotel-limestone space-y-1">
                <span className="text-[10px] uppercase font-bold text-hotel-muted block">
                  BANK UPI UTR NUMBER
                </span>
                <span className="font-mono text-hotel-charcoal font-semibold text-sm">
                  {verifiedPaymentData?.utrNumber ||
                    confirmedBooking.payments?.[0]?.razorpay_signature?.replace('utr_', '') ||
                    '816039143689'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-hotel-limestone space-y-1">
                <span className="text-[10px] uppercase font-bold text-hotel-muted block">
                  30% ADVANCE SETTLED
                </span>
                <span className="font-serif text-xl font-bold text-[#5f259f]">
                  {formatINR(confirmedBooking.advance_paid_paise || confirmedBooking.advance_amount_paise)}
                </span>
              </div>
            </div>

            {/* Verified Guest & Estate Reference Ribbon */}
            <div className="p-3.5 rounded-xl bg-hotel-sand/40 border border-hotel-charcoal/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-hotel-muted">
              <div>
                Guest: <strong className="text-hotel-charcoal font-semibold">{confirmedBooking.guest?.full_name || guestName}</strong> · Suite: <strong className="text-hotel-charcoal">{confirmedBooking.room_type?.name}</strong> (Room {confirmedBooking.room?.room_number || '101'})
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <span>Ref:</span>
                <strong className="text-hotel-cypress font-bold">{confirmedBooking.booking_reference}</strong>
              </div>
            </div>

            {/* Bottom Actions matching Image 1: VIEW IN ADMIN RECEPTION REGISTER -> and Clear Result */}
            <div className="pt-4 flex flex-wrap gap-4 items-center justify-between border-t border-hotel-charcoal/10 text-xs">
              <Link
                href="/admin/reservations"
                className="font-bold uppercase tracking-wider text-hotel-cypress hover:underline flex items-center gap-2"
              >
                <span>VIEW IN ADMIN RECEPTION REGISTER</span>
                <span>→</span>
              </Link>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    setConfirmedBooking(null);
                    setActiveBooking(null);
                  }}
                  className="text-xs text-hotel-muted hover:text-hotel-charcoal"
                >
                  Clear Result
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/rooms')}
                  className="px-4 py-2 rounded-full bg-hotel-cypress text-white hover:bg-hotel-cypress-dark transition-all font-semibold uppercase tracking-wider text-[11px] shadow-subtle active:scale-[0.98]"
                >
                  Book Another Suite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embedded PhonePe Sandbox Modal */}
      {currentPhonePeOrder && activeBooking && (
        <PhonePeModal
          isOpen={isPhonePeModalOpen}
          onClose={() => setIsPhonePeModalOpen(false)}
          merchantTransactionId={currentPhonePeOrder.merchantTransactionId}
          amountPaise={currentPhonePeOrder.amountPaise}
          bookingReference={activeBooking.booking_reference}
          guestName={guestName}
          guestEmail={guestEmail}
          guestPhone={guestPhone}
          onSuccess={async (paymentData) => {
            setIsPhonePeModalOpen(false);
            setLoading(true);
            setVerifiedPaymentData({
              phonepeTransactionId: paymentData.phonepeTransactionId,
              utrNumber: paymentData.utrNumber,
            });
            try {
              const verifyRes = await fetch('/api/payment/phonepe/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  bookingId: activeBooking.id,
                  merchantTransactionId: paymentData.merchantTransactionId,
                  phonepeTransactionId: paymentData.phonepeTransactionId,
                  utrNumber: paymentData.utrNumber,
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                setConfirmedBooking(verifyData.booking);
                setCurrentStep(4);
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
              } else {
                setErrorMessage(verifyData.error || 'PhonePe payment verification failed.');
              }
            } catch {
              setErrorMessage('Network error during PhonePe payment verification.');
            } finally {
              setLoading(false);
            }
          }}
          onFailure={(err) => setErrorMessage(err)}
        />
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-hotel-limestone flex flex-col">
      <Navbar />
      <section className="pt-24 sm:pt-28 md:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 md:px-12 flex-1">
        <Suspense fallback={<div className="text-center py-24 text-hotel-muted">Loading reservation engine...</div>}>
          <BookingFlowContent />
        </Suspense>
      </section>
      <Footer />
    </main>
  );
}
