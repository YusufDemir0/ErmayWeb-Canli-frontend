import React from 'react';
import type { Metadata } from 'next';
import { CategoryPage } from '../../../components/CategoryPage';

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
    title: `${formattedTitle} Modelleri & Lüks Koleksiyonlar | Ermay Mobilya`,
    description: `Özel tasarım ${formattedTitle} modelleri. %100 fırınlanmış gürgen iskelet, İtalyan döşeme ve doğrudan atölyeden satış avantajıyla hemen keşfedin.`,
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

  return <CategoryPage categorySlug={slug} />;
}
