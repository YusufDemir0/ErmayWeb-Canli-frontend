import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetailClient from '../../../components/ProductDetailClient';
import { getProductByIdCached } from '../../../services/productService';

export const revalidate = 60; // Incremental Static Regeneration every 60 seconds

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const lookup = await getProductByIdCached(id);
  const product = lookup.status === 'found' ? lookup.product : null;

  if (!product) {
    return {
      title: 'Ürün Bulunamadı | Ermay Mobilya',
      description: 'Aradığınız mobilya ürünü bulunamadı veya satıştan kaldırılmıştır.',
    };
  }

  const categoryName = typeof product.category === 'object' && product.category !== null ? product.category.name : String(product.category);
  const title = `${product.name} - ${categoryName} | Ermay Mobilya`;
  const description = `${product.name} ${categoryName}. ${product.description || 'Doğrudan üreticiden standart seri ofis mobilyası. 2 yıl üretici garantisi ve fabrika satış fiyatıyla hemen keşfedin.'}`;

  return {
    title,
    description,
    keywords: `${product.name}, ${categoryName}, ermay mobilya, lüks mobilya, ofis mobilyası, makam takımı`,
    openGraph: {
      title,
      description,
      url: `https://ermaymobilya.com/urun/${product.slug || product.id}`,
      siteName: 'Ermay Mobilya',
      images: [
        {
          url: product.image || '/default-furniture.webp',
          width: 1200,
          height: 800,
          alt: product.name,
        },
      ],
      locale: 'tr_TR',
      type: 'website',
    },
    alternates: {
      canonical: `https://ermaymobilya.com/urun/${product.slug || product.id}`,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const lookup = await getProductByIdCached(id);

  // Gerçek 404: HTTP 404 dön (soft 404 SEO'ya zarar verir). Geçici API hatasında istemci tekrar dener.
  if (lookup.status === 'not_found') {
    notFound();
  }

  return <ProductDetailClient id={id} initialProduct={lookup.status === 'found' ? lookup.product : undefined} />;
}
