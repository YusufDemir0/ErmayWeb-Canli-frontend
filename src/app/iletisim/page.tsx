import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, Mail, MapPin, Printer } from 'lucide-react';
import ContactFormClient from './ContactFormClient';

export const revalidate = 60; // ISR

export const metadata: Metadata = {
  title: 'İletişim & Fabrikadan Satış Talebi | Ermay Mobilya Modoko',
  description: 'Ermay Mobilya Modoko showroom ve atölye iletişim bilgileri. Özel imalat talepleri, kurumsal projeler ve bayilik için bize ulaşın: 0532 419 41 51.',
  keywords: 'ermay mobilya iletişim, modoko mobilya telefon, mobilya sipariş iletişim, özel imalat mobilya teklif',
  openGraph: {
    title: 'İletişim & Ulaşım | Ermay Mobilya',
    description: 'Modoko merkez mağazamız ve atölyemiz ile doğrudan iletişime geçin.',
    url: 'https://ermaymobilya.com/iletisim',
    siteName: 'Ermay Mobilya',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200',
        width: 1200,
        height: 800,
        alt: 'Ermay Mobilya İletişim',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://ermaymobilya.com/iletisim',
  },
};

export default function IletisimPage() {
  const contactInfo = {
    phone: '0532 419 41 51',
    fax: '+90 (216) 555 42 42',
    email: 'info@ermaymobilya.com',
    address: 'Modoko Mobilyacılar Sitesi 1. Cadde No: 42, Ümraniye / İstanbul',
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Ermay Mobilya İletişim',
    url: 'https://ermaymobilya.com/iletisim',
    mainEntity: {
      '@type': 'FurnitureStore',
      name: 'Ermay Mobilya',
      telephone: '+905324194151',
      email: 'info@ermaymobilya.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Modoko Mobilyacılar Sitesi 1. Cadde No: 42',
        addressLocality: 'Ümraniye',
        addressRegion: 'İstanbul',
        postalCode: '34775',
        addressCountry: 'TR',
      },
    },
  };

  return (
    <div className="w-full bg-neutral-50 min-h-screen py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="text-xs text-neutral-400 font-light flex items-center gap-2 mb-8">
          <Link href="/" className="hover:text-[#C5A880] transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-neutral-600 font-normal">İletişim</span>
        </nav>

        {/* Light Hero Header */}
        <div className="bg-white text-neutral-900 rounded-sm p-8 md:p-12 mb-12 border border-neutral-200 shadow-sm text-center">
          <h1 className="text-3xl md:text-5xl font-light tracking-widest uppercase mb-2 text-neutral-900">
            İLETİŞİM
          </h1>
          <p className="text-xs text-neutral-500 font-light tracking-wider">
            Anasayfa ■ İletişim
          </p>
        </div>

        {/* Main 2-Column Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Left Column: Form Client Component */}
          <div className="lg:col-span-7">
            <ContactFormClient />
          </div>

          {/* Right Column: Clean White Contact Cards */}
          <div className="lg:col-span-5 space-y-4">
            {/* Telefon Card */}
            <div className="bg-white text-neutral-800 p-5 rounded-sm border border-neutral-200 flex items-start gap-4 shadow-xs">
              <div className="p-3 bg-[#C5A880]/10 border border-[#C5A880]/30 rounded-sm text-[#C5A880] flex-shrink-0">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Telefon</h3>
                <p className="text-sm font-semibold text-neutral-900 mt-1">{contactInfo.phone}</p>
              </div>
            </div>

            {/* Fax Card */}
            <div className="bg-white text-neutral-800 p-5 rounded-sm border border-neutral-200 flex items-start gap-4 shadow-xs">
              <div className="p-3 bg-[#C5A880]/10 border border-[#C5A880]/30 rounded-sm text-[#C5A880] flex-shrink-0">
                <Printer className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Fax</h3>
                <p className="text-sm font-semibold text-neutral-900 mt-1">{contactInfo.fax}</p>
              </div>
            </div>

            {/* E-Posta Card */}
            <div className="bg-white text-neutral-800 p-5 rounded-sm border border-neutral-200 flex items-start gap-4 shadow-xs">
              <div className="p-3 bg-[#C5A880]/10 border border-[#C5A880]/30 rounded-sm text-[#C5A880] flex-shrink-0">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">E-Posta</h3>
                <p className="text-sm font-semibold text-neutral-900 mt-1">{contactInfo.email}</p>
              </div>
            </div>

            {/* Adres Card */}
            <div className="bg-white text-neutral-800 p-5 rounded-sm border border-neutral-200 flex items-start gap-4 shadow-xs">
              <div className="p-3 bg-[#C5A880]/10 border border-[#C5A880]/30 rounded-sm text-[#C5A880] flex-shrink-0">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Adres</h3>
                <p className="text-xs font-light text-neutral-700 mt-1 leading-relaxed">{contactInfo.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
