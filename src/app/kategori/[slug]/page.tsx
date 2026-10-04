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

/** Kategorinin gerçek adı (Türkçe karakterleriyle); API erişilemezse slug'dan türetilir */
async function resolveCategoryName(slug: string): Promise<string> {
  if (slug === 'hepsi' || slug === 'all') return 'Tüm Ürünler';
  try {
    const res = await apiClient.get(`/categories/${slug}`);
    if (res.data?.category?.name) return res.data.category.name as string;
  } catch {
    // slug'a düş
  }
  return slug
    .split('-')
    .map((word) => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const formattedTitle = await resolveCategoryName(slug);

  return {
    title: `${formattedTitle} | Ermay Mobilya`,
    description: `${formattedTitle}: Ermay Mobilya atölyesinde üretilen modeller, fabrika fiyatıyla. E1 melamin, DKP çelik ayak; İstanbul içi teslimat ve kurulum.`,
    openGraph: {
      title: `${formattedTitle} | Ermay Mobilya`,
      description: `${formattedTitle} modelleri ve fabrika fiyatları.`,
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
