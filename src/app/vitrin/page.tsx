import React from 'react';
import type { Metadata } from 'next';
import Hero from '../../components/Hero';
import CategoryList from '../../components/CategoryList';
import CuratedSets from '../../components/CuratedSets';
import ProductGridClient from '../ProductGridClient';
import { productService } from '../../services/productService';
import type { Product } from '../../types';
import Link from 'next/link';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Fabrika Satış Vitrini | Ermay Mobilya',
  description: 'Ermay Mobilya doğrudan fabrika satış vitrini. Üreticiden standart seri ofis mobilyaları, makam takımları, toplantı masaları ve çalışma istasyonları.',
};

export default async function VitrinPage() {
  let products: Product[] = [];
  try {
    const fetched = await productService.getProducts({ limit: 24 });
    if (fetched && fetched.length > 0) {
      products = fetched;
    }
  } catch (e) {
    console.warn('VitrinPage SSR ürün çekme uyarısı:', e);
  }

  return (
    <div className="w-full bg-[#FCFAF6] text-neutral-800">
      {/* 1. HERO SLIDER BANNER */}
      <Hero />

      {/* 2. COLLECTION CATEGORIES QUICK SELECTOR */}
      <CategoryList />

      {/* 3. CURATED FACTORY SETS */}
      <CuratedSets />

      {/* 4. TABBED COLLECTION SHOWCASE */}
      <section className="py-14 md:py-20 bg-white border-b border-[#EAE3D2]">
        <ProductGridClient initialProducts={products} featuredTitle="Seçkin Mobilya Koleksiyonu" />
      </section>

      {/* 5. DIRECT MANUFACTURER FACTORY STATEMENT */}
      <section className="py-16 md:py-24 bg-[#FCFAF6]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-white border border-[#EAE3D2] rounded-3xl p-8 md:p-14 text-center space-y-6 shadow-xs overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C5A880] block">
              DOĞRUDAN FABRİKADAN ARACISIZ SATIŞ
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900 leading-snug">
              Kendi Üretimimiz, Standart Seri Sağlamlığı ve Net Fabrika Fiyatı
            </h2>
            <p className="text-neutral-600 font-light text-xs md:text-sm max-w-2xl mx-auto leading-relaxed">
              Aracı ve mağaza komisyonu ödemeyin. Ofis mobilyalarımızı kendi üretim tesislerimizde standart seriler halinde üretiyor; E1 kalite dayanıklı melamin, 2mm PVC kenar koruması ve doğrudan imalatçı fiyat avantajıyla ofisinize teslim ediyoruz.
            </p>

            {/* 3 Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-left">
              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#EAE3D2]/70 space-y-1.5">
                <span className="text-base block">🏭</span>
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">Doğrudan İmalatçı</h4>
                <p className="text-[11px] text-neutral-500 font-light leading-snug">Aracı komisyonu yok, net fabrika liste fiyatıyla dürüst maliyet avantajı.</p>
              </div>
              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#EAE3D2]/70 space-y-1.5">
                <span className="text-base block">🚚</span>
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">Kendi Fabrika Ekibimiz</h4>
                <p className="text-[11px] text-neutral-500 font-light leading-snug">İstanbul içi kendi araç ve personelimizle kata teslimat ve eksiksiz montaj.</p>
              </div>
              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#EAE3D2]/70 space-y-1.5">
                <span className="text-base block">🏢</span>
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">Çoklu Alım İskontosu</h4>
                <p className="text-[11px] text-neutral-500 font-light leading-snug">Şirket ve ofis kurulumlarında adetli siparişler için anında fabrika iskontosu.</p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link
                href="/bayiler"
                className="bg-neutral-900 hover:bg-[#C5A880] text-white font-bold text-xs tracking-wider uppercase py-3.5 px-7 rounded-sm shadow-xs transition-colors"
              >
                Showroomları Gör
              </Link>
              <Link
                href="/katalog"
                className="bg-[#FAF8F5] hover:bg-neutral-100 text-neutral-800 border border-[#EAE3D2] font-semibold text-xs tracking-wider uppercase py-3.5 px-7 rounded-sm transition-colors"
              >
                Fabrika Kataloğu
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
