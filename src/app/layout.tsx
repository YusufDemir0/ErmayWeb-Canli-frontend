import React from 'react';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import AppInitializer from '../providers/AppInitializer';
import Navbar from '../components/Navbar';
import { Footer } from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import FavoritesDrawer from '../components/FavoritesDrawer';
import ProductQuickView from '../components/ProductQuickView';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import '../index.css';

// Optimize Inter (Modern Sans for UI & body)
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Optimize Playfair Display (Italian Editorial Serif for Headlines & Brand Identity)
const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'ERMAY Mobilya | Modoko Masif Ahşap & Atölye İmalatı',
  description: 'Ermay Mobilya - Modoko atölyelerimizde 40 yıllık ustalıkla imal edilen masif ahşap koltuk takımları, yemek odaları, makam takımları ve TV üniteleri. Kendi aracımızla adrese teslim ve montaj.',
  keywords: 'ermay mobilya, masif ahşap, modoko mobilya, koltuk takımı, yemek odası, makam takımı, ahşap atölyesi, istanbul mobilya teslimat',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${inter.variable} ${playfair.variable}`}>
      <body className={`${inter.className} font-sans flex flex-col min-h-screen bg-white text-neutral-800 antialiased selection:bg-[#C5A880] selection:text-white`}>
        <AppInitializer>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <FavoritesDrawer />
          <ProductQuickView />
          <FloatingWhatsApp />
        </AppInitializer>
      </body>
    </html>
  );
}
