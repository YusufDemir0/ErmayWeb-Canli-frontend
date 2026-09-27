import React from 'react';
import type { Metadata } from 'next';
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
  const product = await getProductByIdCached(id);

  if (!product) {
    return {
      title: 'Ürün Bulunamadı | Ermay Mobilya',
      description: 'Aradığınız mobilya ürünü bulunamadı veya satıştan kaldırılmıştır.',
    };
  }

  const categoryName = typeof product.category === 'object' && product.category !== null ? product.category.name : String(product.category);
  const title = `${product.name} - ${categoryName} | Ermay Mobilya`;
  const description = `${product.name} ${categoryName}. ${product.description || 'Masif fırınlanmış gürgen iskelet, İtalyan deri ve kumaş işçiliği. 5 yıl garanti ve ücretsiz montaj avantajıyla hemen keşfedin.'}`;

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
  const product = await getProductByIdCached(id);

  return <ProductDetailClient id={id} initialProduct={product} />;
}
