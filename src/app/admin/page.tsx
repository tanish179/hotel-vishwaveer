'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  CalendarCheck,
  TrendingUp,
  CreditCard,
  BedDouble,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Plus,
} from 'lucide-react';
import { formatINR } from '@/lib/pricing';
import { Booking } from '@/lib/types';

interface StatsState {
  todayArrivals: number;
  todayDepartures: number;
  occupiedRooms: number;
  availableRooms: number;
  totalRooms: number;
  occupancyRate: number;
  grossBookedPaise: number;
  advanceCollectedPaise: number;
  balanceCollectedPaise: number;
  totalCollectedPaise: number;
  outstandingBalancePaise: number;
  activeBookingsCount: number;
  recentBookings: Booking[];
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<StatsState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 md:p-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="h-32 bg-gray-200 rounded-2xl" />
            <div className="h-32 bg-gray-200 rounded-2xl" />
            <div className="h-32 bg-gray-200 rounded-2xl" />
            <div className="h-32 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-hotel-muted font-bold block mb-1">
            Operational Intelligence
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-hotel-charcoal">
            Estate Overview & Occupancy
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/admin/export?format=csv"
            download
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-hotel-charcoal/20 bg-white text-xs font-semibold uppercase tracking-wider text-hotel-charcoal hover:bg-hotel-limestone transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>

