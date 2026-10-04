import React from 'react';
import type { Metadata } from 'next';
import KatalogClient from './KatalogClient';
import { productService } from '../../services/productService';
import type { Product } from '../../types';

export const revalidate = 60; // ISR every 60 seconds

export const metadata: Metadata = {
  title: '2026 Koleksiyon Kataloğu | A4 Yatay Lookbook | Ermay Mobilya',
  description: 'Ermay Mobilya 2026 fiyatlı ürün kataloğu: makam takımları, toplantı ve çalışma masaları, bankolar ve ofis koltukları. A4 yatay formatında yazdırın ve inceleyin.',
  keywords: 'mobilya kataloğu, 2026 mobilya modelleri, modoko katalog, ofis mobilyası katalog, makam takımı katalog',
  openGraph: {
    title: '2026 Fiyatlı Ürün Kataloğu | Ermay Mobilya',
    description: 'Ermay Mobilya 2026 Lookbook ve koleksiyon kataloğunu online inceleyin veya PDF olarak indirin.',
    url: 'https://ermaymobilya.com/katalog',
    siteName: 'Ermay Mobilya',
    images: [
      {
        url: '/default-furniture.webp',
        width: 1200,
        height: 800,
        alt: 'Ermay Mobilya 2026 Kataloğu',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://ermaymobilya.com/katalog',
  },
};

export default async function KatalogPage() {
  let products: Product[] = [];
  try {
    const fetched = await productService.getProducts();
    if (fetched && fetched.length > 0) {
      products = fetched;
    }
  } catch (e) {
    console.warn('Katalog SSR ürün çekme uyarısı:', e);
  }

  return <KatalogClient initialProducts={products} />;
}
