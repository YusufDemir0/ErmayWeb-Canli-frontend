import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import HomeShowcase from '../components/HomeShowcase';
import { CategoryPage } from '../components/CategoryPage';
import CategorySsrFallback from '../components/CategorySsrFallback';
import { productService } from '../services/productService';
import { getLandingPageConfig, DEFAULT_LANDING_CATEGORY } from '../services/landingService';
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

/**
 * Kök URL, admin panelindeki "Açılış Sayfası Tercihi"ne göre render edilir:
 * - home     -> vitrin (HomeShowcase)
 * - category -> seçilen kategori doğrudan `/` üzerinde
 * - catalog  -> /katalog
 * Tercih hiç kaydedilmemişse FAZ 15 kararı geçerlidir: kök URL varsayılan kategoriyi gösterir, vitrin /anasayfa'dadır.
 */
export default async function HomePage() {
  const landing = await getLandingPageConfig();

  if (landing.type === 'home') {
    return <HomeShowcase />;
  }

  if (landing.type === 'catalog') {
    redirect('/katalog');
  }

  const slug = landing.targetSlug || DEFAULT_LANDING_CATEGORY;
  let initialProducts: Product[] = [];
  try {
    const fetched = await productService.getProducts(slug);
    if (Array.isArray(fetched)) {
      initialProducts = fetched;
    }
  } catch (e) {
    console.warn('HomePage SSR açılış kategorisi ürün çekme uyarısı:', e);
  }

  return (
    <Suspense fallback={<CategorySsrFallback title="Ermay Mobilya | Doğrudan Üreticiden Standart Seri Ofis Mobilyaları" products={initialProducts} />}>
      <CategoryPage categorySlug={slug} initialProducts={initialProducts} />
    </Suspense>
  );
}
