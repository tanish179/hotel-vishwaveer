'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { HotelSettings } from '@/lib/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<HotelSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await fetch('/api/hotel/settings');
        const data = await res.json();
        if (data.success) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setErrorMsg('');
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/hotel/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        setErrorMsg(data.error || 'Failed to save settings.');
      }
    } catch {
      setErrorMsg('Failed to update hotel configuration.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-12 text-hotel-muted">Loading settings...</div>;
  }

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-hotel-muted font-bold block mb-1">
            Global Property Configuration
          </span>
          <h1 className="font-serif text-3xl font-medium text-hotel-charcoal">
            Hotel Settings & Policies
          </h1>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>Settings Saved</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Brand & Identity */}
        <div className="doppelrand-shell">
          <div className="doppelrand-core p-8 bg-white space-y-6">
            <h3 className="font-serif text-2xl font-medium text-hotel-charcoal pb-4 border-b border-hotel-charcoal/10">
              Identity & Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="font-semibold text-hotel-charcoal block mb-1.5">
                  Hotel Name *
                </label>
                <input
                  type="text"
                  required
                  value={settings.hotel_name}
                  onChange={(e) =>
                    setSettings({ ...settings, hotel_name: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-hotel-charcoal block mb-1.5">
                  Estate Tagline
                </label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) =>
                    setSettings({ ...settings, tagline: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-hotel-charcoal block mb-1.5">
                  Physical Property Address *
                </label>
                <input
                  type="text"
                  required
                  value={settings.address}
                  onChange={(e) =>
                    setSettings({ ...settings, address: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-hotel-charcoal block mb-1.5">
                  Reception Telephone *
                </label>
                <input
                  type="text"
                  required
                  value={settings.phone}
                  onChange={(e) =>
                    setSettings({ ...settings, phone: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-hotel-charcoal block mb-1.5">
                  Reservations Email *
                </label>
                <input
                  type="email"
                  required
                  value={settings.email}
                  onChange={(e) =>
                    setSettings({ ...settings, email: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financial & Reservation Rules */}
        <div className="doppelrand-shell">
          <div className="doppelrand-core p-8 bg-white space-y-6">
            <h3 className="font-serif text-2xl font-medium text-hotel-charcoal pb-4 border-b border-hotel-charcoal/10">
              Booking Rules & Financial Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div>
                <label className="font-semibold text-hotel-charcoal block mb-1.5">
                  Advance Payment Percentage (%) *
                </label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  step={1}
                  required
                  value={settings.advance_payment_percent}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      advance_payment_percent: parseFloat(e.target.value),
                    })
                  }
                  className="w-full p-3 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none"
                />
                <span className="text-[10px] text-hotel-muted mt-1 block">
                  Mandated at 30% for standard boutique guest checkout.
                </span>
              </div>

              <div>
                <label className="font-semibold text-hotel-charcoal block mb-1.5">
                  Applicable GST Rate (%) *
                </label>
                <input
                  type="number"
                  min={0}
                  max={28}
                  step={0.5}
                  required
                  value={settings.gst_percent}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      gst_percent: parseFloat(e.target.value),
                    })
                  }
                  className="w-full p-3 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none"
                />
                <span className="text-[10px] text-hotel-muted mt-1 block">
                  Standard Indian hospitality tax rate (12% or 18%).
                </span>
              </div>

              <div>
                <label className="font-semibold text-hotel-charcoal block mb-1.5">
                  Room Hold Expiration (Minutes)
                </label>
                <input
                  type="number"
                  min={5}
                  max={60}
                  required
                  value={settings.hold_duration_minutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      hold_duration_minutes: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full p-3 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-hotel-charcoal block mb-1.5">
                  Standard Check-In Time
                </label>
                <input
                  type="text"
                  value={settings.check_in_time}
                  onChange={(e) =>
                    setSettings({ ...settings, check_in_time: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-hotel-charcoal block mb-1.5">
                  Standard Check-Out Time
                </label>
                <input
                  type="text"
                  value={settings.check_out_time}
                  onChange={(e) =>
                    setSettings({ ...settings, check_out_time: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-hotel-charcoal block mb-1.5">
                  Razorpay Public Key ID
                </label>
                <input
                  type="text"
                  value={settings.razorpay_key_id}
                  onChange={(e) =>
                    setSettings({ ...settings, razorpay_key_id: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="pt-4">
              <label className="font-semibold text-hotel-charcoal text-xs block mb-1.5">
                Cancellation & Refund Terms *
              </label>
              <textarea
                rows={3}
                required
                value={settings.cancellation_policy}
                onChange={(e) =>
                  setSettings({ ...settings, cancellation_policy: e.target.value })
                }
                className="w-full text-xs p-3.5 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-hotel-cypress hover:bg-hotel-cypress-dark text-white text-xs uppercase tracking-wider font-semibold transition-all shadow-subtle active:scale-[0.98] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Persisting Configuration...' : 'Save Hotel Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
