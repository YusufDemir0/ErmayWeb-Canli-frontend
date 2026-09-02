import React from 'react';
import type { Metadata } from 'next';
import KatalogClient from './KatalogClient';
import { PRODUCTS } from '../../data/mockData';
import { productService } from '../../services/productService';

export const revalidate = 60; // ISR every 60 seconds

export const metadata: Metadata = {
  title: '2026 Koleksiyon Kataloğu | A4 Yatay Lookbook | Ermay Mobilya',
  description: 'Ermay Mobilya 2026 seçkin lüks koleksiyon kataloğu. Makam odaları, yemek ve oturma grupları, TV üniteleri ve tasarım detayları. A4 yatay formatında yazdırın ve inceleyin.',
  keywords: 'mobilya kataloğu, 2026 mobilya modelleri, modoko katalog, ofis mobilyası katalog, lüks koltuk takımları katalog',
  openGraph: {
    title: '2026 Lüks Koleksiyon Kataloğu | Ermay Mobilya',
    description: 'Ermay Mobilya 2026 Lookbook ve koleksiyon kataloğunu online inceleyin veya PDF olarak indirin.',
    url: 'https://ermaymobilya.com/katalog',
    siteName: 'Ermay Mobilya',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1200',
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
  let products = PRODUCTS;
  try {
    const fetched = await productService.getProducts();
    if (fetched && fetched.length > 0) {
      products = fetched;
    }
  } catch (e) {
    // Fallback to static mock products
  }

  return <KatalogClient initialProducts={products} />;
}
