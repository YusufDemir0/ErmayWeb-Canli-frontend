'use client';

import React, { useState } from 'react';
import { 
  Printer, Ruler, Layers, 
  Package, Check, ShieldCheck, Filter
} from 'lucide-react';
import { useCMSStore } from '../../stores/useCMSStore';
import { getProductImages } from '../../lib/productImages';
import type { Product } from '../../types';

interface KatalogClientProps {
  initialProducts: Product[];
}

export default function KatalogClient({ initialProducts }: KatalogClientProps) {
  const storeProducts = useCMSStore((state) => state.products);
  const rawProducts = (storeProducts && storeProducts.length > 0) ? storeProducts : initialProducts;
  const categories = useCMSStore((state) => state.categories) || [];
  const contactInfo = useCMSStore((state) => state.contactInfo);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeThumbMap, setActiveThumbMap] = useState<Record<string, number>>({});

  // Filter products by category if selected
  const products = rawProducts.filter((p) => {
    if (selectedCategory === 'all') return true;
    const catSlug = typeof p.category === 'object' && p.category !== null 
      ? (p.category as { slug?: string }).slug 
      : String(p.category || '');
    return catSlug.toLowerCase().includes(selectedCategory.toLowerCase()) || 
           p.categoryId === selectedCategory;
  });

  const handlePrint = () => {
    window.print();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(price).replace('TRY', 'TL');
  };

  const formatCategoryName = (cat: string | { name?: string; slug?: string }) => {
    if (typeof cat === 'object' && cat !== null && cat.name) {
      return cat.name.toLocaleUpperCase('tr-TR');
    }
    const s = String(cat || '').toLowerCase();
    if (s.includes('dining') || s.includes('yemek')) return 'YEMEK ODASI';
    if (s.includes('living') || s.includes('oturma') || s.includes('koltuk')) return 'OTURMA ODASI';
    if (s.includes('bed') || s.includes('yatak')) return 'YATAK ODASI';
    if (s.includes('makam') || s.includes('ofis')) return 'MAKAM & OFİS';
    if (s.includes('tv') || s.includes('unite')) return 'TV ÜNİTELERİ';
    if (s.includes('access') || s.includes('aksesuar')) return 'AKSESUARLAR';
    return s ? s.toLocaleUpperCase('tr-TR') : 'ERMAY STANDART SERİ';
  };

  return (
    <div className="w-full bg-paper text-neutral-900 min-h-screen print:bg-white print:p-0 print:m-0">
      {/* 1. TOP CONTROL BAR (Screen Only - PDF Print & Filter) */}
      <nav className="print:hidden relative z-10 bg-white border-b border-line py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-display font-extrabold tracking-wider text-sm sm:text-base text-neutral-900 uppercase">
              ERMAY MOBİLYA
            </span>
            <span className="hidden sm:inline text-neutral-300">|</span>
            <span className="hidden sm:inline text-xs uppercase tracking-wider text-neutral-500 font-semibold">
              2026 Koleksiyon Kataloğu (A4 Yatay Baskı)
            </span>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-neutral-100 px-3 py-1.5 rounded-xs border border-line text-xs">
              <Filter className="h-3.5 w-3.5 text-wood" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent font-medium text-neutral-700 outline-none cursor-pointer"
              >
                <option value="all">Tüm Koleksiyon ({rawProducts.length} Ürün)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug || cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Print CTA */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-neutral-900 hover:bg-wood text-white hover:text-neutral-950 px-4 py-2 rounded-xs text-sm font-semibold transition-colors cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>PDF İndir / Yazdır (A4 Yatay)</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 2. CATALOG CONTENT (A4 LANDSCAPE - 1 PRODUCT PER PAGE) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 md:space-y-12 print:p-0 print:m-0 print:space-y-0 print:max-w-none">
        <div className="space-y-8 md:space-y-12 print:space-y-0">
          {products.map((product, pIdx) => {
            const pageNumber = String(pIdx + 1).padStart(2, '0');
            const isEven = pIdx % 2 === 0;
            const imgs = getProductImages(product);
            const currentThumbIdx = activeThumbMap[product.id] || 0;
            const activeImg = imgs[currentThumbIdx] || imgs[0];
            const categoryTitle = formatCategoryName(product.category);

            return (
              <div 
                key={product.id}
                className="katalog-sheet-landscape bg-white rounded-xs border border-line p-6 md:p-8 print:p-0 print:border-none print:shadow-none"
              >
                {/* PRINT RUNNING HEADER */}
                <header className="hidden print:flex border-b border-wood/40 pb-1.5 mb-3 items-center justify-between print-header">
                  <div className="flex items-center gap-2.5">
                    <span className="font-display text-xs font-extrabold tracking-wider text-neutral-900 uppercase">
                      ERMAY MOBİLYA
                    </span>
                    <span className="text-wood">|</span>
                    <span className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">
                      2026 Fiyatlı Ürün Kataloğu
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-wood tracking-wider uppercase">
                    SAYFA {pageNumber}
                  </span>
                </header>

                {/* 1 PRODUCT CONTENT */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-6 md:gap-8 items-center print:grid-cols-12 print:gap-6">
                  {/* VISUALS SECTION */}
                  <div className={`sm:col-span-7 print:col-span-7 space-y-3 print:space-y-2 ${
                    isEven 
                      ? 'order-1 sm:order-1 print:order-1' 
                      : 'order-1 sm:order-2 print:order-2'
                  }`}>
                    <div className="aspect-[16/10] w-full rounded-xs overflow-hidden border border-line bg-neutral-100">
                      <img 
                        src={activeImg} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* 3 Detail Photos Strip */}
                    <div className="grid grid-cols-3 gap-2">
                      {imgs.slice(0, 3).map((thumbUrl, tIdx) => (
                        <button
                          key={tIdx}
                          type="button"
                          onClick={() => setActiveThumbMap((prev) => ({ ...prev, [product.id]: tIdx }))}
                          className={`aspect-[4/3] rounded-xs overflow-hidden border transition-all cursor-pointer ${
                            currentThumbIdx === tIdx
                              ? 'border-wood ring-1.5 ring-wood/40'
                              : 'border-line opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SPECS & DETAILS SECTION */}
                  <div className={`sm:col-span-5 print:col-span-5 space-y-3 print:space-y-2 ${
                    isEven 
                      ? 'order-2 sm:order-2 print:order-2' 
                      : 'order-2 sm:order-1 print:order-1'
                  }`}>
                    <div className="border-b border-line pb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs uppercase tracking-wider text-wood font-bold">
                          {categoryTitle}
                        </span>
                        <span className="font-mono text-xs text-neutral-500 uppercase tracking-wider">
                          REF: ERM-{pageNumber}
                        </span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-display font-bold text-neutral-900 tracking-tight leading-snug">
                        {product.name}
                      </h2>
                    </div>

                    <p className="text-neutral-600 text-xs md:text-[13px] leading-relaxed italic border-l-2 border-wood/50 pl-3">
                      "{product.description}"
                    </p>

                    {/* Specifications Box */}
                    <div className="bg-paper border border-line rounded-xs p-3 space-y-2 text-xs">
                      <div className="space-y-1.5 text-xs print:text-[10px]">
                        <div className="flex items-start gap-2">
                          <Ruler className="h-3.5 w-3.5 text-wood flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs uppercase font-bold text-neutral-500 block">Ölçüler</span>
                            <span className="font-semibold text-neutral-800">{product.dimensions || 'G: 220cm | D: 95cm | Y: 75cm'}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Layers className="h-3.5 w-3.5 text-wood flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs uppercase font-bold text-neutral-500 block">Malzeme</span>
                            <span className="font-semibold text-neutral-800">{product.material}</span>
                          </div>
                        </div>

                        {product.setContents && (
                          <div className="flex items-start gap-2 pt-1 border-t border-line">
                            <Package className="h-3.5 w-3.5 text-wood flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="text-xs uppercase font-bold text-neutral-500 block">Takım İçeriği</span>
                              <span className="font-medium text-neutral-800">
                                {typeof product.setContents === 'string' ? product.setContents : product.setContents.join(' + ')}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Features Checkmarks */}
                      {product.features && product.features.length > 0 && (
                        <div className="pt-2 border-t border-line grid grid-cols-2 gap-1.5 text-xs text-neutral-600">
                          {product.features.slice(0, 4).map((f, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <Check className="h-3 w-3 text-wood flex-shrink-0" />
                              <span className="truncate">{f}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pricing and Guarantee Footer */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-xs uppercase font-semibold text-neutral-500 block">Tavsiye Edilen Satış Fiyatı</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xs line-through text-neutral-500">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8D7B68] bg-wood/10 px-3 py-1.5 rounded-xs border border-wood/20">
                        <ShieldCheck className="h-3.5 w-3.5 text-wood" />
                        <span>2 yıl imalat garantisi</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* PRINT RUNNING FOOTER */}
                <footer className="hidden print:flex border-t border-wood/40 pt-1.5 text-xs text-neutral-500 items-center justify-between uppercase tracking-wider">
                  <div>
                    <span className="font-semibold text-neutral-700">Merkez showroom ve atölye:</span> {contactInfo.showroom || 'Modoko Mobilyacılar Sitesi No: 42, Ümraniye / İstanbul'}
                  </div>
                  <div className="flex items-center gap-3">
                    <span>TEL: {contactInfo.phone || '+90 (216) 456 78 90'}</span>
                    <span>|</span>
                    <span className="font-bold text-neutral-800">WWW.ERMAYMOBILYA.COM</span>
                  </div>
                </footer>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
