'use client';

import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { Sparkles, Package, Flame, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '../types';

interface ProductGridClientProps {
  initialProducts?: Product[];
  featuredTitle?: string;
}

export default function ProductGridClient({
  initialProducts = [],
  featuredTitle = 'Seçkin Mobilya Koleksiyonu',
}: ProductGridClientProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'new'>('featured');

  const products = initialProducts;
  const featuredProducts = products.filter((p) => p.badge?.includes('Öne Çıkan') || p.rating >= 4.8);
  const newArrivals = products.slice(0, 8);

  const displayedProducts =
    activeTab === 'all'
      ? products.slice(0, 8)
      : activeTab === 'featured'
      ? featuredProducts.length > 0
        ? featuredProducts.slice(0, 8)
        : products.slice(0, 8)
      : newArrivals;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header with Category Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#EAE3D2] pb-6">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C5A880] block">
            Zanaat & Tasarım
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
            {featuredTitle}
          </h2>
        </div>

        {/* Showcase Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'featured', label: 'Öne Çıkanlar', icon: Flame },
            { id: 'new', label: 'Yeni Tasarımlar', icon: Sparkles },
            { id: 'all', label: 'Tüm Koleksiyon', icon: Package },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'all' | 'featured' | 'new')}
                className={`px-4 py-2 rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer flex-shrink-0 ${
                  isActive
                    ? 'bg-[#C5A880] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-neutral-700 hover:bg-[#F4EFE6] border border-[#EAE3D2]'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-[#C5A880]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* View Catalog Button */}
      <div className="text-center pt-4">
        <Link
          href="/katalog"
          className="inline-flex items-center gap-2.5 border border-[#C5A880] text-[#B4966E] hover:bg-[#C5A880] hover:text-white text-xs font-bold tracking-widest uppercase py-3.5 px-8 transition-all rounded-xs shadow-xs"
        >
          <span>2026 Kataloğunu İnceleyin</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
