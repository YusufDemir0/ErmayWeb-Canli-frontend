import React, { Suspense } from 'react';
import CategorySsrFallback from '../../components/CategorySsrFallback';
import type { Metadata } from 'next';
import { CategoryPage } from '../../components/CategoryPage';
import { productService } from '../../services/productService';
import type { Product } from '../../types';

export const revalidate = 60; // Incremental Static Regeneration every 60 seconds

export const metadata: Metadata = {
  title: 'Tüm Ürünler | Ermay Mobilya',
  description: 'Ermay Mobilya doğrudan üreticiden standart seri tüm ofis mobilyaları. Makam takımları, masalar, dolaplar, ofis koltukları ve aksesuarlar.',
  openGraph: {
    title: 'Tüm Ürünler | Ermay Mobilya',
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
    <Suspense fallback={<CategorySsrFallback title="Tüm Ürünler" products={initialProducts} />}>
      <CategoryPage
        categorySlug="hepsi"
        initialProducts={initialProducts}
      />
    </Suspense>
  );
}
