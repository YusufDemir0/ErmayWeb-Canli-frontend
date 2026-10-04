import React from 'react';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import AppInitializer from '../providers/AppInitializer';
import Navbar from '../components/Navbar';
import { Footer } from '../components/Footer';
import ClientModals from '../components/ClientModals';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import ToastContainer from '../components/ToastContainer';
import '../index.css';

// Fontlar build anında indirilip kendi sunucumuzdan servis edilir: render'ı bloklayan harici CSS yok,
// ziyaretçi IP'si Google'a gitmez (KVKK) ve layout kayması (CLS) önlenir.
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ermaymobilya.com'),
  title: 'ERMAY Mobilya | Doğrudan Fabrikadan Ofis Mobilyaları',
  description: 'Ermay Mobilya - Kendi üretim tesislerimizde standart seri olarak imal edilen dayanıklı makam takımları, toplantı masaları, ofis koltukları ve çalışma masaları. Aracısız doğrudan fabrika satışı, İstanbul içi kendi personelimizle teslimat & montaj.',
  keywords: 'ermay mobilya, ofis mobilyası, makam takımı, toplantı masası, çalışma masası, ofis koltukları, banko modelleri, doğrudan fabrikadan satış, toptan ofis mobilyası',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans flex flex-col min-h-screen bg-white text-neutral-800 antialiased selection:bg-[#C5A880] selection:text-white">
        <AppInitializer>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ClientModals />
          <FloatingWhatsApp />
          <ToastContainer />
        </AppInitializer>
      </body>
    </html>
  );
}
