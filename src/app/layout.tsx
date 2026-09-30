import React from 'react';
import type { Metadata } from 'next';
import AppInitializer from '../providers/AppInitializer';
import Navbar from '../components/Navbar';
import { Footer } from '../components/Footer';
import ClientModals from '../components/ClientModals';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import ToastContainer from '../components/ToastContainer';
import '../index.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://ermaymobilya.com'),
  title: 'ERMAY Mobilya | Doğrudan Fabrikadan Ofis Mobilyaları',
  description: 'Ermay Mobilya - Kendi üretim tesislerimizde standart seri olarak imal edilen dayanıklı makam takımları, toplantı masaları, ofis koltukları ve çalışma masaları. Aracısız doğrudan fabrika satışı, İstanbul içi kendi personelimizle teslimat & montaj.',
  keywords: 'ermay mobilya, ofis mobilyası, makam takımı, toplantı masası, çalışma masası, ofis koltukları, banko modelleri, doğrudan fabrikadan satış, toptan ofis mobilyası',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet" />
      </head>
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
