import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import ContactFormClient from './ContactFormClient';
import apiClient from '../../services/api';


interface CmsContact {
  phone?: string;
  phoneSecondary?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  workingHours?: string;
}

const FALLBACK_CONTACT: Required<Pick<CmsContact, 'phone' | 'email' | 'address'>> = {
  phone: '0532 419 41 51',
  email: 'info@ermaymobilya.com',
  address: 'Modoko Mobilyacılar Sitesi 1. Cadde No: 42, Ümraniye / İstanbul',
};

async function getContactInfo(): Promise<CmsContact> {
  try {
    const res = await apiClient.get('/cms/contact_info');
    return (res.data?.content as CmsContact) || {};
  } catch {
    return {};
  }
}

/** "0532 419 41 51" / "905324194151" -> "+905324194151" (tel: ve schema.org için) */
function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('90')) return `+${digits}`;
  return `+90${digits.replace(/^0/, '')}`;
}

export const revalidate = 60; // ISR

export const metadata: Metadata = {
  title: 'İletişim | Ermay Mobilya',
  description: 'Ermay Mobilya Modoko showroom ve atölye iletişim bilgileri. Özel imalat talepleri, kurumsal projeler ve bayilik için bize ulaşın: 0532 419 41 51.',
  keywords: 'ermay mobilya iletişim, modoko mobilya telefon, mobilya sipariş iletişim, özel imalat mobilya teklif',
  openGraph: {
    title: 'İletişim | Ermay Mobilya',
    description: 'Modoko merkez mağazamız ve atölyemiz ile doğrudan iletişime geçin.',
    url: 'https://ermaymobilya.com/iletisim',
    siteName: 'Ermay Mobilya',
    images: [
      {
        url: '/default-furniture.webp',
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

export default async function IletisimPage() {
  // Sabit kodlu bilgiler admin panelindeki "İletişim Bilgileri" değişikliklerini yok sayıyordu
  const cms = await getContactInfo();
  const contactInfo = {
    phones: [cms.phone, cms.phoneSecondary].filter((p): p is string => Boolean(p && p.trim())),
    email: cms.email || FALLBACK_CONTACT.email,
    address: cms.address || FALLBACK_CONTACT.address,
    workingHours: cms.workingHours || '',
  };
  if (contactInfo.phones.length === 0) contactInfo.phones.push(FALLBACK_CONTACT.phone);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Ermay Mobilya İletişim',
    url: 'https://ermaymobilya.com/iletisim',
    mainEntity: {
      '@type': 'FurnitureStore',
      name: 'Ermay Mobilya',
      telephone: toE164(contactInfo.phones[0]),
      email: contactInfo.email,
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
    <div className="w-full bg-canvas min-h-screen py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="text-xs text-neutral-500 flex items-center gap-2 mb-8">
          <Link href="/" className="hover:text-wood transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-neutral-600 font-normal">İletişim</span>
        </nav>

        {/* Light Hero Header */}
        <div className="bg-paper text-ink rounded-xs p-8 md:p-12 mb-12 border border-line border-t-4 border-t-brand text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-2 text-ink">
            İletişim
          </h1>
          <p className="text-sm text-neutral-600">
            Fabrika satış, toplu alım ve showroom ziyaretleriniz için bize ulaşın
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
            <div className="bg-white text-neutral-800 p-5 rounded-xs border border-line flex items-start gap-4">
              <div className="p-3 bg-wood/10 border border-wood/30 rounded-xs text-wood flex-shrink-0">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-500">Telefon</h3>
                {contactInfo.phones.map((phone) => (
                  <a key={phone} href={`tel:${toE164(phone)}`} className="block text-sm font-semibold text-neutral-900 mt-1 hover:text-wood">
                    {phone}
                  </a>
                ))}
              </div>
            </div>

            {/* Çalışma Saatleri (yer tutucu faks numarasının yerine, CMS'ten) */}
            {contactInfo.workingHours && (
              <div className="bg-white text-neutral-800 p-5 rounded-xs border border-line flex items-start gap-4">
                <div className="p-3 bg-wood/10 border border-wood/30 rounded-xs text-wood flex-shrink-0">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-500">Çalışma Saatleri</h3>
                  <p className="text-sm font-semibold text-neutral-900 mt-1">{contactInfo.workingHours}</p>
                </div>
              </div>
            )}

            {/* E-Posta Card */}
            <div className="bg-white text-neutral-800 p-5 rounded-xs border border-line flex items-start gap-4">
              <div className="p-3 bg-wood/10 border border-wood/30 rounded-xs text-wood flex-shrink-0">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-500">E-Posta</h3>
                <p className="text-sm font-semibold text-neutral-900 mt-1">{contactInfo.email}</p>
              </div>
            </div>

            {/* Adres Card */}
            <div className="bg-white text-neutral-800 p-5 rounded-xs border border-line flex items-start gap-4">
              <div className="p-3 bg-wood/10 border border-wood/30 rounded-xs text-wood flex-shrink-0">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-500">Adres</h3>
                <p className="text-xs text-neutral-700 mt-1 leading-relaxed">{contactInfo.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
