import React from 'react';
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
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${formattedTitle} Modelleri & Doğrudan Fabrika Satış | Ermay Mobilya`,
    description: `Ermay Mobilya doğrudan fabrika üretimi ${formattedTitle} modelleri. 1. Sınıf E1 melamin, DKP çelik profil ve aracısız üretici fiyatlarıyla hemen keşfedin.`,
    openGraph: {
      title: `${formattedTitle} Modelleri & Fiyatları | Ermay Mobilya`,
      description: `En yeni ${formattedTitle} tasarımları, takım seçenekleri ve 12 taksit fırsatları.`,
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

  // Validate category existence for non-generic slugs
  if (slug !== 'hepsi' && slug !== 'all') {
    try {
      const catCheck = await apiClient.get(`/categories/${slug}`);
      if (!catCheck.data?.success || !catCheck.data?.category) {
        notFound();
      }
    } catch {
      // Category not found (404) or deleted -> trigger dead link 404
      notFound();
    }
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

  return <CategoryPage categorySlug={slug} initialProducts={initialProducts} />;
}
