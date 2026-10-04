import React from 'react';
import type { Metadata } from 'next';
import { cmsService } from '../../services/cmsService';
import type { StoreItem } from '../../types';
import { BayilerContent } from './BayilerContent';

export const revalidate = 60; // ISR

export const metadata: Metadata = {
  title: 'Satış Noktaları & Harita | Ermay Mobilya Modoko',
  description: 'İnteraktif Türkiye haritası üzerinden Ermay Mobilya Modoko merkez mağazası, Kocaeli fabrika satış mağazası ve Sakarya mağazalarımızın adres, telefon ve yol tarifi bilgileri.',
  keywords: 'ermay mobilya harita, türkiye mobilya mağazaları, modoko mobilya mağazası, kocaeli mobilya, sakarya mobilya',
  openGraph: {
    title: 'Satış Noktaları & Mağazalarımız | Ermay Mobilya',
    description: 'Ermay Mobilya mağazalarını harita üzerinde keşfedin, yol tarifi alın ve randevu oluşturun.',
    url: 'https://ermaymobilya.com/bayiler',
    siteName: 'Ermay Mobilya',
    images: [
      {
        url: '/default-furniture.webp',
        width: 1200,
        height: 800,
        alt: 'Ermay Mobilya Satış Noktaları',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://ermaymobilya.com/bayiler',
  },
};

export default async function BayilerPage() {
  // API'ye ulaşılamazsa uydurma adres göstermek yerine boş liste (sayfa kullanıcıyı WhatsApp'a yönlendirir)
  let allStores: StoreItem[] = [];
  try {
    const remoteStores = await cmsService.getStores();
    if (remoteStores && remoteStores.length > 0) {
      allStores = remoteStores;
    }
  } catch (err) {
    console.warn('Stores fetch fallback:', err);
  }

  return <BayilerContent stores={allStores} />;
}
