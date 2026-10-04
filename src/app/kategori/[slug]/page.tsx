import React, { Suspense } from 'react';
import { isAxiosError } from 'axios';
import CategorySsrFallback from '../../../components/CategorySsrFallback';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryPage } from '../../../components/CategoryPage';
import { productService } from '../../../services/productService';
import apiClient from '../../../services/api';
import type { Product } from '../../../types';

export const revalidate = 60; // Incremental Static Regeneration every 60 seconds

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const formattedTitle = slug
    .split('-')
    .map((word) => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1))
    .join(' ');

  return {
    title: `${formattedTitle} Modelleri & Doğrudan Fabrika Satış | Ermay Mobilya`,
    description: `Ermay Mobilya doğrudan fabrika üretimi ${formattedTitle} modelleri. 1. Sınıf E1 melamin, DKP çelik profil ve aracısız üretici fiyatlarıyla hemen keşfedin.`,
    openGraph: {
      title: `${formattedTitle} Modelleri & Fiyatları | Ermay Mobilya`,
      description: `En yeni ${formattedTitle} tasarımları, modüler takım seçenekleri ve doğrudan üretici fiyat avantajları.`,
      url: `https://ermaymobilya.com/kategori/${slug}`,
      siteName: 'Ermay Mobilya',
      locale: 'tr_TR',
      type: 'website',
    },
    alternates: {
      canonical: `https://ermaymobilya.com/kategori/${slug}`,
    },
  };
}

export default async function CategoryRoute({ params }: Props) {
  const { slug } = await params;

  // Validate category existence for non-generic slugs.
  // Yalnızca GERÇEK 404'te notFound(): backend geçici olarak erişilemezse tüm kategori sayfaları 404 olup önbelleğe
  // girmesin, istemci tarafı CategoryPage veriyi kendisi yüklesin.
  let categoryTitle = slug === 'hepsi' || slug === 'all' ? 'Tüm Ürünler' : slug;
  if (slug !== 'hepsi' && slug !== 'all') {
    let isMissing = false;
    try {
      const catCheck = await apiClient.get(`/categories/${slug}`);
      if (!catCheck.data?.success || !catCheck.data?.category) {
        isMissing = true;
      } else {
        categoryTitle = catCheck.data.category.name || categoryTitle;
      }
    } catch (err) {
      isMissing = isAxiosError(err) && err.response?.status === 404;
      if (!isMissing) console.warn('CategoryRoute kategori doğrulama uyarısı (API erişilemedi):', err);
    }
    if (isMissing) notFound();
  }

  let initialProducts: Product[] = [];
  try {
    const fetched = await productService.getProducts(slug === 'hepsi' || slug === 'all' ? undefined : slug);
    if (Array.isArray(fetched)) {
      initialProducts = fetched;
    }
  } catch (err) {
    console.warn('CategoryRoute SSR error:', err);
  }

  return (
    <Suspense fallback={<CategorySsrFallback title={categoryTitle} products={initialProducts} />}>
      <CategoryPage categorySlug={slug} initialProducts={initialProducts} initialCategoryName={categoryTitle} />
    </Suspense>
  );
}
