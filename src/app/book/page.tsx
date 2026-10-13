'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { RoomType, Booking } from '@/lib/types';
import { formatINR } from '@/lib/pricing';
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

  // Handle Razorpay Payment Trigger
  const handleInitiatePayment = async () => {
    if (!activeBooking) return;
    setLoading(true);
    setErrorMessage('');

    try {
      // 1. Create Order on Server
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: activeBooking.id }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        setErrorMessage(orderData.error || 'Failed to initiate Razorpay order.');
        setLoading(false);
        return;
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amountPaise,
        currency: orderData.currency,
        name: 'Hotel Vishwaveer',
        description: `30% Advance Deposit - Ref: ${activeBooking.booking_reference}`,
        image: '/brand/logo.svg',
        order_id: orderData.orderId,
        prefill: {
          name: guestName,
          email: guestEmail,
          contact: guestPhone,
        },
        theme: {
          color: '#233726', // Hotel cypress brand color
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async function (response: any) {
          // 3. Cryptographically verify signature on server
          setLoading(true);
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bookingId: activeBooking.id,
                razorpayOrderId: response.razorpay_order_id || orderData.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setConfirmedBooking(verifyData.booking);
              setCurrentStep(4);
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            } else {
              setErrorMessage(
                verifyData.error ||
                  'Payment signature verification failed. Please contact support.'
              );
            }
          } catch (err: unknown) {
            setErrorMessage('Network error during payment verification.');
          } finally {
            setLoading(false);
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      if (typeof window.Razorpay !== 'undefined') {
        const rzp = new window.Razorpay(options);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rzp.on('payment.failed', function (response: any) {
          setErrorMessage(
            `Payment attempt failed: ${response.error?.description || 'Gateway declined'}`
          );
          setLoading(false);
        });
        rzp.open();
      } else {
        // Fallback simulator for headless or test environments
        console.warn('Razorpay SDK not loaded in DOM; using verified mock test payment flow');
        const mockVerifyRes = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: activeBooking.id,
            razorpayOrderId: orderData.orderId,
            razorpayPaymentId: `pay_test_${Date.now()}`,
            razorpaySignature: 'sig_test_simulator_ok',
          }),
        });
        const verifyData = await mockVerifyRes.json();
        if (verifyData.success) {
          setConfirmedBooking(verifyData.booking);
          setCurrentStep(4);
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } else {
          setErrorMessage(verifyData.error || 'Failed to simulate verification.');
        }
        setLoading(false);
      }
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Payment initiation error.');
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
      {/* Progress Stepper */}
      <div className="mb-12">
        <div className="flex items-center justify-between text-xs font-semibold tracking-wider uppercase text-hotel-muted">
          <span className={currentStep >= 1 ? 'text-hotel-cypress' : ''}>
            1. Suite & Dates
          </span>
          <span className="hidden sm:inline">———</span>
          <span className={currentStep >= 2 ? 'text-hotel-cypress' : ''}>
            2. Guest Details
          </span>
          <span className="hidden sm:inline">———</span>
          <span className={currentStep >= 3 ? 'text-hotel-cypress' : ''}>
            3. 30% Advance Payment
          </span>
          <span className="hidden sm:inline">———</span>
          <span className={currentStep === 4 ? 'text-hotel-cypress' : ''}>
            4. Confirmation
          </span>
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
          <div className="doppelrand-core p-8 md:p-10 bg-white space-y-8">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-hotel-muted font-bold block mb-1">
                Step 1 of 3
              </span>
              <h2 className="font-serif text-3xl font-medium text-hotel-charcoal">
                Select Your Suite & Itinerary
              </h2>
            </div>

            {/* Dates & Guests Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-hotel-limestone border border-hotel-charcoal/10">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-hotel-muted font-bold block mb-1">
                  Check-In Date
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full text-xs font-semibold p-2 rounded-lg bg-white border border-hotel-charcoal/10"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-hotel-muted font-bold block mb-1">
                  Check-Out Date
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full text-xs font-semibold p-2 rounded-lg bg-white border border-hotel-charcoal/10"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-hotel-muted font-bold block mb-1">
                  Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value, 10))}
                  className="w-full text-xs font-semibold p-2 rounded-lg bg-white border border-hotel-charcoal/10"
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
            <div className="space-y-4">
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
                      className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-hotel-cypress bg-hotel-cypress/5 ring-2 ring-hotel-cypress/20'
                          : 'border-hotel-charcoal/10 bg-white hover:border-hotel-charcoal/30'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-serif text-xl font-medium text-hotel-charcoal">
                          {r.name}
                        </h4>
                        <span className="font-serif text-lg font-semibold text-hotel-charcoal">
                          {formatINR(r.base_price_paise)}
                        </span>
                      </div>
                      <p className="text-xs text-hotel-muted line-clamp-2 mb-3">
                        {r.short_description}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-hotel-muted font-medium">
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
              <div className="p-6 rounded-2xl bg-hotel-sand/50 border border-hotel-charcoal/10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-hotel-muted block">
                    Estimated Tariff ({estimatedNights} nights + GST):
                  </span>
                  <span className="font-serif text-2xl font-semibold text-hotel-charcoal">
                    {formatINR(estimatedTotalPaise)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-hotel-cypress block">
                    30% Advance Deposit: {formatINR(estimatedAdvancePaise)}
                  </span>
                  <span className="text-[11px] text-hotel-muted">
                    Balance at check-in: {formatINR(estimatedBalancePaise)}
                  </span>
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-2 bg-hotel-cypress hover:bg-hotel-cypress-dark text-white text-xs uppercase tracking-wider font-semibold px-8 py-4 rounded-full transition-all shadow-subtle active:scale-[0.98]"
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
            className="doppelrand-core p-8 md:p-10 bg-white space-y-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-hotel-muted font-bold block mb-1">
                  Step 2 of 3 · Guest Checkout
                </span>
                <h2 className="font-serif text-3xl font-medium text-hotel-charcoal">
                  Guest Contact & Preferences
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs uppercase tracking-wider font-semibold text-hotel-muted hover:text-hotel-charcoal flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change Suite
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                  className="w-full text-sm p-3.5 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none focus:border-hotel-cypress"
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
                  className="w-full text-sm p-3.5 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none focus:border-hotel-cypress"
                />
                <span className="text-[10px] text-hotel-muted mt-1 block">
                  Reservation confirmation & receipt will be sent here.
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
                  className="w-full text-sm p-3.5 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none focus:border-hotel-cypress"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-hotel-charcoal block mb-1.5">
                  Estimated Arrival Time
                </label>
                <select
                  value={estimatedArrival}
                  onChange={(e) => setEstimatedArrival(e.target.value)}
                  className="w-full text-sm p-3.5 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none focus:border-hotel-cypress"
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
                className="w-full text-sm p-3.5 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none focus:border-hotel-cypress resize-none"
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
                  className="mt-0.5 rounded border-hotel-charcoal/30 text-hotel-cypress focus:ring-hotel-cypress"
                />
                <span>
                  I acknowledge and accept the <strong>Hotel Vishwaveer Cancellation Policy</strong>{' '}
                  (complimentary cancellation up to 48 hours prior to check-in) and authorize the
                  30% advance deposit.
                </span>
              </label>
            </div>

            {/* Proceed Action */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs uppercase tracking-wider font-semibold text-hotel-muted hover:text-hotel-charcoal"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-hotel-cypress hover:bg-hotel-cypress-dark disabled:opacity-50 text-white text-xs uppercase tracking-wider font-semibold px-8 py-4 rounded-full transition-all shadow-subtle active:scale-[0.98]"
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
          <div className="doppelrand-core p-8 md:p-10 bg-white space-y-8">
            {/* Hold Banner with Countdown */}
            <div className="p-4 rounded-2xl bg-hotel-cypress/10 border border-hotel-cypress/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-hotel-cypress animate-pulse" />
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
              <div className="text-right">
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

            {/* Payment Button */}
            <div className="pt-6 border-t border-hotel-charcoal/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-hotel-muted flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-hotel-cypress" />
                Processed securely via Razorpay (UPI, Credit/Debit, Netbanking)
              </span>

              <button
                type="button"
                onClick={handleInitiatePayment}
                disabled={loading || holdSecondsRemaining <= 0}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-hotel-cypress hover:bg-hotel-cypress-dark disabled:opacity-50 text-white text-xs uppercase tracking-wider font-semibold px-10 py-4 rounded-full transition-all shadow-subtle active:scale-[0.98]"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {loading
                    ? 'Connecting to Gateway...'
                    : `Pay ${formatINR(activeBooking.advance_amount_paise)} Deposit`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Confirmation & Receipt */}
      {currentStep === 4 && confirmedBooking && (
        <div className="doppelrand-shell">
          <div className="doppelrand-core p-8 md:p-12 bg-white space-y-8">
            <div className="text-center max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-hotel-cypress/10 text-hotel-cypress flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-hotel-cypress font-bold block mb-2">
                Reservation Confirmed
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl font-medium text-hotel-charcoal">
                We await your arrival at Vishwaveer.
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-hotel-muted leading-relaxed">
                A confirmation has been recorded in our reservation register and dispatched to{' '}
                <strong>{guestEmail}</strong>.
              </p>
            </div>

            {/* Reference Number Box */}
            <div className="p-6 rounded-2xl bg-hotel-sand/50 border border-hotel-charcoal/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-hotel-muted font-bold block mb-1">
                  Booking Reference Number
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-bold text-hotel-charcoal tracking-wide">
                  {confirmedBooking.booking_reference}
                </span>
              </div>
              <button
                onClick={copyReference}
                className="px-4 py-2 rounded-full border border-hotel-charcoal/20 text-xs font-semibold uppercase tracking-wider text-hotel-charcoal hover:bg-white flex items-center gap-2 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Reference'}</span>
              </button>
            </div>

            {/* Receipt Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-white border border-hotel-charcoal/10 text-xs">
              <div className="space-y-3">
                <h4 className="font-serif text-lg font-medium text-hotel-charcoal">
                  Reservation Particulars
                </h4>
                <p>
                  <strong className="text-hotel-charcoal">Suite Category:</strong>{' '}
                  {confirmedBooking.room_type?.name}
                </p>
                <p>
                  <strong className="text-hotel-charcoal">Allocated Room:</strong> Room{' '}
                  {confirmedBooking.room?.room_number || 'Reserved'}
                </p>
                <p>
                  <strong className="text-hotel-charcoal">Check-In:</strong>{' '}
                  {confirmedBooking.check_in} (from 14:00 PM)
                </p>
                <p>
                  <strong className="text-hotel-charcoal">Check-Out:</strong>{' '}
                  {confirmedBooking.check_out} (until 11:00 AM)
                </p>
                <p>
                  <strong className="text-hotel-charcoal">Duration:</strong>{' '}
                  {confirmedBooking.nights} Nights · {confirmedBooking.num_guests} Guests
                </p>
              </div>

              <div className="space-y-3 border-t md:border-t-0 md:border-l border-hotel-charcoal/10 md:pl-6 pt-4 md:pt-0">
                <h4 className="font-serif text-lg font-medium text-hotel-charcoal">
                  Financial Reconciliation
                </h4>
                <div className="flex justify-between">
                  <span>Total Tariff (incl. GST):</span>
                  <strong>{formatINR(confirmedBooking.total_amount_paise)}</strong>
                </div>
                <div className="flex justify-between text-hotel-cypress">
                  <span>30% Advance Deposit Paid:</span>
                  <strong>{formatINR(confirmedBooking.advance_paid_paise)}</strong>
                </div>
                <div className="flex justify-between text-hotel-charcoal pt-2 border-t border-hotel-charcoal/10 font-bold">
                  <span>Remaining Balance Due at Hotel:</span>
                  <span>{formatINR(confirmedBooking.balance_amount_paise)}</span>
                </div>
                <p className="text-[11px] text-hotel-muted pt-2">
                  Remaining balance payable at check-in via Cash, Card, or UPI terminal.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-hotel-charcoal/10 flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-hotel-charcoal/20 text-xs font-semibold uppercase tracking-wider text-hotel-charcoal hover:bg-hotel-limestone transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>

              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center gap-2 bg-hotel-cypress text-white px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-hotel-cypress-dark transition-all"
              >
                <span>Return to Estate Homepage</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-hotel-limestone flex flex-col">
      <Navbar />
      <section className="pt-36 pb-24 px-6 md:px-12 flex-1">
        <Suspense fallback={<div className="text-center py-24 text-hotel-muted">Loading reservation engine...</div>}>
          <BookingFlowContent />
        </Suspense>
      </section>
      <Footer />
    </main>
  );
}