          <Link
            href="/admin/reservations?action=new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-hotel-cypress hover:bg-hotel-cypress-dark text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-subtle"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Walk-In</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Occupancy */}
        <div className="doppelrand-shell">
          <div className="doppelrand-core p-6 bg-white flex flex-col justify-between">
            <div className="flex items-center justify-between text-hotel-muted mb-4">
              <span className="text-xs uppercase tracking-wider font-semibold">
                Occupancy Rate
              </span>
              <BedDouble className="w-4 h-4 text-hotel-cypress" />
            </div>
            <div>
              <span className="font-serif text-4xl font-bold text-hotel-charcoal block">
                {stats?.occupancyRate || 0}%
              </span>
              <span className="text-xs text-hotel-muted mt-1 block">
                {stats?.occupiedRooms || 0} of {stats?.totalRooms || 10} Physical Rooms Occupied
              </span>
            </div>
          </div>
        </div>

        {/* Arrivals & Departures */}
        <div className="doppelrand-shell">
          <div className="doppelrand-core p-6 bg-white flex flex-col justify-between">
            <div className="flex items-center justify-between text-hotel-muted mb-4">
              <span className="text-xs uppercase tracking-wider font-semibold">
                Today&apos;s Movements
              </span>
              <Clock className="w-4 h-4 text-hotel-cypress" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-4xl font-bold text-hotel-charcoal">
                  {stats?.todayArrivals || 0}
                </span>
                <span className="text-xs text-hotel-muted font-medium">Arrivals</span>
                <span className="text-hotel-muted">·</span>
                <span className="font-serif text-2xl font-semibold text-hotel-charcoal">
                  {stats?.todayDepartures || 0}
                </span>
                <span className="text-xs text-hotel-muted font-medium">Departures</span>
              </div>
              <span className="text-xs text-hotel-muted mt-1 block">
                Available: {stats?.availableRooms || 0} rooms
              </span>
            </div>
          </div>
        </div>

        {/* Advances Collected */}
        <div className="doppelrand-shell">
          <div className="doppelrand-core p-6 bg-white flex flex-col justify-between">
            <div className="flex items-center justify-between text-hotel-muted mb-4">
              <span className="text-xs uppercase tracking-wider font-semibold">
                Advances Collected
              </span>
              <CreditCard className="w-4 h-4 text-hotel-cypress" />
            </div>
            <div>
              <span className="font-serif text-3xl font-bold text-hotel-cypress block">
                {formatINR(stats?.advanceCollectedPaise || 0)}
              </span>
              <span className="text-xs text-hotel-muted mt-1 block">
                30% direct online deposits verified
              </span>
            </div>
          </div>
        </div>

        {/* Outstanding Balances */}
        <div className="doppelrand-shell">
          <div className="doppelrand-core p-6 bg-white flex flex-col justify-between">
            <div className="flex items-center justify-between text-hotel-muted mb-4">
              <span className="text-xs uppercase tracking-wider font-semibold">
                Outstanding Balance Due
              </span>
              <TrendingUp className="w-4 h-4 text-hotel-brass" />
            </div>
            <div>
              <span className="font-serif text-3xl font-bold text-hotel-charcoal block">
                {formatINR(stats?.outstandingBalancePaise || 0)}
              </span>
              <span className="text-xs text-hotel-muted mt-1 block">
                Payable at desk check-in
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown Ribbon */}
      <div className="p-6 rounded-2xl bg-white border border-hotel-charcoal/10 shadow-subtle flex flex-wrap items-center justify-between gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-hotel-muted font-bold block mb-1">
            Gross Booked Tariff (Confirmed & In-House)
          </span>
          <span className="font-serif text-2xl font-bold text-hotel-charcoal">
            {formatINR(stats?.grossBookedPaise || 0)}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-wider text-hotel-muted font-bold block mb-1">
            Total Revenue Collected (Advance + Balance)
          </span>
          <span className="font-serif text-2xl font-bold text-hotel-cypress">
            {formatINR(stats?.totalCollectedPaise || 0)}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-wider text-hotel-muted font-bold block mb-1">
            Active Confirmed Stays
          </span>
          <span className="font-serif text-2xl font-bold text-hotel-charcoal">
            {stats?.activeBookingsCount || 0}
          </span>
        </div>

        <Link
          href="/admin/finance"
          className="text-xs font-semibold uppercase tracking-wider text-hotel-cypress hover:underline flex items-center gap-1"
        >
          <span>View Full Ledger</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Recent Reservations Table */}
      <div className="doppelrand-shell">
        <div className="doppelrand-core p-6 md:p-8 bg-white space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-2xl font-medium text-hotel-charcoal">
                Recent Guest Reservations
              </h3>
              <p className="text-xs text-hotel-muted mt-1">
                Live bookings recorded via website & direct front-desk
              </p>
            </div>
            <Link
              href="/admin/reservations"
              className="text-xs uppercase tracking-wider font-semibold text-hotel-cypress hover:text-hotel-cypress-dark"
            >
              View All ({stats?.recentBookings.length || 0})
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hotel-charcoal/10 text-hotel-muted uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-2">Ref</th>
                  <th className="py-3 px-2">Guest</th>
                  <th className="py-3 px-2">Suite / Room</th>
                  <th className="py-3 px-2">Stay Dates</th>
                  <th className="py-3 px-2">Total Tariff</th>
                  <th className="py-3 px-2">30% Advance</th>
                  <th className="py-3 px-2">Balance Due</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hotel-charcoal/5">
                {(stats?.recentBookings || []).map((b) => (
                  <tr key={b.id} className="hover:bg-hotel-sand/30 transition-colors">
                    <td className="py-4 px-2 font-mono font-bold text-hotel-charcoal">
                      {b.booking_reference}
                    </td>
                    <td className="py-4 px-2">
                      <strong className="text-hotel-charcoal block">{b.guest?.full_name}</strong>
                      <span className="text-[10px] text-hotel-muted">{b.guest?.phone}</span>
                    </td>
                    <td className="py-4 px-2">
                      <span className="font-medium text-hotel-charcoal block">
                        Room {b.room?.room_number || 'TBD'}
                      </span>
                      <span className="text-[10px] text-hotel-muted">{b.room_type?.name}</span>
                    </td>
                    <td className="py-4 px-2">
                      <span>
                        {b.check_in} → {b.check_out}
                      </span>
                      <span className="text-[10px] text-hotel-muted block">
                        ({b.nights} {b.nights === 1 ? 'night' : 'nights'})
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
                          Completed
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
                      <Link
                        href={`/admin/reservations?id=${b.id}`}
                        className="text-xs font-semibold uppercase text-hotel-cypress hover:underline"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
