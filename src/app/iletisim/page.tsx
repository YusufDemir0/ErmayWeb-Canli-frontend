import React from 'react';
import type { Metadata } from 'next';
import PageRenderer from '../../components/page/PageRenderer';
import { resolvePageDoc } from '../../lib/pageLayout';
import { cmsService } from '../../services/cmsService';


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
  // İletişim bilgileri İçerik > İletişim bilgileri'nden, sayfa düzeni CMS > Tasarım'dan gelir
  const blocks = await cmsService.getAllBlocks();
  const cms = ((blocks.contact || blocks.contact_info) as CmsContact) || {};
  const contactInfo = {
    phones: [cms.phone, cms.phoneSecondary].filter((p): p is string => Boolean(p && p.trim())),
    email: cms.email || FALLBACK_CONTACT.email,
    address: cms.address || FALLBACK_CONTACT.address,
    workingHours: cms.workingHours || '',
  };
  if (contactInfo.phones.length === 0) contactInfo.phones.push(FALLBACK_CONTACT.phone);
  const doc = resolvePageDoc('page_contact', blocks);

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
    <div className="w-full bg-canvas min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <PageRenderer pageKey="page_contact" initialDoc={doc} data={{ contact: contactInfo }} />
    </div>
  );
}
