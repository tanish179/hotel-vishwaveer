'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  CreditCard,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { formatINR } from '@/lib/pricing';
import { Booking } from '@/lib/types';

export default function AdminFinancePage() {
  const [stats, setStats] = useState<{
    grossBookedPaise: number;
    advanceCollectedPaise: number;
    balanceCollectedPaise: number;
    totalCollectedPaise: number;
    outstandingBalancePaise: number;
  } | null>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFinance() {
      try {
        setLoading(true);
        const [statsRes, bookingsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/reservations'),
        ]);

        const statsData = await statsRes.json();
        const bookingsData = await bookingsRes.json();

        if (statsData.success) setStats(statsData.stats);
        if (bookingsData.success) setBookings(bookingsData.bookings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadFinance();
  }, []);

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-hotel-muted font-bold block mb-1">
            Financial Management & Reconciliation
          </span>
          <h1 className="font-serif text-3xl font-medium text-hotel-charcoal">
            Revenue & Payment Ledger
          </h1>
        </div>

        <a
          href="/api/admin/export?format=csv"
          download
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-hotel-cypress hover:bg-hotel-cypress-dark text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-subtle"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Download Audit CSV</span>
        </a>
      </div>

      {/* KPI 4-Card Revenue Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="doppelrand-shell">
          <div className="doppelrand-core p-6 bg-white space-y-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-hotel-muted block">
              Gross Booked Value
            </span>
            <span className="font-serif text-3xl font-bold text-hotel-charcoal block">
              {formatINR(stats?.grossBookedPaise || 0)}
            </span>
            <span className="text-[11px] text-hotel-muted">
              Total committed booking revenue
            </span>
          </div>
        </div>

        <div className="doppelrand-shell">
          <div className="doppelrand-core p-6 bg-white space-y-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-hotel-muted block">
              Verified Advance Deposits (30%)
            </span>
            <span className="font-serif text-3xl font-bold text-hotel-cypress block">
              {formatINR(stats?.advanceCollectedPaise || 0)}
            </span>
            <span className="text-[11px] text-hotel-muted">
              Collected via Razorpay gateway
            </span>
          </div>
        </div>

        <div className="doppelrand-shell">
          <div className="doppelrand-core p-6 bg-white space-y-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-hotel-muted block">
              Front Desk Balances Collected
            </span>
            <span className="font-serif text-3xl font-bold text-blue-700 block">
              {formatINR(stats?.balanceCollectedPaise || 0)}
            </span>
            <span className="text-[11px] text-hotel-muted">
              Collected via POS terminal, Cash, UPI
            </span>
          </div>
        </div>

        <div className="doppelrand-shell">
          <div className="doppelrand-core p-6 bg-white space-y-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-hotel-muted block">
              Outstanding Accounts Receivable
            </span>
            <span className="font-serif text-3xl font-bold text-hotel-brass block">
              {formatINR(stats?.outstandingBalancePaise || 0)}
            </span>
            <span className="text-[11px] text-hotel-muted">
              Due upon guest check-in at the hotel
            </span>
          </div>
        </div>
      </div>

      {/* Accounting Transactions Register */}
      <div className="doppelrand-shell">
        <div className="doppelrand-core p-6 md:p-8 bg-white space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-2xl font-medium text-hotel-charcoal">
                Transaction Reconciliation Register
              </h3>
              <p className="text-xs text-hotel-muted mt-1">
                Authoritative financial transactions matched to individual reservations
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hotel-charcoal/10 text-hotel-muted uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-2">Ref</th>
                  <th className="py-3 px-2">Primary Guest</th>
                  <th className="py-3 px-2">Suite</th>
                  <th className="py-3 px-2">Gross Total</th>
                  <th className="py-3 px-2">Advance Collected</th>
                  <th className="py-3 px-2">Balance Settled</th>
                  <th className="py-3 px-2">Outstanding</th>
                  <th className="py-3 px-2">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hotel-charcoal/5">
                {bookings.map((b) => {
                  const isFullySettled = b.balance_amount_paise === 0;
                  return (
                    <tr key={b.id} className="hover:bg-hotel-sand/30 transition-colors">
                      <td className="py-4 px-2 font-mono font-bold text-hotel-charcoal">
                        {b.booking_reference}
                      </td>
                      <td className="py-4 px-2">
                        <strong className="text-hotel-charcoal block">{b.guest?.full_name}</strong>
                        <span className="text-[10px] text-hotel-muted">{b.guest?.email}</span>
                      </td>
                      <td className="py-4 px-2">
                        Room {b.room?.room_number} ({b.room_type?.name})
                      </td>
                      <td className="py-4 px-2 font-medium text-hotel-charcoal">
                        {formatINR(b.total_amount_paise)}
                      </td>
                      <td className="py-4 px-2 text-hotel-cypress font-semibold">
                        {formatINR(b.advance_paid_paise)}
                      </td>
                      <td className="py-4 px-2 text-blue-700 font-semibold">
                        {formatINR(b.balance_paid_paise)}
                      </td>
                      <td className="py-4 px-2 font-bold text-hotel-charcoal">
                        {formatINR(b.balance_amount_paise)}
                      </td>
                      <td className="py-4 px-2">
                        {isFullySettled ? (
                          <span className="px-2.5 py-1 rounded-full bg-hotel-cypress/10 text-hotel-cypress font-semibold text-[10px] uppercase">
                            Fully Settled
                          </span>
                        ) : b.advance_paid_paise > 0 ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold text-[10px] uppercase">
                            30% Advance Secured
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-semibold text-[10px] uppercase">
                            Pending Advance
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
