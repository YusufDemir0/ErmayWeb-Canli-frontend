import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { productService } from '../services/productService';
import { CategoryPage } from '../components/CategoryPage';
import type { Product } from '../types';

export const revalidate = 60; // Incremental Static Regeneration (ISR) every 60s

export const metadata: Metadata = {
  title: 'ERMAY Ofis & Fabrika Satış | Doğrudan Üreticiden Standart Seri Mobilyalar',
  description: 'Doğrudan üreticiden standart seri ofis mobilyaları ve fabrika satış mağazası. Makam takımları, toplantı masaları, ofis koltukları ve çalışma masaları.',
  keywords: 'ermay mobilya, ofis mobilyası, makam takımı, toplantı masası, çalışma masası, ofis koltukları, doğrudan fabrikadan satış, toptan ofis mobilyası',
  openGraph: {
    title: 'ERMAY Mobilya | Doğrudan Fabrika Satış',
    description: 'Kendi üretim tesislerimizde imal edilen standart seri ofis mobilyaları.',
    url: 'https://ermaymobilya.com',
    siteName: 'Ermay Mobilya',
    images: [
      {
        url: '/default-furniture.webp',
        width: 1200,
        height: 800,
        alt: 'Ermay Mobilya Seçkin Koleksiyonu',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://ermaymobilya.com',
  },
};

export default async function HomePage() {
  const defaultSlug = 'aksesuar-ve-diger';
  let initialProducts: Product[] = [];
  try {
    const fetched = await productService.getProducts(defaultSlug);
    if (Array.isArray(fetched)) {
      initialProducts = fetched;
    }
  } catch (e) {
    console.warn('HomePage SSR default category ürün çekme uyarısı:', e);
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center text-xs text-neutral-400">Yükleniyor...</div>}>
      <CategoryPage
        categorySlug={defaultSlug}
        initialProducts={initialProducts}
      />
    </Suspense>
  );
}
