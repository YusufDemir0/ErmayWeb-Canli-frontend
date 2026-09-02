import React from 'react';
import type { Metadata } from 'next';
import Hero from '../components/Hero';
import BrandStrip from '../components/BrandStrip';
import CategoryList from '../components/CategoryList';
import CuratedSets from '../components/CuratedSets';
import PromoBannerGrid from '../components/PromoBannerGrid';
import ProductGridClient from './ProductGridClient';
import { PRODUCTS } from '../data/mockData';
import { productService } from '../services/productService';
import Link from 'next/link';

export const revalidate = 60; // Incremental Static Regeneration (ISR) every 60s

export const metadata: Metadata = {
  title: 'ERMAY Ofis & Ev Mobilyaları | Lüks Tasarım, Atölye İmalatı & Zanaat',
  description: 'Modoko merkezli 40 yıllık tecrübe ile doğrudan atölyeden satış. Lüks makam takımları, yemek odaları, oturma grupları ve takım kombinasyonları. 5 yıl garanti ve ücretsiz montaj.',
  keywords: 'ermay mobilya, ofis mobilyası, makam takımı, sekreter takımı, kanepe takımı, ofis koltuğu, lüks mobilya, istanbul mobilya, modoko mobilya, mobilya imalatçısı',
  openGraph: {
    title: 'ERMAY Mobilya | Lüks Tasarım & Fabrikadan Satış',
    description: 'Kendi üretim tesislerimizde imal edilen lüks makam takımları, yemek odaları ve oturma grupları.',
    url: 'https://ermaymobilya.com',
    siteName: 'Ermay Mobilya',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200',
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
  let products = PRODUCTS;
  try {
    const fetched = await productService.getProducts();
    if (fetched && fetched.length > 0) {
      products = fetched;
    }
  } catch (e) {
    // Fallback to static mock products on SSR error
  }

  // Schema.org Structured Data (JSON-LD) for Rich Google Search Results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    name: 'Ermay Mobilya',
    description: 'Lüks ev ve ofis mobilyaları üreticisi ve doğrudan fabrika satış mağazası.',
    url: 'https://ermaymobilya.com',
    logo: 'https://ermaymobilya.com/logo.png',
    telephone: '+905324194151',
    priceRange: '₺₺₺',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Modoko Mobilyacılar Sitesi 1. Cadde No: 42',
      addressLocality: 'Ümraniye',
      addressRegion: 'İstanbul',
      postalCode: '34775',
      addressCountry: 'TR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 40.9995,
      longitude: 29.1558,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '20:00',
      },
    ],
  };

  return (
    <div className="w-full bg-[#FCFAF6] text-neutral-800">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. HERO SLIDER BANNER */}
      <Hero />

      {/* 2. MINIMALIST LUXURY TRUST STRIP */}
      <BrandStrip />

      {/* 3. COLLECTION CATEGORIES QUICK SELECTOR */}
      <CategoryList />

      {/* 4. CURATED FACTORY SETS (Fabrikadan Takım Kombinasyonları) */}
      <CuratedSets />

      {/* 5. PROMO EDITORIAL BANNERS */}
      <PromoBannerGrid />

      {/* 6. TABBED COLLECTION SHOWCASE */}
      <section className="py-14 md:py-20 bg-white border-b border-[#EAE3D2]">
        <ProductGridClient initialProducts={products} featuredTitle="Seçkin Mobilya Koleksiyonu" />
      </section>

      {/* 7. DIRECT FACTORY MANUFACTURING & SALES BANNER */}
      <section className="relative py-16 md:py-20 bg-[#F7F4EE] border-b border-[#EAE3D2] overflow-hidden text-neutral-800">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C5A880] block">
            Kendi İmalatımız & Fabrikadan Satış
          </span>
          <h2 className="font-serif text-2xl md:text-4xl font-bold tracking-tight max-w-3xl mx-auto text-neutral-900 leading-tight">
            Aracısız, Birinci Sınıf Malzeme ve Usta İmalatı
          </h2>
          <p className="text-neutral-600 font-light text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Ermay Mobilya kendi üretim tesislerinde imal ettiği kaliteli ev ve ofis mobilyalarını doğrudan tüketiciyle ve bayileriyle buluşturur.
          </p>
          <div className="pt-2">
            <Link
              href="/iletisim"
              className="inline-block bg-neutral-900 hover:bg-[#C5A880] text-white font-bold text-xs tracking-widest uppercase py-3.5 px-8 rounded-xs shadow-xs transition-all"
            >
              Fabrikadan Satış & İletişim
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
