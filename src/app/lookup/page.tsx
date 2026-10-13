'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Search, ShieldAlert, CheckCircle2, Clock, Printer, XCircle, ArrowRight } from 'lucide-react';
import { Booking } from '@/lib/types';
import { formatINR } from '@/lib/pricing';

export default function BookingLookupPage() {
  const [reference, setReference] = useState('');
  const [contact, setContact] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Cancellation state
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setBooking(null);
    setCancelSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/booking/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, contact }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMessage(
          data.error || 'No matching reservation found for the given reference and contact.'
        );
      } else {
        setBooking(data.booking);
      }
    } catch {
      setErrorMessage('Failed to connect to the reservation database. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/booking/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          reference: booking.booking_reference,
          contact,
          reason: cancelReason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBooking(data.booking);
        setCancelling(false);
        setCancelSuccessMsg(
          'Your reservation has been cancelled in accordance with hotel policy.'
        );
      } else {
        setErrorMessage(data.error || 'Could not cancel booking.');
      }
    } catch {
      setErrorMessage('Failed to submit cancellation request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-hotel-limestone flex flex-col">
      <Navbar />

      <section className="pt-36 pb-20 px-6 md:px-12 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[10px] uppercase tracking-[0.25em] text-hotel-muted font-bold block mb-2">
              Guest Services Portal
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-medium text-hotel-charcoal">
              Find Your Reservation
            </h1>
            <p className="mt-3 text-sm text-hotel-muted">
              Enter your unique booking reference (e.g. VWV-2026-XXXX) and registered email or phone to view your stay details.
            </p>
          </div>

          {/* Search Form Card */}
          <div className="doppelrand-shell mb-12">
            <form
              onSubmit={handleLookup}
              className="doppelrand-core p-8 md:p-10 bg-white grid grid-cols-1 md:grid-cols-12 gap-6 items-end"
            >
              <div className="md:col-span-5">
                <label className="text-xs font-semibold text-hotel-charcoal block mb-2">
                  Booking Reference Number *
                </label>
                <input
                  type="text"
                  required
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. VWV-2026-9481"
                  className="w-full text-sm font-mono p-3.5 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none uppercase"
                />
              </div>

              <div className="md:col-span-5">
                <label className="text-xs font-semibold text-hotel-charcoal block mb-2">
                  Email or Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="e.g. aarav@example.com or 9820154321"
                  className="w-full text-sm p-3.5 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-hotel-cypress hover:bg-hotel-cypress-dark text-white rounded-xl text-xs uppercase tracking-wider font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                  <span>{loading ? 'Searching...' : 'Lookup'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-3">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Cancel Success Message */}
          {cancelSuccessMsg && (
            <div className="mb-8 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
              <span>{cancelSuccessMsg}</span>
            </div>
          )}

          {/* Booking Found Card */}
          {booking && (
            <div className="doppelrand-shell">
              <div className="doppelrand-core p-8 md:p-12 bg-white space-y-8">
                {/* Header status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-hotel-charcoal/10">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-hotel-muted font-bold block mb-1">
                      Booking Reference
                    </span>
                    <span className="font-mono text-2xl font-bold text-hotel-charcoal">
                      {booking.booking_reference}
                    </span>
                  </div>

                  <div>
                    {booking.status === 'confirmed' && (
                      <span className="px-3.5 py-1.5 rounded-full bg-hotel-cypress/10 text-hotel-cypress text-xs font-semibold uppercase tracking-wider">
                        Confirmed & Verified
                      </span>
                    )}
                    {booking.status === 'checked_in' && (
                      <span className="px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold uppercase tracking-wider">
                        Currently In-House
                      </span>
                    )}
                    {booking.status === 'cancelled' && (
                      <span className="px-3.5 py-1.5 rounded-full bg-red-100 text-red-800 text-xs font-semibold uppercase tracking-wider">
                        Cancelled
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
                  <div className="space-y-3">
                    <h4 className="font-serif text-lg font-medium text-hotel-charcoal">
                      Suite & Stay Details
                    </h4>
                    <p>
                      <strong className="text-hotel-charcoal">Category:</strong>{' '}
                      {booking.room_type?.name}
                    </p>
                    <p>
                      <strong className="text-hotel-charcoal">Allocated Room:</strong> Room{' '}
                      {booking.room?.room_number || 'Confirmed'}
                    </p>
                    <p>
                      <strong className="text-hotel-charcoal">Check-In:</strong> {booking.check_in}{' '}
                      (from 14:00 PM)
                    </p>
                    <p>
                      <strong className="text-hotel-charcoal">Check-Out:</strong> {booking.check_out}{' '}
                      (until 11:00 AM)
                    </p>
                    <p>
                      <strong className="text-hotel-charcoal">Duration:</strong> {booking.nights}{' '}
                      Nights · {booking.num_guests} Guests
                    </p>
                    <p>
                      <strong className="text-hotel-charcoal">Guest Name:</strong>{' '}
                      {booking.guest?.full_name}
                    </p>
                  </div>

                  <div className="space-y-3 border-t md:border-t-0 md:border-l border-hotel-charcoal/10 md:pl-8 pt-6 md:pt-0">
                    <h4 className="font-serif text-lg font-medium text-hotel-charcoal">
                      Financial Summary
                    </h4>
                    <div className="flex justify-between">
                      <span className="text-hotel-muted">Total Booking Tariff:</span>
                      <strong>{formatINR(booking.total_amount_paise)}</strong>
                    </div>
                    <div className="flex justify-between text-hotel-cypress">
                      <span>30% Advance Paid Online:</span>
                      <strong>{formatINR(booking.advance_paid_paise)}</strong>
                    </div>
                    <div className="flex justify-between font-bold text-hotel-charcoal pt-2 border-t border-hotel-charcoal/10 text-sm">
                      <span>Remaining Balance at Desk:</span>
                      <span>{formatINR(booking.balance_amount_paise)}</span>
                    </div>
                    <p className="text-[11px] text-hotel-muted pt-2">
                      Remaining balance payable upon arrival at the estate reception desk.
                    </p>
                  </div>
                </div>

                {/* Cancellation disclosure or form */}
                {booking.status === 'confirmed' && !cancelling && (
                  <div className="pt-6 border-t border-hotel-charcoal/10 flex flex-wrap items-center justify-between gap-4">
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-hotel-charcoal/20 text-xs font-semibold uppercase tracking-wider text-hotel-charcoal hover:bg-hotel-limestone"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Voucher</span>
                    </button>

                    <button
                      onClick={() => setCancelling(true)}
                      className="text-xs uppercase tracking-wider font-semibold text-red-700 hover:text-red-900 flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Request Cancellation
                    </button>
                  </div>
                )}

                {/* Cancellation Form */}
                {cancelling && (
                  <form
                    onSubmit={handleCancelRequest}
                    className="p-6 rounded-2xl bg-red-50/50 border border-red-200 space-y-4"
                  >
                    <span className="text-xs font-bold text-red-900 block">
                      Cancel Reservation Confirmation
                    </span>
                    <p className="text-[11px] text-red-700">
                      As per hotel policy, cancellations requested at least 48 hours prior to check-in are processed complimentary.
                    </p>
                    <textarea
                      rows={2}
                      required
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Please specify the reason for cancellation..."
                      className="w-full text-xs p-3 rounded-lg border border-red-200 bg-white focus:outline-none"
                    />
                    <div className="flex items-center gap-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-full text-xs uppercase font-semibold tracking-wider"
                      >
                        {loading ? 'Processing...' : 'Confirm Cancellation'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCancelling(false)}
                        className="text-xs text-hotel-muted hover:text-hotel-charcoal"
                      >
                        Back
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
