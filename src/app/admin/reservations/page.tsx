'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  Plus,
  Calendar,
  Users,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Booking, BookingStatus, PhysicalRoom, RoomType } from '@/lib/types';
import { formatINR } from '@/lib/pricing';

function ReservationsContent() {
  const searchParams = useSearchParams();
  const initialAction = searchParams.get('action');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');

  // Selected booking for detailed management drawer
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Offline Payment recording state
  const [payingOffline, setPayingOffline] = useState(false);
  const [offlineAmountPaise, setOfflineAmountPaise] = useState<number>(0);
  const [offlineMethod, setOfflineMethod] = useState<'cash' | 'card_terminal' | 'upi_qr'>('cash');

  // Walk-in modal state
  const [walkInOpen, setWalkInOpen] = useState(initialAction === 'new');
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [physicalRooms, setPhysicalRooms] = useState<PhysicalRoom[]>([]);
  const [walkInForm, setWalkInForm] = useState({
    roomTypeId: '',
    roomId: '',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    numGuests: 2,
    specialRequests: '',
    paymentMethod: 'cash',
    advanceCollected: true,
  });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const url = `/api/admin/reservations?status=${statusFilter}${
        searchQuery ? `&query=${encodeURIComponent(searchQuery)}` : ''
      }`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchQuery]);

  // Load rooms for walk-in
  useEffect(() => {
    async function loadRoomMeta() {
      try {
        const res = await fetch('/api/admin/rooms');
        const data = await res.json();
        if (data.success) {
          setRoomTypes(data.roomTypes);
          setPhysicalRooms(data.rooms);
          if (data.roomTypes.length > 0 && !walkInForm.roomTypeId) {
            setWalkInForm((prev) => ({ ...prev, roomTypeId: data.roomTypes[0].id }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadRoomMeta();
  }, [walkInForm.roomTypeId]);

  // Handle Status Update (Check-in, Check-out, Cancel)
  const handleUpdateStatus = async (newStatus: BookingStatus) => {
    if (!selectedBooking) return;
    try {
      const res = await fetch(`/api/admin/reservations/${selectedBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedBooking(data.booking);
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Offline Payment recording
  const handleRecordOfflinePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      const res = await fetch(`/api/admin/reservations/${selectedBooking.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountPaise: offlineAmountPaise,
          paymentMethod: offlineMethod,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedBooking(data.booking);
        setPayingOffline(false);
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Walk-in submit
  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(walkInForm),
      });
      const data = await res.json();
      if (data.success) {
        setWalkInOpen(false);
        fetchBookings();
      } else {
        alert(data.error || 'Failed to allocate walk-in room');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-12 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-hotel-muted font-bold block mb-1">
            Reception Register
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-hotel-charcoal">
            Reservation Management
          </h1>
        </div>

        <button
          onClick={() => setWalkInOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-hotel-cypress hover:bg-hotel-cypress-dark text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-subtle min-h-[44px]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Walk-In Guest</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-hotel-charcoal/10 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reference, guest name, phone, room..."
            className="w-full text-base sm:text-xs p-3 pl-9 rounded-xl border border-hotel-charcoal/15 bg-hotel-limestone focus:outline-none min-h-[44px]"
          />
          <Search className="w-4 h-4 text-hotel-muted absolute left-3 top-3.5" />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {(['all', 'confirmed', 'checked_in', 'checked_out', 'held', 'cancelled'] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg font-medium capitalize text-xs transition-colors ${
                  statusFilter === status
                    ? 'bg-hotel-cypress text-white font-semibold'
                    : 'bg-hotel-sand/50 text-hotel-muted hover:text-hotel-charcoal'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="doppelrand-shell">
        <div className="doppelrand-core p-4 sm:p-6 bg-white">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hotel-charcoal/10 text-hotel-muted uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-2">Ref</th>
                  <th className="py-3 px-2">Guest Particulars</th>
                  <th className="py-3 px-2">Allocated Room</th>
                  <th className="py-3 px-2">Dates</th>
                  <th className="py-3 px-2">Tariff</th>
                  <th className="py-3 px-2">30% Advance</th>
                  <th className="py-3 px-2">Balance Due</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hotel-charcoal/5">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-hotel-muted">
                      Loading reservation register...
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-hotel-muted">
                      No reservations matching current criteria.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr
                      key={b.id}
                      onClick={() => {
                        setSelectedBooking(b);
                        setOfflineAmountPaise(b.balance_amount_paise);
                      }}
                      className="hover:bg-hotel-sand/40 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-2 font-mono font-bold text-hotel-charcoal">
                        {b.booking_reference}
                      </td>
                      <td className="py-4 px-2">
                        <strong className="text-hotel-charcoal block">{b.guest?.full_name || 'Guest'}</strong>
                        <span className="text-[10px] text-hotel-muted">
                          {b.guest?.phone} · {b.guest?.email}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <span className="font-semibold text-hotel-charcoal block">
                          Room {b.room?.room_number || 'TBD'}
                        </span>
                        <span className="text-[10px] text-hotel-muted">{b.room_type?.name}</span>
                      </td>
                      <td className="py-4 px-2">
                        <span>
                          {b.check_in} → {b.check_out}
                        </span>
                        <span className="text-[10px] text-hotel-muted block">
                          {b.nights} {b.nights === 1 ? 'Night' : 'Nights'}
                        </span>
                      </td>
                      <td className="py-4 px-2 font-medium text-hotel-charcoal">
                        {formatINR(b.total_amount_paise)}
                      </td>
                      <td className="py-4 px-2 text-hotel-cypress font-semibold">
                        {formatINR(b.advance_paid_paise)}
                      </td>
                      <td className="py-4 px-2 font-medium text-hotel-charcoal">
                        {formatINR(b.balance_amount_paise)}
                      </td>
                      <td className="py-4 px-2">
                        {b.status === 'confirmed' && (
                          <span className="px-2.5 py-1 rounded-full bg-hotel-cypress/10 text-hotel-cypress font-semibold text-[10px] uppercase">
                            Confirmed
                          </span>
                        )}
                        {b.status === 'checked_in' && (
                          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold text-[10px] uppercase">
                            In-House
                          </span>
                        )}
                        {b.status === 'checked_out' && (
                          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold text-[10px] uppercase">
                            Departed
                          </span>
                        )}
                        {b.status === 'held' && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold text-[10px] uppercase">
                            Hold (15m)
                          </span>
                        )}
                        {b.status === 'cancelled' && (
                          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-semibold text-[10px] uppercase">
                            Cancelled
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-2 text-right">
                        <span className="text-hotel-cypress font-semibold text-xs flex items-center justify-end gap-1">
                          Manage <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Reservation Cards View */}
          <div className="md:hidden space-y-3">
            {loading ? (
              <div className="py-12 text-center text-hotel-muted text-xs">
                Loading reservation register...
              </div>
            ) : bookings.length === 0 ? (
              <div className="py-12 text-center text-hotel-muted text-xs">
                No reservations matching criteria.
              </div>
            ) : (
              bookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() => {
                    setSelectedBooking(b);
                    setOfflineAmountPaise(b.balance_amount_paise);
                  }}
                  className="p-4 rounded-xl border border-hotel-charcoal/10 bg-white hover:bg-hotel-sand/30 transition-all cursor-pointer space-y-3 shadow-sm active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-hotel-cypress text-sm">
                      {b.booking_reference}
                    </span>
                    <div>
                      {b.status === 'confirmed' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-hotel-cypress/10 text-hotel-cypress font-semibold text-[10px] uppercase">
                          Confirmed
                        </span>
                      )}
                      {b.status === 'checked_in' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold text-[10px] uppercase">
                          In-House
                        </span>
                      )}
                      {b.status === 'checked_out' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold text-[10px] uppercase">
                          Departed
                        </span>
                      )}
                      {b.status === 'held' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-[10px] uppercase">
                          Hold (15m)
                        </span>
                      )}
                      {b.status === 'cancelled' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-semibold text-[10px] uppercase">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <strong className="text-hotel-charcoal text-base block">
                      {b.guest?.full_name || 'Guest'}
                    </strong>
                    <span className="text-xs text-hotel-muted block">
                      {b.guest?.phone} · {b.guest?.email}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-hotel-charcoal/5 text-xs text-hotel-muted">
                    <div>
                      <span className="text-[10px] uppercase block font-bold text-hotel-muted">Room</span>
                      <span className="font-semibold text-hotel-charcoal">
                        Room {b.room?.room_number || 'TBD'} ({b.room_type?.name})
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase block font-bold text-hotel-muted">Dates</span>
                      <span className="text-hotel-charcoal">
                        {b.check_in} → {b.check_out} ({b.nights}N)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-hotel-charcoal/5 text-xs">
                    <div>
                      <span className="text-[10px] text-hotel-muted block">30% Advance Paid</span>
                      <span className="font-bold text-hotel-cypress">{formatINR(b.advance_paid_paise)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-hotel-muted block">Balance Due</span>
                      <span className="font-bold text-hotel-charcoal">{formatINR(b.balance_amount_paise)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* DETAIL DRAWER / MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xl bg-white h-full overflow-y-auto p-5 sm:p-8 shadow-2xl space-y-6 flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-hotel-charcoal/10">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-hotel-muted font-bold block mb-1">
                    Booking Dossier
                  </span>
                  <span className="font-mono text-2xl font-bold text-hotel-charcoal">
                    {selectedBooking.booking_reference}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-2 rounded-full hover:bg-hotel-sand transition-colors"
                >
                  <X className="w-5 h-5 text-hotel-charcoal" />
                </button>
              </div>

              {/* Status Action Buttons */}
              <div className="py-6 border-b border-hotel-charcoal/10 flex flex-wrap items-center gap-3">
                {selectedBooking.status === 'confirmed' && (
                  <button
                    onClick={() => handleUpdateStatus('checked_in')}
                    className="px-5 py-2.5 rounded-xl bg-hotel-cypress text-white text-xs uppercase font-semibold tracking-wider hover:bg-hotel-cypress-dark transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Check-In Guest</span>
                  </button>
                )}

                {selectedBooking.status === 'checked_in' && (
                  <button
                    onClick={() => handleUpdateStatus('checked_out')}
                    className="px-5 py-2.5 rounded-xl bg-blue-700 text-white text-xs uppercase font-semibold tracking-wider hover:bg-blue-800 transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Process Check-Out</span>
                  </button>
                )}

                {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'checked_out' && (
                  <button
                    onClick={() => handleUpdateStatus('cancelled')}
                    className="px-4 py-2.5 rounded-xl border border-red-300 text-red-700 text-xs uppercase font-semibold tracking-wider hover:bg-red-50 transition-colors"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>

              {/* Guest & Room Breakdown */}
              <div className="space-y-4 py-6 border-b border-hotel-charcoal/10 text-xs">
                <div>
                  <strong className="text-hotel-charcoal text-sm block mb-1">
                    {selectedBooking.guest?.full_name}
                  </strong>
                  <p className="text-hotel-muted">
                    Phone: {selectedBooking.guest?.phone} · Email: {selectedBooking.guest?.email}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-hotel-sand/40 space-y-1.5">
                  <p>
                    <strong>Room Category:</strong> {selectedBooking.room_type?.name}
                  </p>
                  <p>
                    <strong>Physical Room:</strong> Room {selectedBooking.room?.room_number} (Floor{' '}
                    {selectedBooking.room?.floor})
                  </p>
                  <p>
                    <strong>Stay:</strong> {selectedBooking.check_in} to {selectedBooking.check_out} ({selectedBooking.nights} nights)
                  </p>
                  <p>
                    <strong>Guests:</strong> {selectedBooking.num_guests} guests
                  </p>
                  {selectedBooking.special_requests && (
                    <p className="pt-2 text-hotel-muted border-t border-hotel-charcoal/10">
                      <strong>Special Requests:</strong> {selectedBooking.special_requests}
                    </p>
                  )}
                </div>
              </div>

              {/* Financial Breakdown & Offline Payment */}
              <div className="py-6 space-y-4 text-xs">
                <h4 className="font-serif text-lg font-medium text-hotel-charcoal">
                  Payment Ledger
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-hotel-muted">
                    <span>Gross Tariff:</span>
                    <strong>{formatINR(selectedBooking.total_amount_paise)}</strong>
                  </div>
                  <div className="flex justify-between text-hotel-cypress">
                    <span>30% Advance Collected:</span>
                    <strong>{formatINR(selectedBooking.advance_paid_paise)}</strong>
                  </div>
                  <div className="flex justify-between text-blue-700">
                    <span>Offline Payments Recorded:</span>
                    <strong>{formatINR(selectedBooking.balance_paid_paise)}</strong>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-hotel-charcoal/10 font-bold text-sm text-hotel-charcoal">
                    <span>Remaining Due:</span>
                    <span>{formatINR(selectedBooking.balance_amount_paise)}</span>
                  </div>
                </div>

                {/* Record Offline Payment Button/Form */}
                {selectedBooking.balance_amount_paise > 0 && !payingOffline && (
                  <button
                    onClick={() => {
                      setPayingOffline(true);
                      setOfflineAmountPaise(selectedBooking.balance_amount_paise);
                    }}
                    className="w-full py-3 rounded-xl border border-hotel-cypress text-hotel-cypress text-xs uppercase font-semibold tracking-wider hover:bg-hotel-cypress/5 transition-colors"
                  >
                    Record Offline Payment (Desk)
                  </button>
                )}

                {payingOffline && (
                  <form
                    onSubmit={handleRecordOfflinePayment}
                    className="p-4 rounded-xl bg-hotel-limestone border border-hotel-charcoal/10 space-y-3"
                  >
                    <span className="font-semibold block text-hotel-charcoal">
                      Record Payment at Desk
                    </span>
                    <div>
                      <label className="text-[10px] uppercase text-hotel-muted font-bold block mb-1">
                        Amount in Paise
                      </label>
                      <input
                        type="number"
                        value={offlineAmountPaise}
                        onChange={(e) => setOfflineAmountPaise(parseInt(e.target.value, 10))}
                        className="w-full text-xs p-2 rounded border bg-white"
                      />
                      <span className="text-[10px] text-hotel-muted mt-1 block">
                        Equivalent to {formatINR(offlineAmountPaise)}
                      </span>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase text-hotel-muted font-bold block mb-1">
                        Payment Method
                      </label>
                      <select
                        value={offlineMethod}
                        onChange={(e) =>
                          setOfflineMethod(e.target.value as 'cash' | 'card_terminal' | 'upi_qr')
                        }
                        className="w-full text-xs p-2 rounded border bg-white"
                      >
                        <option value="cash">Cash</option>
                        <option value="card_terminal">POS Card Terminal</option>
                        <option value="upi_qr">UPI QR Code</option>
                      </select>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-hotel-cypress text-white text-xs uppercase font-semibold rounded-lg"
                      >
                        Confirm Receipt
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayingOffline(false)}
                        className="text-xs text-hotel-muted"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-hotel-charcoal/10 flex justify-between items-center text-xs">
              <button
                onClick={() => window.print()}
                className="text-hotel-muted hover:text-hotel-charcoal flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Print Folio
              </button>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-xs uppercase tracking-wider font-semibold text-hotel-muted hover:text-hotel-charcoal"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WALK-IN CREATION MODAL */}
      {walkInOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-hotel-charcoal/10">
              <h3 className="font-serif text-2xl font-medium text-hotel-charcoal">
                Record Front Desk Walk-In
              </h3>
              <button onClick={() => setWalkInOpen(false)}>
                <X className="w-5 h-5 text-hotel-charcoal" />
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-hotel-muted block mb-1">
                  Suite Category
                </label>
                <select
                  value={walkInForm.roomTypeId}
                  onChange={(e) =>
                    setWalkInForm((prev) => ({ ...prev, roomTypeId: e.target.value }))
                  }
                  className="w-full p-2.5 rounded-lg border bg-hotel-limestone"
                >
                  {roomTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.name} - {formatINR(rt.base_price_paise)} / night
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-hotel-muted block mb-1">
                    Check-In Date
                  </label>
                  <input
                    type="date"
                    value={walkInForm.checkIn}
                    onChange={(e) =>
                      setWalkInForm((prev) => ({ ...prev, checkIn: e.target.value }))
                    }
                    className="w-full p-2 rounded border bg-hotel-limestone"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-hotel-muted block mb-1">
                    Check-Out Date
                  </label>
                  <input
                    type="date"
                    value={walkInForm.checkOut}
                    onChange={(e) =>
                      setWalkInForm((prev) => ({ ...prev, checkOut: e.target.value }))
                    }
                    className="w-full p-2 rounded border bg-hotel-limestone"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-hotel-muted block mb-1">
                  Guest Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={walkInForm.guestName}
                  onChange={(e) =>
                    setWalkInForm((prev) => ({ ...prev, guestName: e.target.value }))
                  }
                  placeholder="e.g. Rajiv Deshmukh"
                  className="w-full p-2.5 rounded border bg-hotel-limestone"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-hotel-muted block mb-1">
                    Guest Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={walkInForm.guestPhone}
                    onChange={(e) =>
                      setWalkInForm((prev) => ({ ...prev, guestPhone: e.target.value }))
                    }
                    placeholder="+91 98..."
                    className="w-full p-2 rounded border bg-hotel-limestone"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-hotel-muted block mb-1">
                    Guest Email
                  </label>
                  <input
                    type="email"
                    value={walkInForm.guestEmail}
                    onChange={(e) =>
                      setWalkInForm((prev) => ({ ...prev, guestEmail: e.target.value }))
                    }
                    placeholder="email@example.com"
                    className="w-full p-2 rounded border bg-hotel-limestone"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-hotel-sand/50 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={walkInForm.advanceCollected}
                    onChange={(e) =>
                      setWalkInForm((prev) => ({ ...prev, advanceCollected: e.target.checked }))
                    }
                    className="rounded text-hotel-cypress"
                  />
                  <span>Record 30% Advance Deposit Collected at Front Desk</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setWalkInOpen(false)}
                  className="px-4 py-2 text-hotel-muted hover:text-hotel-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-hotel-cypress hover:bg-hotel-cypress-dark text-white rounded-xl uppercase font-semibold text-xs"
                >
                  Confirm Walk-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminReservationsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-hotel-muted">Loading reservations...</div>}>
      <ReservationsContent />
    </Suspense>
  );
}
