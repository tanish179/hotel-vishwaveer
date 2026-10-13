'use client';

import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Download,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  FileText,
  Database,
} from 'lucide-react';

export default function AdminStoragePage() {
  const [metrics, setMetrics] = useState<{
    totalRecords: number;
    estimatedDatabaseBytes: number;
    estimatedDatabaseKb: string;
    bookingsCount: number;
    guestsCount: number;
    paymentsCount: number;
    roomsCount: number;
    auditLogsCount: number;
    expiredHoldCount: number;
    lastBackupTime: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState('');

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/cleanup');
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleCleanupExpiredHolds = async () => {
    if (
      !confirm(
        'Confirm safe cleanup of expired, unreserved temporary holds? Confirmed bookings and audit logs will NOT be affected.'
      )
    ) {
      return;
    }

    setCleanupLoading(true);
    setCleanupMessage('');
    try {
      const res = await fetch('/api/admin/cleanup', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCleanupMessage(data.message);
        loadMetrics();
      }
    } catch {
      alert('Cleanup failed');
    } finally {
      setCleanupLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-hotel-muted font-bold block mb-1">
            Data Governance & Resilience
          </span>
          <h1 className="font-serif text-3xl font-medium text-hotel-charcoal">
            Storage, Archival & Backup Health
          </h1>
        </div>

        <a
          href="/api/admin/export?format=json"
          download
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-hotel-cypress hover:bg-hotel-cypress-dark text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-subtle"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Full JSON Archive</span>
        </a>
      </div>

      {cleanupMessage && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>{cleanupMessage}</span>
        </div>
      )}

      {/* Storage Metrics 4-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="doppelrand-shell">
          <div className="doppelrand-core p-6 bg-white space-y-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-hotel-muted block">
              Estimated Database Footprint
            </span>
            <span className="font-serif text-3xl font-bold text-hotel-charcoal block">
              {metrics?.estimatedDatabaseKb || '0'} KB
            </span>
            <span className="text-[11px] text-hotel-muted">
              PostgreSQL relational payload
            </span>
          </div>
        </div>

        <div className="doppelrand-shell">
          <div className="doppelrand-core p-6 bg-white space-y-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-hotel-muted block">
              Total Database Records
            </span>
            <span className="font-serif text-3xl font-bold text-hotel-cypress block">
              {metrics?.totalRecords || 0}
            </span>
            <span className="text-[11px] text-hotel-muted">
              Bookings, transactions & logs
            </span>
          </div>
        </div>

        <div className="doppelrand-shell">
          <div className="doppelrand-core p-6 bg-white space-y-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-hotel-muted block">
              Expired Temporary Holds
            </span>
            <span className="font-serif text-3xl font-bold text-amber-700 block">
              {metrics?.expiredHoldCount || 0}
            </span>
            <span className="text-[11px] text-hotel-muted">
              Eligible for safe maintenance cleanup
            </span>
          </div>
        </div>

        <div className="doppelrand-shell">
          <div className="doppelrand-core p-6 bg-white space-y-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-hotel-muted block">
              Audit Logs Preserved
            </span>
            <span className="font-serif text-3xl font-bold text-blue-700 block">
              {metrics?.auditLogsCount || 0}
            </span>
            <span className="text-[11px] text-hotel-muted">
              Immutable operational trail
            </span>
          </div>
        </div>
      </div>

      {/* Controlled Maintenance & Retention Safeguards */}
      <div className="doppelrand-shell">
        <div className="doppelrand-core p-8 bg-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hotel-charcoal/10">
            <div>
              <h3 className="font-serif text-2xl font-medium text-hotel-charcoal">
                Controlled Hold Cleanup
              </h3>
              <p className="text-xs text-hotel-muted mt-1">
                Safely purges abandoned temporary holds where the 15-minute booking window expired without payment.
              </p>
            </div>

            <button
              onClick={handleCleanupExpiredHolds}
              disabled={cleanupLoading || (metrics?.expiredHoldCount || 0) === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs font-semibold uppercase tracking-wider hover:bg-amber-100 disabled:opacity-40 transition-colors shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{cleanupLoading ? 'Cleaning...' : 'Purge Expired Holds'}</span>
            </button>
          </div>

          {/* Retention Guard Callout */}
          <div className="p-4 rounded-xl bg-hotel-sand/50 border border-hotel-charcoal/10 flex items-start gap-3 text-xs text-hotel-muted">
            <ShieldCheck className="w-5 h-5 text-hotel-cypress shrink-0 mt-0.5" />
            <div>
              <strong className="text-hotel-charcoal block mb-0.5">
                Statutory Data Preservation Safeguard
              </strong>
              <span>
                As required by hospitality accounting standards, confirmed bookings, financial records, audit logs, and guest particulars are permanently preserved and cannot be deleted by hold cleanup routines.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Documented Backup & Restoration Guide */}
      <div className="doppelrand-shell">
        <div className="doppelrand-core p-8 bg-white space-y-6">
          <h3 className="font-serif text-2xl font-medium text-hotel-charcoal pb-4 border-b border-hotel-charcoal/10">
            Disaster Recovery & Restore Procedures
          </h3>

          <div className="space-y-4 text-xs text-hotel-charcoal leading-relaxed">
            <div className="p-4 rounded-xl bg-hotel-limestone space-y-2">
              <strong className="text-hotel-cypress block">1. Automated Database Snapshot</strong>
              <p className="text-hotel-muted">
                On hosted Supabase production instances, automated point-in-time recovery (PITR) runs continuously with daily physical backups. For local environments, use the export button above or run:
              </p>
              <code className="block p-2 bg-black/5 rounded text-[11px] font-mono text-hotel-charcoal">
                supabase db dump -f backup_$(date +%Y%m%d).sql
              </code>
            </div>

            <div className="p-4 rounded-xl bg-hotel-limestone space-y-2">
              <strong className="text-hotel-cypress block">2. Complete Restoration Verification</strong>
              <p className="text-hotel-muted">
                To restore from SQL dump into a staging or recovery instance:
              </p>
              <code className="block p-2 bg-black/5 rounded text-[11px] font-mono text-hotel-charcoal">
                psql &quot;$DATABASE_URL&quot; &lt; backup_20261013.sql
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
