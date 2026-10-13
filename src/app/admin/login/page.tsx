'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/admin');
      } else {
        setErrorMessage(data.error || 'Authentication failed. Check your password.');
      }
    } catch {
      setErrorMessage('Could not connect to the authentication service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hotel-limestone flex flex-col justify-center items-center px-6">
      <div className="w-full max-w-md doppelrand-shell">
        <div className="doppelrand-core p-8 md:p-10 bg-white space-y-8">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-hotel-cypress text-white flex items-center justify-center font-serif text-2xl font-bold mx-auto mb-4">
              V
            </div>
            <h1 className="font-serif text-3xl font-medium text-hotel-charcoal">
              Staff Portal Access
            </h1>
            <p className="text-xs text-hotel-muted mt-2">
              Hotel Vishwaveer Management Console
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-hotel-charcoal block mb-1.5">
                Administrator Passcode
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator passcode"
                  className="w-full text-sm p-3.5 pl-10 rounded-xl border border-hotel-charcoal/20 bg-hotel-limestone focus:outline-none focus:border-hotel-cypress"
                />
                <Lock className="w-4 h-4 text-hotel-muted absolute left-3.5 top-3.5" />
              </div>
              <span className="text-[10px] text-hotel-muted mt-1.5 block">
                Default local pass: <code className="bg-hotel-sand px-1 py-0.5 rounded font-mono">admin@vishwaveer2026</code>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-hotel-cypress hover:bg-hotel-cypress-dark text-white rounded-xl text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Authorize Session'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-hotel-charcoal/10 text-center">
            <span className="text-[11px] text-hotel-muted flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-hotel-cypress" />
              Protected internal operations console
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
