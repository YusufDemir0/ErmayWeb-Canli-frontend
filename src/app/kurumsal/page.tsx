import React from 'react';
import type { Metadata } from 'next';
import PageRenderer from '../../components/page/PageRenderer';
import { resolvePageDoc } from '../../lib/pageLayout';

import { cmsService } from '../../services/cmsService';

export const revalidate = 60; // ISR

export const metadata: Metadata = {
  title: 'Hakkımızda | Ermay Mobilya',
  description: 'Kendi modern üretim tesislerimizde standart seri olarak imal edilen dayanıklı, kaliteli ofis mobilyaları. Doğrudan fabrikadan aracısız satış güvencesi ve kurumsal çözümler.',
  keywords: 'ermay mobilya hakkında, ofis mobilyası üreticisi, doğrudan fabrikadan ofis mobilyası, makam takımları imalatı',
  openGraph: {
    title: 'Hakkımızda | Ermay Mobilya',
    description: 'Doğrudan üretim tesislerimizden aracısız fabrika satış güvencesi ve standart seri ofis çözümleri.',
    url: 'https://ermaymobilya.com/kurumsal',
    siteName: 'Ermay Mobilya',
    images: [
      {
        url: '/default-furniture.webp',
        width: 1200,
        height: 800,
        alt: 'Ermay Mobilya Üretim Tesisleri',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://ermaymobilya.com/kurumsal',
  },
};

/** Sayfanın tamamı Admin > CMS'teki sayfa düzeninden gelir (page_corporate). */
export default async function KurumsalPage() {
  const cms = await cmsService.getAllBlocks();
  const doc = resolvePageDoc('page_corporate', cms);
  return (
    <div className="w-full bg-canvas min-h-screen">
      <PageRenderer pageKey="page_corporate" initialDoc={doc} data={{}} />
    </div>
  );
}
