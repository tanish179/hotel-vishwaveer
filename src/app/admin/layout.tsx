'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  BedDouble,
  CircleDollarSign,
  Settings,
  HardDrive,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // If on login page, render clean full-width layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Reservations', href: '/admin/reservations', icon: CalendarCheck },
    { label: 'Room Inventory', href: '/admin/rooms', icon: BedDouble },
    { label: 'Finance & Ledger', href: '/admin/finance', icon: CircleDollarSign },
    { label: 'Hotel Settings', href: '/admin/settings', icon: Settings },
    { label: 'Storage & Backup', href: '/admin/storage', icon: HardDrive },
  ];

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col md:flex-row text-hotel-charcoal font-sans">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-hotel-cypress text-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-serif font-bold">
            V
          </div>
          <span className="font-serif font-medium text-lg">Vishwaveer Admin</span>
        </div>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-1.5 rounded-lg bg-white/10"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`w-64 bg-hotel-cypress text-white flex flex-col justify-between p-6 shrink-0 z-30 transition-all ${
          mobileNavOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        <div>
          {/* Brand & Badge */}
          <div className="flex items-center gap-3 pb-6 border-b border-white/10 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-serif font-bold text-xl text-hotel-brass">
              V
            </div>
            <div>
              <span className="font-serif text-lg font-medium tracking-tight block">
                Hotel Vishwaveer
              </span>
              <span className="text-[10px] uppercase tracking-widest text-white/60 font-mono">
                Admin Console
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wider transition-colors ${
                    isActive
                      ? 'bg-white/15 text-white shadow-inner'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 text-hotel-brass" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer controls */}
        <div className="pt-6 border-t border-white/10 space-y-3 text-xs">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-white/60 hover:text-white px-2 py-1.5 transition-colors"
          >
            <span>Live Guest Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 text-white/60 hover:text-red-300 px-2 py-1.5 transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>End Session</span>
          </button>

          <div className="pt-2 text-[10px] text-white/40 font-mono">
            Staff Role: Duty Manager
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
