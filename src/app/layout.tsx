import type { Metadata } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const editorialSerif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-editorial',
  display: 'swap',
});

const modernSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Hotel Vishwaveer | Luxury Boutique Estate & Suites',
  description:
    'Experience quiet Deccan luxury, restored stone architecture, artisan dining, and bespoke private suites in the historic heart of Kolhapur, Maharashtra.',
  keywords: [
    'Hotel Vishwaveer',
    'Luxury Hotel Kolhapur',
    'Boutique Resort Maharashtra',
    'Heritage Suites India',
    'Direct Hotel Booking',
  ],
  openGraph: {
    title: 'Hotel Vishwaveer | Sanctuary of Refined Heritage',
    description:
      'Direct reservations with guaranteed lowest rates, 30% advance booking, and authentic hospitality.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${editorialSerif.variable} ${modernSans.variable}`}>
      <body className="min-h-screen bg-hotel-limestone text-hotel-charcoal antialiased selection:bg-hotel-cypress selection:text-white">
        <div className="grain-overlay" aria-hidden="true" />
        {children}
        {/* Official Razorpay Checkout Script */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
