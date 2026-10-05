import React from 'react';
import PageRenderer from './page/PageRenderer';
import { productService } from '../services/productService';
import { cmsService } from '../services/cmsService';
import { resolvePageDoc } from '../lib/pageLayout';
import type { Product } from '../types';

/**
 * Vitrin (showroom) ana sayfa içeriği. Hem `/` (açılış tercihi "home" iken) hem de `/anasayfa` tarafından kullanılır.
 */
export default async function HomeShowcase() {
  let products: Product[] = [];
  const cmsPromise = cmsService.getAllBlocks();
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
    logo: 'https://ermaymobilya.com/brand/logo-dark-text-960.png',
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

      <PageRenderer pageKey="page_home" initialDoc={resolvePageDoc('page_home', await cmsPromise)} data={{ products }} />
    </div>
  );
}
