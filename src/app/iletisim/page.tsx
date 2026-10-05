import React from 'react';
import type { Metadata } from 'next';
import PageRenderer from '../../components/page/PageRenderer';
import { resolvePageDoc } from '../../lib/pageLayout';
import { cmsService } from '../../services/cmsService';
import { furnitureStoreLd } from '../../lib/structuredData';


interface CmsContact {
  phone?: string;
  phoneSecondary?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  workingHours?: string;
}

export const revalidate = 60; // ISR

export const metadata: Metadata = {
  title: 'İletişim | Ermay Mobilya',
  description: 'Ermay Mobilya Modoko showroom ve atölye iletişim bilgileri. Özel imalat talepleri, kurumsal projeler ve bayilik için bize ulaşın.',
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
  // Yalnız Admin'de kayıtlı bilgiler gösterilir; boş alanın kartı çıkmaz
  const contactInfo = {
    phones: [cms.phone, cms.phoneSecondary].filter((p): p is string => Boolean(p && p.trim())),
    email: cms.email || '',
    address: cms.address || '',
    workingHours: cms.workingHours || '',
  };
  const doc = resolvePageDoc('page_contact', blocks);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Ermay Mobilya İletişim',
    url: 'https://ermaymobilya.com/iletisim',
    mainEntity: furnitureStoreLd(cms),
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
