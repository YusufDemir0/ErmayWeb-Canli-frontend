import React from 'react';
import type { Metadata } from 'next';
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import AppInitializer from '../providers/AppInitializer';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';
import { Footer } from '../components/Footer';
import ClientModals from '../components/ClientModals';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import ToastContainer from '../components/ToastContainer';
import '../index.css';

// Fontlar build anında indirilip kendi sunucumuzdan servis edilir: render'ı bloklayan harici CSS yok,
// ziyaretçi IP'si Google'a gitmez (KVKK) ve layout kayması (CLS) önlenir.
// Gövde: IBM Plex Sans (teknik, Türkçe glifleri tam). Ölçü/kod/fiyat: IBM Plex Mono. Başlık: Archivo.
const plexSans = IBM_Plex_Sans({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-plex-sans',
  weight: ['400', '500', '600', '700'],
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-plex-mono',
  weight: ['400', '500', '600'],
});

const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-archivo',
  weight: ['500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ermaymobilya.com'),
  title: 'Ermay Mobilya | Fabrikadan Ofis Mobilyaları',
  description: 'Ermay Mobilya - Kendi üretim tesislerimizde standart seri olarak imal edilen dayanıklı makam takımları, toplantı masaları, ofis koltukları ve çalışma masaları. Aracısız doğrudan fabrika satışı, İstanbul içi kendi personelimizle teslimat & montaj.',
  keywords: 'ermay mobilya, ofis mobilyası, makam takımı, toplantı masası, çalışma masası, ofis koltukları, banko modelleri, doğrudan fabrikadan satış, toptan ofis mobilyası',
  icons: {
    icon: [{ url: '/brand/favicon-64.png', type: 'image/png', sizes: '64x64' }],
    shortcut: '/brand/favicon-64.png',
    apple: '/brand/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${plexSans.variable} ${plexMono.variable} ${archivo.variable}`}>
      <body className="font-sans flex flex-col min-h-screen bg-white text-ink antialiased">
        <AppInitializer>
          <Navbar />
          <BackButton />
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
