'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Timer, Zap, ShoppingBag, Heart, ArrowRight } from 'lucide-react';
import { useCMSStore } from '../stores/useCMSStore';
import { useCartStore } from '../stores/useCartStore';
import { useFavoritesStore } from '../stores/useFavoritesStore';
import type { Product, ProductImages } from '../types';

export const FlashDeals: React.FC = () => {
  const products = useCMSStore((state) => state.products);
  const addToCart = useCartStore((state) => state.addToCart);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  // Filter products with discount or deal badge
  const dealProducts = products.filter((p) => p.originalPrice && p.originalPrice > p.price).slice(0, 4);

  // Fallback to first 4 products if no explicit discount products
  const displayProducts = dealProducts.length > 0 ? dealProducts : products.slice(0, 4);

  // Countdown timer state (e.g. 08:42:15)
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 42, seconds: 15 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.hours === 0 && prev.minutes === 0 && prev.seconds === 0) {
          return { hours: 0, minutes: 0, seconds: 0 };
        }
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(price).replace('TRY', 'TL');
  };

  const getProductImage = (product: Product): string => {
    if (product.images && typeof product.images === 'object' && 'main' in product.images) {
      return (product.images as ProductImages).main;
    }
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    return product.image || '';
  };

  if (displayProducts.length === 0) return null;

  return (
    <section className="py-10 md:py-14 bg-[#FBF9F5] border-y border-[#EAE3D2] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* Clean Header Bar with Countdown Timer */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5DEC9] pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-[#C5A880]/15 text-[#B4966E] border border-[#C5A880]/30">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#C5A880]">
                  Günün Fırsatları
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#C5A880] text-white">
                  FLASHSALE
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-800 mt-0.5">
                Kaçırılmayacak İndirim Fırsatları
              </h2>
            </div>
          </div>

          {/* Clean Light Countdown Timer */}
          <div className="flex items-center gap-2.5 bg-white border border-[#E5DEC9] rounded-xs px-4 py-2 shadow-xs">
            <Timer className="h-4 w-4 text-[#C5A880]" />
            <span className="text-xs uppercase tracking-wider font-semibold text-neutral-600">Süre:</span>
            <div className="flex items-center gap-1 font-mono font-extrabold text-sm text-neutral-800">
              <span className="bg-[#FBF9F5] text-[#B4966E] px-2 py-1 rounded-xs border border-[#E5DEC9]">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[#C5A880]">:</span>
              <span className="bg-[#FBF9F5] text-[#B4966E] px-2 py-1 rounded-xs border border-[#E5DEC9]">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[#C5A880]">:</span>
              <span className="bg-[#C5A880] text-white px-2 py-1 rounded-xs animate-pulse">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Product Cards Grid - Clean Warm Palette */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product) => {
            const origPrice = product.originalPrice || Math.round(product.price * 1.25);
            const discountPercent = Math.round(((origPrice - product.price) / origPrice) * 100);
            const fav = isFavorite(product.id);

            return (
              <div
                key={product.id}
                className="group relative bg-white border border-[#E5DEC9] hover:border-[#C5A880] rounded-xs overflow-hidden transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] bg-[#F9F7F2] overflow-hidden">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Discount Badge */}
                    <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
                      <span className="bg-[#C5A880] text-white font-extrabold text-xs px-2.5 py-1 rounded-xs uppercase tracking-wider shadow-xs">
                        %{discountPercent} İNDİRİM
                      </span>
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(product)}
                      className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm border border-[#E5DEC9] shadow-xs transition-all duration-300 hover:scale-110 cursor-pointer ${
                        fav ? 'text-rose-500' : 'text-neutral-400 hover:text-[#C5A880]'
                      }`}
                      aria-label="Favorilere Ekle"
                    >
                      <Heart className={`h-4 w-4 ${fav ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-[#B4966E] tracking-widest block">
                      Stoklarla Sınırlı Fırsat
                    </span>
                    <Link
                      href={`/urun/${product.id}`}
                      className="font-semibold text-sm text-neutral-800 hover:text-[#C5A880] transition-colors line-clamp-1 block"
                    >
                      {product.name}
                    </Link>

                    {/* Prices */}
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-base font-extrabold text-[#C87A53]">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-xs text-neutral-400 line-through">
                        {formatPrice(origPrice)}
                      </span>
                    </div>

                    {/* Stock Progress Bar */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-1">
                        <span>Hızlı Teslimat</span>
                        <span className="text-[#C87A53] font-bold">Son 3 Ürün</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#F4EFE6] rounded-full overflow-hidden">
                        <div className="w-[75%] h-full bg-[#C5A880] rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Button */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => addToCart(product, 1)}
                    className="w-full bg-[#C5A880] hover:bg-[#B4966E] text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Hemen Sepete Ekle</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* View all deal products CTA */}
        <div className="text-center pt-2">
          <Link
            href="/indirimler"
            className="inline-flex items-center gap-2 border border-[#C5A880] text-[#B4966E] hover:bg-[#C5A880] hover:text-white text-xs font-bold uppercase tracking-widest py-3 px-8 rounded-xs transition-all"
          >
            <span>Tüm Fırsat Ürünlerini Gör</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default FlashDeals;
