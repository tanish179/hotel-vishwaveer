# Hotel Vishwaveer — Premium Hotel Booking Platform

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Secure_HMAC-02042B?style=flat&logo=razorpay)](https://razorpay.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=flat&logo=postgresql)](https://supabase.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-15%2F15_Passing-brightgreen?style=flat)](https://vitest.dev/)

An art-directed, production-grade direct hotel reservation platform built for **Hotel Vishwaveer** (Kolhapur, Maharashtra). Engineered to the visual standard of a custom ₹50,000 boutique hospitality digital experience, combining architectural basalt aesthetics with a concurrency-safe reservation engine, server-authoritative 30% advance pricing, official Razorpay integration, and a complete hotel management console.

---

## 1. Visual & Creative Direction

Designed according to bespoke editorial boutique-hospitality principles (anti-AI template discipline):

- **Architectural Palette:**
  - Background: Warm Limestone (`#FAF8F5`) & Sand (`#F4EFEA`)
  - Typography: Deep Mineral Charcoal (`#141518`)
  - Property Accent: Cypress Forest Green (`#233726`)
  - Detailing: Antique Muted Brass (`#B38E5D`)
- **Typography:** Pairing of Cormorant Garamond / Playfair serif for headlines with high-legibility Plus Jakarta Sans for interface controls.
- **Micro-Architecture:** *Doppelrand* (Double-Bezel nested enclosures) for cards, dialogs, and inputs, featuring tactile pill buttons with button-in-button trailing icons.
- **Motion Engineering:** GSAP entrance timelines with strict `prefers-reduced-motion` safety; GPU-accelerated transforms and zero layout shifts.

---

## 2. Core Features & Capabilities

### Public Website
- **Cinematic Homepage:** Staggered headline entrance, real-time live availability search engine, architectural estate narrative, *The Courtyard Dining* experience, curated amenities bento, location details, and comprehensive house policies.
- **Inventory & Rooms Listing (`/rooms`):** Real-time physical room availability, capacity filtering, live rate calculations, and sold-out date indicators.
- **Suite Details (`/rooms/[slug]`):** Photo gallery, architectural specs, bed type, view orientation, live date price breakdown, and instant reservation CTA.
- **Guest Multistep Booking Flow (`/book`):**
  - **No Mandatory Registration:** Guest checkout requiring only primary contact details.
  - **Authoritative Server Pricing:** Integer paise arithmetic calculating nights, base tariff, 12% GST, mandatory 30% advance deposit, and remaining 70% balance due at hotel check-in.
  - **Atomic 15-Minute Room Hold:** Locks the physical room row to prevent concurrent race conditions.
  - **Razorpay Checkout Modal:** Integrated payment gateway popup with test mode support.
  - **Cryptographic Verification:** Server-side HMAC-SHA256 signature verification and tamper detection.
  - **Confirmation Voucher:** Booking reference (e.g. `VWV-2026-XXXX`), printable receipt, and payment audit summary.
- **Guest Reservation Lookup (`/lookup`):** Privacy-protected lookup requiring matching booking reference AND contact phone/email. Allows guests to view folios and request cancellations according to hotel policy.

### Hotel Admin Dashboard (`/admin`)
- **Overview Dashboard:** Live KPI matrix showing today's arrivals, today's departures, occupancy percentage, available rooms, gross booking revenue, 30% advance collected, and outstanding balances due at reception.
- **Physical Room Inventory (`/admin/rooms`):** Full control over individual physical rooms (101, 102, 201, 202, 301, 302, Villa 1, Villa 2), live operational status toggles (*Available, Cleaning, Maintenance, Blocked*), and scheduled maintenance date blocks.
- **Reservation Dossier (`/admin/reservations`):** Searchable booking tables, detail drawer, check-in, check-out, front-desk walk-in guest creator, and recording of offline payments (Cash, POS Card Terminal, UPI QR).
- **Financial Management & Ledger (`/admin/finance`):** Complete financial ledger distinguishing gross booked value, online advances, collected balances, and outstanding accounts receivable. One-click CSV export.
- **Hotel Settings (`/admin/settings`):** Configurable hotel address, phone, email, GST tax %, 30% advance %, check-in/out timings, and cancellation terms.
- **Storage, Archival & Data Management (`/admin/storage`):** Storage footprint metrics, full JSON archive download, documented disaster recovery restore guide, and safe hold cleaner that purges stale unreserved holds while permanently preserving confirmed bookings and audit logs.

---

## 3. Technology Stack

- **Framework:** Next.js 14 (App Router, React 18, TypeScript)
- **Styling:** Tailwind CSS + PostCSS with custom architectural tokens
- **Animations:** GSAP 3 + ScrollTrigger with reduced-motion fallbacks
- **Database:** PostgreSQL (Supabase schema with row-level locks and RLS)
- **Payment Gateway:** Razorpay Node SDK + HMAC-SHA256 cryptographic verification
- **Testing:** Vitest with 15 passing automated test suites
- **Deployment:** Netlify (`netlify.toml` included) & hosted Supabase

---

## 4. Local Development Quickstart

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm or pnpm

### 1. Clone & Install Dependencies
```bash
cd "Hotel vishwaveer in "
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Default local credentials:
- **Admin Password:** `admin@vishwaveer2026`
- **Razorpay Key:** Pre-configured in test mode (`rzp_test_51MockVishwa99`)

### 3. Run Automated Tests
```bash
npm test
```
*Executes all 15 tests verifying integer paise arithmetic, concurrency double-booking locks, hold expirations, Razorpay HMAC signatures, and guest lookup privacy.*

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Guest Website:** [http://localhost:3000](http://localhost:3000)
- **Suites Listing:** [http://localhost:3000/rooms](http://localhost:3000/rooms)
- **Guest Checkout:** [http://localhost:3000/book](http://localhost:3000/book)
- **Booking Lookup:** [http://localhost:3000/lookup](http://localhost:3000/lookup)
- **Admin Console:** [http://localhost:3000/admin](http://localhost:3000/admin) (Pass: `admin@vishwaveer2026`)

---

## 5. Database Schema & Supabase Setup

The relational PostgreSQL migration and seed data are pre-written in:
- Migration: `supabase/migrations/20261013000001_initial_schema.sql`
- Seed Data: `supabase/seed.sql`

### Entities
1. `hotel_settings` — Hotel contact details, GST %, advance %, timings, policies.
2. `room_types` — Room categories, descriptions, base prices, amenities, photos.
3. `rooms` — Physical individual rooms (e.g. 101, 102, 201) with status and floor.
4. `room_images` — Categorized gallery images with display order.
5. `room_blocks` — Maintenance and cleaning date blocks.
6. `guests` — Guest particulars for guest checkout.
7. `bookings` — Authoritative reservation records with dates, nights, paise amounts, and status.
8. `payment_orders` — Razorpay orders matched to bookings.
9. `payment_transactions` — Cryptographically verified gateway & offline receipts.
10. `audit_logs` — Immutable audit trail of administrative changes.

### Running Local Supabase (Optional)
If you have Docker and the Supabase CLI installed:
```bash
npx supabase start
npx supabase db reset
```

---

## 6. Switching from Razorpay Test Mode to Live Production

1. Complete merchant KYC on [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Generate Live API Keys (**Key ID** and **Key Secret**) from *Settings → API Keys*.
3. Generate a **Webhook Secret** from *Settings → Webhooks* and configure your production endpoint:
   ```
   https://hotelvishwaveer.in/api/payment/webhook
   ```
   *Subscribe to events:* `payment.captured`, `order.paid`, `payment.failed`.
4. Update production environment variables:
   ```env
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YourLiveKeyId
   RAZORPAY_KEY_SECRET=YourLiveKeySecret
   RAZORPAY_WEBHOOK_SECRET=YourLiveWebhookSecret
   ```
5. Perform a ₹1.00 live verification transaction before opening inventory to public traffic.

---

## 7. Netlify Production Deployment Checklist

1. **Repository Setup:** Push the project repository to GitHub / GitLab.
2. **Import to Netlify:** In Netlify Dashboard, select *Add new site → Import an existing project*.
3. **Build Settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - Netlify will automatically detect `netlify.toml` and configure the Next.js runtime plugin (`@netlify/plugin-nextjs`).
4. **Environment Variables:** In Netlify *Site configuration → Environment variables*, set:
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `RAZORPAY_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
5. **Custom Domain & SSL:** Configure `hotelvishwaveer.in` and enable automatic Netlify Let's Encrypt SSL.
6. **Deploy:** Click **Deploy site**.

---

## 8. Concurrency & Double-Booking Prevention

Double-booking is prevented through four systemic guardrails:
1. **Physical Unit Allocation:** Bookings are made against specific, persistent physical rooms rather than generic pooled quotas.
2. **Exclusive Checkout Dates:** A check-out date is treated as exclusive (`booking.check_in < p_check_out AND booking.check_out > p_check_in`), allowing back-to-back stays without gaps.
3. **Row-Level Locking:** During hold placement, database rows are locked (`SELECT FOR UPDATE`), serializing concurrent booking attempts for identical rooms and dates.
4. **Authoritative 15-Minute Expiry:** Temporary holds automatically expire after 15 minutes if payment is abandoned, releasing inventory back to the pool. Confirmed bookings are never deleted.

---

## 9. License & Attribution

Designed and developed for Hotel Vishwaveer. Temporary imagery provided via licensed Unsplash architectural collections for preview demonstration purposes.
