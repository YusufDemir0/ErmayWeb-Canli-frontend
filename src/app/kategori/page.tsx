import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { CategoryPage } from '../../components/CategoryPage';
import { productService } from '../../services/productService';
import type { Product } from '../../types';

export const revalidate = 60; // Incremental Static Regeneration every 60 seconds

export const metadata: Metadata = {
  title: 'Tüm Ürünler & Fabrika Koleksiyonu | Ermay Mobilya',
  description: 'Ermay Mobilya doğrudan üreticiden standart seri tüm ofis mobilyaları. Makam takımları, masalar, dolaplar, ofis koltukları ve aksesuarlar.',
  openGraph: {
    title: 'Tüm Ürünler & Fabrika Koleksiyonu | Ermay Mobilya',
    description: 'Kendi üretim tesislerimizde imal edilen doğrudan fabrika satış standart seri ofis mobilyaları.',
    url: 'https://ermaymobilya.com/kategori',
    siteName: 'Ermay Mobilya',
    locale: 'tr_TR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://ermaymobilya.com/kategori',
  },
};

export default async function KategoriIndexPage() {
  let initialProducts: Product[] = [];
  try {
    const fetched = await productService.getProducts();
    if (Array.isArray(fetched)) {
      initialProducts = fetched;
    }
  } catch (e) {
    console.warn('KategoriIndexPage SSR ürün çekme uyarısı:', e);
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center text-xs text-neutral-400">Yükleniyor...</div>}>
      <CategoryPage
        categorySlug="hepsi"
        initialProducts={initialProducts}
      />
    </Suspense>
  );
}
