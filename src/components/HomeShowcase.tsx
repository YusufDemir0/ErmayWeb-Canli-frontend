import React from 'react';
import Link from 'next/link';
import Hero from './Hero';
import CategoryList from './CategoryList';
import CuratedSets from './CuratedSets';
import ProductGridClient from '../app/ProductGridClient';
import { productService } from '../services/productService';
import type { Product } from '../types';

/**
 * Vitrin (showroom) ana sayfa içeriği. Hem `/` (açılış tercihi "home" iken) hem de `/anasayfa` tarafından kullanılır.
 */
export default async function HomeShowcase() {
  let products: Product[] = [];
  try {
    const fetched = await productService.getProducts({ limit: 24 });
    if (fetched && fetched.length > 0) {
      products = fetched;
    }
  } catch (e) {
    console.warn('HomePage SSR ürün çekme uyarısı:', e);
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    name: 'Ermay Mobilya',
    description: 'Doğrudan üreticiden standart seri ofis mobilyaları ve fabrika satış mağazası. Makam takımları, toplantı masaları, ofis koltukları ve çalışma masaları.',
    url: 'https://ermaymobilya.com',
    logo: 'https://ermaymobilya.com/favicon.svg',
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
        closes: '19:30',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday'],
        opens: '11:00',
        closes: '18:30',
      },
    ],  };

  return (
    <div className="w-full bg-white text-ink">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      {/* Sayfanın tek H1'i: hero slaytları istemcide yüklendiği için sunucu HTML'inde her zaman bulunmalı */}
      <h1 className="sr-only">Ermay Mobilya | Doğrudan Üreticiden Standart Seri Ofis Mobilyaları</h1>

      {/* 1. HERO SLIDER BANNER */}
      <Hero />

      {/* 2. COLLECTION CATEGORIES QUICK SELECTOR */}
      <CategoryList />

      {/* 3. CURATED FACTORY SETS */}
      <CuratedSets />

      {/* 4. ÜRÜN VİTRİNİ */}
      <section className="py-12 md:py-16 bg-white">
        <ProductGridClient initialProducts={products} featuredTitle="Ürünler" />
      </section>

      {/* 5. NASIL ÇALIŞIYORUZ: somut, ölçülebilir iddialar */}
      <section className="py-12 md:py-16 bg-paper border-t border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-ink leading-tight">
              Modoko&apos;daki atölyemizde üretiyor, kendi ekibimizle kuruyoruz.
            </h2>
            <p className="text-sm leading-relaxed text-neutral-600 max-w-md">
              Ofis mobilyalarını standart seriler halinde kendimiz üretiyoruz. Arada mağaza ya da aracı olmadığı için
              listedeki fiyat fabrika fiyatıdır.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/katalog"
                className="bg-ink hover:bg-wood text-white text-sm font-semibold py-3 px-5 rounded-xs transition-colors"
              >
                Fiyatlı katalog
              </Link>
              <Link
                href="/bayiler"
                className="border border-ink text-ink hover:bg-ink hover:text-white text-sm font-semibold py-3 px-5 rounded-xs transition-colors"
              >
                Showroomlar
              </Link>
            </div>
          </div>

          <ol className="lg:col-span-7 divide-y divide-line border-y border-line">
            {[
              {
                title: 'Malzeme',
                text: 'E1 sınıfı melamin gövde, 2 mm PVC kenar bandı, elektrostatik boyalı DKP çelik ayak.',
              },
              {
                title: 'Teslimat ve montaj',
                text: 'İstanbul içinde kendi aracımız ve personelimizle kata teslim ve kurulum.',
              },
              {
                title: 'Adetli alım',
                text: 'Şirket ve ofis kurulumlarında adetli siparişe fabrika iskontosu uygulanır.',
              },
            ].map((item, idx) => (
              <li key={item.title} className="grid grid-cols-[3rem_1fr] gap-4 py-5">
                <span className="font-mono text-sm text-wood tabular-nums-all">{String(idx + 1).padStart(2, '0')}</span>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-ink">{item.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
